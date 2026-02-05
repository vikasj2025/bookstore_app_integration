import React, { useState, useEffect } from 'react';
import { Page } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { withAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { monitoringService } from '@/services/monitoring';
import { bootstrapService } from '@/services/bootstrap';
import {
  ChartBarIcon,
  CloudArrowDownIcon,
  CogIcon,
  ServerStackIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';

interface DashboardStats {
  totalBootstraps: number;
  successfulBootstraps: number;
  activeBuilds: number;
  cacheHitRate: number;
  systemHealth: 'UP' | 'DOWN' | 'DEGRADED';
}

interface RecentActivity {
  id: string;
  type: 'bootstrap' | 'download' | 'build';
  status: 'completed' | 'failed' | 'running';
  description: string;
  timestamp: string;
}

function QuickActions() {
  return (
    <Card>
      <CardHeader title="Quick Actions" />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/configuration">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<PlayIcon className="h-4 w-4" />}
            >
              New Bootstrap
            </Button>
          </Link>
          
          <Link href="/configuration">
            <Button
              variant="secondary"
              fullWidth
              leftIcon={<CogIcon className="h-4 w-4" />}
            >
              Configuration
            </Button>
          </Link>
          
          <Link href="/downloads">
            <Button
              variant="secondary"
              fullWidth
              leftIcon={<CloudArrowDownIcon className="h-4 w-4" />}
            >
              Downloads
            </Button>
          </Link>
          
          <Link href="/monitoring">
            <Button
              variant="secondary"
              fullWidth
              leftIcon={<ChartBarIcon className="h-4 w-4" />}
            >
              Monitoring
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsOverview({ stats }: { stats: DashboardStats }) {
  const successRate = stats.totalBootstraps > 0 
    ? Math.round((stats.successfulBootstraps / stats.totalBootstraps) * 100)
    : 0;

  const statItems = [
    {
      label: 'Total Bootstraps',
      value: stats.totalBootstraps.toLocaleString(),
      icon: PlayIcon,
      color: 'text-primary-600',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: ChartBarIcon,
      color: successRate >= 90 ? 'text-success-600' : successRate >= 70 ? 'text-warning-600' : 'text-error-600',
    },
    {
      label: 'Active Builds',
      value: stats.activeBuilds.toString(),
      icon: ServerStackIcon,
      color: 'text-primary-600',
    },
    {
      label: 'Cache Hit Rate',
      value: `${Math.round(stats.cacheHitRate * 100)}%`,
      icon: ServerStackIcon,
      color: stats.cacheHitRate >= 0.8 ? 'text-success-600' : 'text-warning-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SystemStatus({ health }: { health: 'UP' | 'DOWN' | 'DEGRADED' }) {
  const statusMap = {
    UP: { status: 'success' as const, text: 'All Systems Operational' },
    DOWN: { status: 'error' as const, text: 'System Outage' },
    DEGRADED: { status: 'warning' as const, text: 'Degraded Performance' },
  };

  const { status, text } = statusMap[health];

  return (
    <Card>
      <CardHeader title="System Status" />
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-900">{text}</p>
            <p className="text-sm text-gray-500">
              Last updated: {format(new Date(), 'PPp')}
            </p>
          </div>
          <StatusBadge status={status} text={health} size="lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card>
      <CardHeader 
        title="Recent Activity" 
        action={
          <Link href="/monitoring">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        }
      />
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(activity.timestamp), 'PPp')}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <StatusBadge status={activity.status} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBootstraps: 0,
    successfulBootstraps: 0,
    activeBuilds: 0,
    cacheHitRate: 0,
    systemHealth: 'UP',
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { subscribe } = useWebSocket();

  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load metrics and health data
        const [metricsResponse, healthResponse, buildsResponse, cacheResponse] = await Promise.all([
          monitoringService.getMetrics({ timeRange: '24h' }),
          monitoringService.getHealthStatus(),
          monitoringService.getBuildMonitoring({ limit: 5 }),
          monitoringService.getCacheStatus(),
        ]);
        
        // Calculate stats
        const totalBootstraps = metricsResponse.metrics.bootstrap_operations?.total || 0;
        const successfulBuilds = buildsResponse.summary.completed;
        const totalBuilds = buildsResponse.summary.completed + buildsResponse.summary.failed;
        const successfulBootstraps = totalBuilds > 0 ? Math.round((successfulBuilds / totalBuilds) * totalBootstraps) : 0;
        
        setStats({
          totalBootstraps,
          successfulBootstraps,
          activeBuilds: buildsResponse.summary.running,
          cacheHitRate: cacheResponse.hitRate,
          systemHealth: healthResponse.status,
        });
        
        // Convert builds to activities
        const recentActivities: RecentActivity[] = buildsResponse.builds.slice(0, 5).map(build => ({
          id: build.buildId,
          type: 'build',
          status: build.status === 'completed' ? 'completed' : build.status === 'failed' ? 'failed' : 'running',
          description: `Build for project ${build.projectId}`,
          timestamp: build.startTime,
        }));
        
        setActivities(recentActivities);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeHealth = subscribe('health_update', (data) => {
      setStats(prev => ({ ...prev, systemHealth: data.status }));
    });
    
    const unsubscribeMetrics = subscribe('metrics_update', (data) => {
      if (data.metrics.bootstrap_operations) {
        setStats(prev => ({
          ...prev,
          totalBootstraps: data.metrics.bootstrap_operations.total || 0,
        }));
      }
    });
    
    const unsubscribeBuild = subscribe('build_update', (data) => {
      const newActivity: RecentActivity = {
        id: data.buildId,
        type: 'build',
        status: data.status,
        description: `Build for project ${data.projectId}`,
        timestamp: new Date().toISOString(),
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    });
    
    return () => {
      unsubscribeHealth();
      unsubscribeMetrics();
      unsubscribeBuild();
    };
  }, [subscribe]);

  if (loading) {
    return (
      <Page title="Dashboard" subtitle="Maven Wrapper Bootstrap System Overview">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page 
      title="Dashboard" 
      subtitle="Maven Wrapper Bootstrap System Overview"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Stats Overview */}
        <StatsOverview stats={stats} />
        
        {/* System Status and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemStatus health={stats.systemHealth} />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </Page>
  );
}

export default withAuth(Dashboard);
