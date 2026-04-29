'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Plus,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface DashboardStats {
  totalStudents: number;
  activeSubscriptions: number;
  totalRevenue: number;
  occupancyRate: number;
  pendingPayments: number;
  expiringThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: 'NEW_BOOKING' | 'RENEWAL' | 'EXPIRY' | 'PAYMENT';
  studentName: string;
  seatNo: number;
  floorName: string;
  amount?: number;
  timestamp: string;
}

export default function DashboardClient() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/activities'),
        ]);

        if (!statsRes.ok || !activitiesRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsData = await statsRes.json();
        const activitiesData = await activitiesRes.json();

        setStats(statsData.data);
        setActivities(activitiesData.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color,
    onClick,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size: number; className?: string }>;
    trend?: number;
    color: 'emerald' | 'blue' | 'orange' | 'purple';
    onClick?: () => void;
  }) => {
    const colorClasses = {
      emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    };

    return (
      <Card
        className={`border ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
              {trend !== undefined && (
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                  {trend >= 0 ? (
                    <>
                      <ArrowUp size={14} className="text-emerald-600" />
                      <span className="text-emerald-600">{trend}% this month</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown size={14} className="text-red-600" />
                      <span className="text-red-600">{Math.abs(trend)}% this month</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="w-4 h-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="emerald"
            onClick={() => router.push('/student')}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={BarChart3}
            color="orange"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${(stats.occupancyRate || 0).toFixed(1)}%`}
            icon={Calendar}
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Cards */}
          {stats && (stats.pendingPayments > 0 || stats.expiringThisMonth > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.pendingPayments > 0 && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <AlertCircle size={20} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-amber-700">
                          {stats.pendingPayments} Pending Payment{stats.pendingPayments > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Collection needed from members
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 h-8 text-amber-600 hover:bg-amber-600/10"
                          onClick={() => router.push('/history')}
                        >
                          View Members
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.expiringThisMonth > 0 && (
                <Card className="border-orange-500/30 bg-orange-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Calendar size={20} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-700">
                          {stats.expiringThisMonth} Expiring This Month
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Subscriptions set to expire soon
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 h-8 text-orange-600 hover:bg-orange-600/10"
                          onClick={() => router.push('/seat-map')}
                        >
                          Check Seats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="gap-2 h-10"
                  onClick={() => router.push('/seat-map')}
                >
                  <Plus size={16} />
                  New Booking
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-10"
                  onClick={() => router.push('/student')}
                >
                  <Users size={16} />
                  View Students
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="shadow-sm lg:h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'NEW_BOOKING' ? 'bg-emerald-500/10 text-emerald-600' :
                      activity.type === 'RENEWAL' ? 'bg-blue-500/10 text-blue-600' :
                      activity.type === 'EXPIRY' ? 'bg-red-500/10 text-red-600' :
                      'bg-purple-500/10 text-purple-600'
                    }`}>
                      <TrendingUp size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {activity.studentName}
                        </p>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {activity.type === 'NEW_BOOKING' ? 'New Booking' :
                           activity.type === 'RENEWAL' ? 'Renewed' :
                           activity.type === 'EXPIRY' ? 'Expired' :
                           'Payment'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seat {activity.seatNo} • {activity.floorName}
                      </p>
                      {activity.amount && (
                        <p className="text-xs font-semibold text-foreground mt-1">
                          ₹{activity.amount.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activities
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}