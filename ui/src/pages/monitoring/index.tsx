import React, { useState, useEffect } from 'react';
import { Page } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, Column } from '@/components/ui/Table';
import { withAuth } from '@/hooks/useAuth';
import { useBuildMonitoringWebSocket } from '@/hooks/useWebSocket';
import { monitoringService } from '@/services/monitoring';
import {
  MetricsResponse,
  BuildInfo,
  HealthResponse,
  CacheStatusResponse,
} from '@/types/api';
import {
  ChartBarIcon,
  ServerStackIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface MonitoringData {
  metrics: MetricsResponse | null;
  health: HealthResponse | null;
  cache: CacheStatusResponse | null;
  builds: BuildInfo[];
}

function MetricsChart({ metrics }: { metrics: MetricsResponse | null }) {
  if (!metrics?.metrics.response_times?.timeSeries) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No metrics data available
      </div>
    );
  }

  const data = metrics.metrics.response_times.timeSeries.map(point => ({
    time: format(new Date(point.timestamp), 'HH:mm'),
    responseTime: point.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)}ms`, 'Response Time']}
        />
        <Line 
          type="monotone" 
          dataKey="responseTime" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function OperationsChart({ metrics }: { metrics: MetricsResponse | null }) {
  if (!metrics) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No operations data available
      </div>
    );
  }

  const data = [
    {
      name: 'Downloads',
      value: metrics.metrics.downloads?.total || 0,
      color: '#3b82f6',
    },
    {
      name: 'Bootstraps',
      value: metrics.metrics.bootstrap_operations?.total || 0,
      color: '#10b981',
    },
    {
      name: 'Cache Hits',
      value: metrics.metrics.cache_hits?.total || 0,
      color: '#f59e0b',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SystemHealthCard({ health }: { health: HealthResponse | null }) {
  if (!health) {
    return (
      <Card>
        <CardHeader title="System Health" />
        <CardContent>
          <div className="animate-pulse h-32 bg-gray-200 rounded" />
        </CardContent>
      </Card>
    );
  }

  const statusMap = {
    UP: 'success' as const,
    DOWN: 'error' as const,
    DEGRADED: 'warning' as const,
  };

  return (
    <Card>
      <CardHeader title="System Health" />
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Overall Status</span>
            <StatusBadge status={statusMap[health.status]} text={health.status} size="lg" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Components</h4>
            {Object.entries(health.components).map(([name, component]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{name}</span>
                <StatusBadge 
                  status={component.status === 'UP' ? 'success' : 'error'} 
                  text={component.status} 
                  size="sm" 
                />
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500">
            Last updated: {format(new Date(health.timestamp), 'PPp')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CacheStatusCard({ cache }: { cache: CacheStatusResponse | null }) {
  if (!cache) {
    return (
      <Card>
        <CardHeader title="Cache Status" />
        <CardContent>
          <div className="animate-pulse h-32 bg-gray-200 rounded" />
        </CardContent>
      </Card>
    );
  }

  const efficiency = monitoringService.calculateCacheEfficiency(cache);
  
  const statusMap = {
    healthy: 'success' as const,
    degraded: 'warning' as const,
    offline: 'error' as const,
  };

  return (
    <Card>
      <CardHeader title="Cache Status" />
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Status</span>
            <StatusBadge status={statusMap[cache.status]} text={cache.status} size="lg" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">{efficiency.hitRatePercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">{efficiency.memoryUtilization.toFixed(1)}%</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Total Keys</p>
            <p className="text-lg font-semibold text-gray-900">{cache.totalKeys.toLocaleString()}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Efficiency</span>
            <StatusBadge 
              status={
                efficiency.efficiency === 'excellent' ? 'success' :
                efficiency.efficiency === 'good' ? 'success' :
                efficiency.efficiency === 'fair' ? 'warning' : 'error'
              }
              text={efficiency.efficiency}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BuildMonitoringTable({ builds }: { builds: BuildInfo[] }) {
  const columns: Column<BuildInfo>[] = [
    {
      key: 'buildId',
      title: 'Build ID',
      dataIndex: 'buildId',
      render: (value: string) => (
        <span className="font-mono text-sm">{value.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'projectId',
      title: 'Project',
      dataIndex: 'projectId',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value: string) => <StatusBadge status={value as any} size="sm" />,
    },
    {
      key: 'mavenVersion',
      title: 'Maven Version',
      dataIndex: 'mavenVersion',
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration',
      render: (value: number | undefined) => (
        value ? `${value}s` : '-'
      ),
    },
    {
      key: 'startTime',
      title: 'Started',
      dataIndex: 'startTime',
      render: (value: string) => format(new Date(value), 'PPp'),
    },
  ];

  return (
    <Card>
      <CardHeader title="Recent Builds" subtitle="Latest build operations and their status" />
      <CardContent>
        <Table
          columns={columns}
          data={builds}
          rowKey="buildId"
          size="sm"
          striped
        />
      </CardContent>
    </Card>
  );
}

function MonitoringPage() {
  const [data, setData] = useState<MonitoringData>({
    metrics: null,
    health: null,
    cache: null,
    builds: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('1h');
  
  const { builds: realtimeBuilds } = useBuildMonitoringWebSocket();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [metricsResponse, healthResponse, cacheResponse, buildsResponse] = await Promise.all([
          monitoringService.getMetrics({ timeRange }),
          monitoringService.getHealthStatus(),
          monitoringService.getCacheStatus(),
          monitoringService.getBuildMonitoring({ limit: 20 }),
        ]);
        
        setData({
          metrics: metricsResponse,
          health: healthResponse,
          cache: cacheResponse,
          builds: buildsResponse.builds,
        });
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [timeRange]);

  // Update builds with real-time data
  useEffect(() => {
    if (realtimeBuilds.length > 0) {
      setData(prev => ({
        ...prev,
        builds: [...realtimeBuilds, ...prev.builds.filter(
          build => !realtimeBuilds.find(rb => rb.buildId === build.buildId)
        )].slice(0, 20),
      }));
    }
  }, [realtimeBuilds]);

  const handleRefresh = async () => {
    setLoading(true);
    
    try {
      const [metricsResponse, healthResponse, cacheResponse] = await Promise.all([
        monitoringService.getMetrics({ timeRange }),
        monitoringService.getHealthStatus(),
        monitoringService.getCacheStatus(),
      ]);
      
      setData(prev => ({
        ...prev,
        metrics: metricsResponse,
        health: healthResponse,
        cache: cacheResponse,
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page 
      title="Monitoring" 
      subtitle="Real-time system monitoring and build status"
      action={
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <Button
            onClick={handleRefresh}
            loading={loading}
            variant="secondary"
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemHealthCard health={data.health} />
          <CacheStatusCard cache={data.cache} />
        </div>
        
        {/* Metrics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader 
              title="Response Times" 
              subtitle={`Average response time over ${timeRange}`}
            />
            <CardContent>
              <MetricsChart metrics={data.metrics} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader 
              title="Operations" 
              subtitle={`Total operations over ${timeRange}`}
            />
            <CardContent>
              <OperationsChart metrics={data.metrics} />
            </CardContent>
          </Card>
        </div>
        
        {/* Build Monitoring Table */}
        <BuildMonitoringTable builds={data.builds} />
      </div>
    </Page>
  );
}

export default withAuth(MonitoringPage);
