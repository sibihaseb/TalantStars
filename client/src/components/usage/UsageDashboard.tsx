import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Video, 
  Music, 
  Link, 
  Crown, 
  TrendingUp, 
  Database,
  HardDrive,
  Users,
  Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UsageStats {
  photos: { current: number; limit: number; };
  videos: { current: number; limit: number; };
  audio: { current: number; limit: number; };
  externalLinks: { current: number; limit: number; };
  storage: { current: number; limit: number; unit: string; };
  tierName: string;
  tierCategory: string;
}

export default function UsageDashboard() {
  const { user } = useAuth();
  
  const { data: usage, isLoading } = useQuery<UsageStats>({
    queryKey: ['/api/user/usage'],
    enabled: !!user,
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
  console.log("Usage Data:", usage);
  if (!usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No usage data available</p>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageIcon = (type: string) => {
    switch (type) {
      case 'photos': return <Camera className="h-5 w-5" />;
      case 'videos': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'links': return <Link className="h-5 w-5" />;
      case 'storage': return <HardDrive className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  const formatStorageSize = (bytes: number, unit: string) => {
    if (unit === 'GB') {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (unit === 'MB') {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${bytes} bytes`;
  };

  const usageItems = [
    {
      key: 'photos',
      title: 'Photos',
      current: usage.photos.current,
      limit: usage.photos.limit,
      icon: getUsageIcon('photos'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      key: 'videos',
      title: 'Videos',
      current: usage.videos.current,
      limit: usage.videos.limit,
      icon: getUsageIcon('videos'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      key: 'audio',
      title: 'Audio Files',
      current: usage.audio.current,
      limit: usage.audio.limit,
      icon: getUsageIcon('audio'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      key: 'links',
      title: 'External Links',
      current: usage.externalLinks.current,
      limit: usage.externalLinks.limit,
      icon: getUsageIcon('links'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your plan usage and limits
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Crown className="h-4 w-4 mr-1" />
          {usage.tierName}
        </Badge>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {usageItems.map((item) => (
          <Card key={item.key} className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <div className={item.color}>{item.icon}</div>
                </div>
                <Badge variant={item.current >= item.limit ? 'destructive' : 'secondary'}>
                  {item.current}/{item.limit}
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">
                    {item.limit > 0 ? Math.round((item.current / item.limit) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={item.limit > 0 ? (item.current / item.limit) * 100 : 0}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {item.limit - item.current} remaining
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Your current storage consumption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {formatStorageSize(usage.storage.current, usage.storage.unit)} of{' '}
                {formatStorageSize(usage.storage.limit, usage.storage.unit)}
              </span>
              <Badge variant="outline">
                {usage.storage.limit > 0 ? Math.round((usage.storage.current / usage.storage.limit) * 100) : 0}% used
              </Badge>
            </div>
            <Progress
              value={usage.storage.limit > 0 ? (usage.storage.current / usage.storage.limit) * 100 : 0}
              className="h-3"
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-blue-600">
                  {formatStorageSize(usage.storage.current * 0.6, usage.storage.unit)}
                </p>
                <p className="text-muted-foreground">Images</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-purple-600">
                  {formatStorageSize(usage.storage.current * 0.3, usage.storage.unit)}
                </p>
                <p className="text-muted-foreground">Videos</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">
                  {formatStorageSize(usage.storage.current * 0.1, usage.storage.unit)}
                </p>
                <p className="text-muted-foreground">Audio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {(usage.photos.current / usage.photos.limit > 0.8 || 
        usage.videos.current / usage.videos.limit > 0.8 || 
        usage.storage.current / usage.storage.limit > 0.8) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Approaching Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    You're close to your plan limits. Consider upgrading for more features.
                  </p>
                </div>
              </div>
              <Button onClick={() => window.location.href = '/pricing'}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}