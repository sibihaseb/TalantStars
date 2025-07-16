import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Database, 
  TrendingUp, 
  HardDrive,
  Camera,
  Video,
  Music,
  Link,
  Download,
  RefreshCw,
  Crown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlatformUsage {
  totalUsers: number;
  activeUsers: number;
  totalStorage: { current: number; limit: number; unit: string; };
  totalUploads: {
    photos: number;
    videos: number;
    audio: number;
    externalLinks: number;
  };
  tierBreakdown: {
    tierName: string;
    userCount: number;
    storageUsed: number;
    percentage: number;
  }[];
  topUsers: {
    id: number;
    username: string;
    tierName: string;
    storageUsed: number;
    uploadCount: number;
    lastActive: string;
  }[];
  usageByType: {
    talent: { users: number; storage: number; };
    manager: { users: number; storage: number; };
    producer: { users: number; storage: number; };
    admin: { users: number; storage: number; };
  };
  recentActivity: {
    date: string;
    uploads: number;
    newUsers: number;
    storageUsed: number;
  }[];
}

export default function AdminUsageAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [userType, setUserType] = useState('all');
  
  const { data: usage, isLoading, refetch } = useQuery<PlatformUsage>({
    queryKey: ['/api/admin/usage-analytics', timeRange, userType],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No usage data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatStorageSize = (bytes: number, unit: string = 'GB') => {
    if (unit === 'GB') {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (unit === 'MB') {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${bytes} bytes`;
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Usage Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive usage statistics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="talent">Talent</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="producer">Producer</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-blue-600" />
              <Badge variant="outline">{usage.activeUsers} active</Badge>
            </div>
            <CardTitle className="text-2xl">{usage.totalUsers.toLocaleString()}</CardTitle>
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <HardDrive className="h-5 w-5 text-purple-600" />
              <Badge variant="outline">
                {Math.round((usage.totalStorage.current / usage.totalStorage.limit) * 100)}%
              </Badge>
            </div>
            <CardTitle className="text-2xl">
              {formatStorageSize(usage.totalStorage.current, usage.totalStorage.unit)}
            </CardTitle>
            <CardDescription>Storage Used</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Camera className="h-5 w-5 text-green-600" />
              <Badge variant="outline">
                {usage.totalUploads.photos + usage.totalUploads.videos + usage.totalUploads.audio}
              </Badge>
            </div>
            <CardTitle className="text-2xl">
              {usage.totalUploads.photos.toLocaleString()}
            </CardTitle>
            <CardDescription>Media Files</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <Badge variant="outline">
                {usage.recentActivity.length > 0 ? 
                  `+${usage.recentActivity[usage.recentActivity.length - 1].newUsers}` : '0'
                }
              </Badge>
            </div>
            <CardTitle className="text-2xl">
              {usage.recentActivity.reduce((sum, day) => sum + day.uploads, 0).toLocaleString()}
            </CardTitle>
            <CardDescription>Recent Uploads</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Tier Breakdown</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="types">User Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Storage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Storage</span>
                    <span className="text-sm">
                      {formatStorageSize(usage.totalStorage.current)} / {formatStorageSize(usage.totalStorage.limit)}
                    </span>
                  </div>
                  <Progress value={(usage.totalStorage.current / usage.totalStorage.limit) * 100} />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-blue-600">{usage.totalUploads.photos}</p>
                    <p className="text-muted-foreground">Photos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-purple-600">{usage.totalUploads.videos}</p>
                    <p className="text-muted-foreground">Videos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-green-600">{usage.totalUploads.audio}</p>
                    <p className="text-muted-foreground">Audio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usage.recentActivity.slice(-5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.uploads} uploads, {activity.newUsers} new users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatStorageSize(activity.storageUsed)}
                        </p>
                        <p className="text-xs text-muted-foreground">storage used</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Tier Breakdown</CardTitle>
              <CardDescription>User distribution and storage usage by tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usage.tierBreakdown.map((tier, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{tier.tierName}</span>
                      </div>
                      <Badge variant="outline">{tier.userCount} users</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Usage</span>
                        <span>{formatStorageSize(tier.storageUsed)}</span>
                      </div>
                      <Progress value={tier.percentage} />
                      <p className="text-xs text-muted-foreground">
                        {tier.percentage.toFixed(1)}% of total platform storage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Storage Usage</CardTitle>
              <CardDescription>Users consuming the most storage space</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usage.topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.tierName} • {user.uploadCount} uploads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatStorageSize(user.storageUsed)}</p>
                      <p className="text-xs text-muted-foreground">
                        Active {user.lastActive}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(usage.usageByType).map(([type, stats]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize">{type} Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Users</span>
                      <span className="font-medium">{stats.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="font-medium">{formatStorageSize(stats.storage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg per User</span>
                      <span className="font-medium">
                        {stats.users > 0 ? formatStorageSize(stats.storage / stats.users) : '0 GB'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}