import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  lastMessage: WebSocketMessage | null;
  connectionAttempts: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.mavenbootstrap.com/ws',
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    connectionAttempts: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const token = getAuthToken();
    const socket = io(url, {
      auth: {
        token,
      },
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
    });

    socket.on('connect', () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        connectionAttempts: 0,
      }));
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
      onDisconnect?.();

      // Attempt to reconnect if disconnection was not intentional
      if (reason !== 'io client disconnect' && state.connectionAttempts < reconnectAttempts) {
        setState(prev => ({ ...prev, connectionAttempts: prev.connectionAttempts + 1 }));
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay * Math.pow(2, state.connectionAttempts)); // Exponential backoff
      }
    });

    socket.on('connect_error', (error) => {
      const wsError = new Error(`WebSocket connection failed: ${error.message}`);
      setState(prev => ({
        ...prev,
        error: wsError,
        isConnecting: false,
        connectionAttempts: prev.connectionAttempts + 1,
      }));
      onError?.(wsError);

      // Attempt to reconnect
      if (state.connectionAttempts < reconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay * Math.pow(2, state.connectionAttempts));
      }
    });

    // Handle generic messages
    socket.onAny((eventName, data) => {
      const message: WebSocketMessage = {
        type: eventName,
        data,
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({ ...prev, lastMessage: message }));
      onMessage?.(message);

      // Call registered handlers for this event type
      const handlers = messageHandlersRef.current.get(eventName);
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
    });

    socketRef.current = socket;
  }, [url, getAuthToken, onConnect, onDisconnect, onError, onMessage, reconnectAttempts, reconnectDelay, state.connectionAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionAttempts: 0,
    }));
  }, []);

  const sendMessage = useCallback((type: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data);
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((eventType: string, handler: (data: any) => void) => {
    if (!messageHandlersRef.current.has(eventType)) {
      messageHandlersRef.current.set(eventType, new Set());
    }
    messageHandlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = messageHandlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          messageHandlersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  const subscribeToBootstrapUpdates = useCallback((bootstrapId: string, handler: (data: any) => void) => {
    return subscribe(`bootstrap_update_${bootstrapId}`, handler);
  }, [subscribe]);

  const subscribeToBuildUpdates = useCallback((projectId: string, handler: (data: any) => void) => {
    return subscribe(`build_update_${projectId}`, handler);
  }, [subscribe]);

  const subscribeToMetricsUpdates = useCallback((handler: (data: any) => void) => {
    return subscribe('metrics_update', handler);
  }, [subscribe]);

  const subscribeToHealthUpdates = useCallback((handler: (data: any) => void) => {
    return subscribe('health_update', handler);
  }, [subscribe]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    subscribeToBootstrapUpdates,
    subscribeToBuildUpdates,
    subscribeToMetricsUpdates,
    subscribeToHealthUpdates,
  };
}

// Hook for bootstrap status updates
export function useBootstrapWebSocket(bootstrapId: string | null) {
  const [status, setStatus] = useState<any>(null);
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!bootstrapId || !isConnected) return;

    const unsubscribe = subscribe(`bootstrap_update_${bootstrapId}`, (data) => {
      setStatus(data);
    });

    return unsubscribe;
  }, [bootstrapId, isConnected, subscribe]);

  return { status, isConnected };
}

// Hook for build monitoring updates
export function useBuildMonitoringWebSocket(projectId?: string) {
  const [builds, setBuilds] = useState<any[]>([]);
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const eventType = projectId ? `build_update_${projectId}` : 'build_update';
    const unsubscribe = subscribe(eventType, (data) => {
      setBuilds(prev => {
        const updated = [...prev];
        const index = updated.findIndex(build => build.buildId === data.buildId);
        if (index >= 0) {
          updated[index] = data;
        } else {
          updated.unshift(data);
        }
        return updated.slice(0, 50); // Keep only latest 50 builds
      });
    });

    return unsubscribe;
  }, [projectId, isConnected, subscribe]);

  return { builds, isConnected };
}
