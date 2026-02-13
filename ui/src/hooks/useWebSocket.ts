import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, StatusUpdateMessage, ProgressUpdateMessage } from '@/types/api';

interface UseWebSocketOptions {
  url?: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  shouldReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  connectionStatus: 'Connecting' | 'Open' | 'Closing' | 'Closed';
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  sendJsonMessage: (message: object) => void;
  reconnect: () => void;
}

const useWebSocket = ({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
  protocols,
  onOpen,
  onClose,
  onError,
  onMessage,
  shouldReconnect = true,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
}: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closing' | 'Closed'>('Closed');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(shouldReconnect);
  const urlRef = useRef(url);

  // Update refs when props change
  useEffect(() => {
    shouldReconnectRef.current = shouldReconnect;
    urlRef.current = url;
  }, [shouldReconnect, url]);

  const connect = useCallback(() => {
    try {
      setConnectionStatus('Connecting');
      const ws = new WebSocket(urlRef.current, protocols);

      ws.onopen = (event) => {
        setConnectionStatus('Open');
        setReconnectCount(0);
        onOpen?.(event);
      };

      ws.onclose = (event) => {
        setConnectionStatus('Closed');
        setSocket(null);
        onClose?.(event);

        // Attempt to reconnect if enabled and not manually closed
        if (
          shouldReconnectRef.current &&
          event.code !== 1000 && // Normal closure
          reconnectCount < reconnectAttempts
        ) {
          const timeout = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval);
          reconnectTimeoutRef.current = timeout;
        }
      };

      ws.onerror = (event) => {
        setConnectionStatus('Closed');
        onError?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('Closed');
    }
  }, [protocols, onOpen, onClose, onError, onMessage, reconnectCount, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    shouldReconnectRef.current = false;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      setConnectionStatus('Closing');
      socket.close(1000, 'Manual disconnect');
    }
  }, [socket]);

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, [socket]);

  const sendJsonMessage = useCallback((message: object) => {
    sendMessage(JSON.stringify(message));
  }, [sendMessage]);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectCount(0);
    shouldReconnectRef.current = true;
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Initial connection
  useEffect(() => {
    connect();
    return disconnect;
  }, []);

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
    socket,
    connectionStatus,
    lastMessage,
    sendMessage,
    sendJsonMessage,
    reconnect,
  };
};

export default useWebSocket;

// Specialized hooks for specific message types
export const useStatusUpdates = (environmentId?: string) => {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdateMessage[]>([]);
  
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'STATUS_UPDATE') {
      const statusMessage = message as StatusUpdateMessage;
      if (!environmentId || statusMessage.data.environmentId === environmentId) {
        setStatusUpdates(prev => [...prev.slice(-9), statusMessage]); // Keep last 10 updates
      }
    }
  }, [environmentId]);

  const webSocket = useWebSocket({ onMessage: handleMessage });
  
  return {
    ...webSocket,
    statusUpdates,
    clearStatusUpdates: () => setStatusUpdates([]),
  };
};

export const useProgressUpdates = (operationId?: string) => {
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdateMessage[]>([]);
  const [currentProgress, setCurrentProgress] = useState<ProgressUpdateMessage | null>(null);
  
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'PROGRESS_UPDATE') {
      const progressMessage = message as ProgressUpdateMessage;
      if (!operationId || progressMessage.data.operationId === operationId) {
        setProgressUpdates(prev => [...prev.slice(-4), progressMessage]); // Keep last 5 updates
        setCurrentProgress(progressMessage);
      }
    }
  }, [operationId]);

  const webSocket = useWebSocket({ onMessage: handleMessage });
  
  return {
    ...webSocket,
    progressUpdates,
    currentProgress,
    clearProgressUpdates: () => {
      setProgressUpdates([]);
      setCurrentProgress(null);
    },
  };
};

// Hook for environment-specific real-time updates
export const useEnvironmentUpdates = (environmentId: string) => {
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);
  
  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Filter messages related to the specific environment
    if (
      (message.type === 'STATUS_UPDATE' && (message as StatusUpdateMessage).data.environmentId === environmentId) ||
      (message.type === 'PROGRESS_UPDATE' && message.data.environmentId === environmentId) ||
      message.type === 'ERROR' ||
      message.type === 'COMPLETION'
    ) {
      setUpdates(prev => [...prev.slice(-19), message]); // Keep last 20 updates
    }
  }, [environmentId]);

  const webSocket = useWebSocket({ onMessage: handleMessage });
  
  return {
    ...webSocket,
    updates,
    clearUpdates: () => setUpdates([]),
  };
};
