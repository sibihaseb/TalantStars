import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Trash2, Eye } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function DebugLogs() {
  const { data: allLogs, isLoading: allLogsLoading } = useQuery({
    queryKey: ['/api/debug/logs'],
    queryFn: () => fetch('/api/debug/logs?count=200').then(res => res.json()),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: mediaLogs, isLoading: mediaLogsLoading } = useQuery({
    queryKey: ['/api/debug/logs/media'],
    queryFn: () => fetch('/api/debug/logs/media').then(res => res.json()),
    refetchInterval: 5000,
  });

  const { data: authLogs, isLoading: authLogsLoading } = useQuery({
    queryKey: ['/api/debug/logs/auth'],
    queryFn: () => fetch('/api/debug/logs/auth').then(res => res.json()),
    refetchInterval: 5000,
  });

  const clearLogs = async () => {
    await apiRequest('DELETE', '/api/debug/logs');
    queryClient.invalidateQueries({ queryKey: ['/api/debug/logs'] });
  };

  const refreshLogs = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/debug/logs'] });
  };

  const formatLogEntry = (log: any) => {
    return (
      <div key={log.timestamp} className="p-4 border rounded-lg mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={
              log.level === 'ERROR' ? 'destructive' : 
              log.level === 'WARN' ? 'secondary' : 
              'default'
            }>
              {log.level}
            </Badge>
            <Badge variant="outline">{log.category}</Badge>
            <span className="text-sm text-muted-foreground">{log.timestamp}</span>
          </div>
          {log.userId && (
            <Badge variant="outline">User: {log.userId}</Badge>
          )}
        </div>
        <div className="text-sm font-medium mb-1">{log.message}</div>
        {log.data && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <pre>{JSON.stringify(log.data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Debug Logs</h1>
          <p className="text-muted-foreground">Real-time application debugging and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearLogs} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Logs ({allLogs?.totalCount || 0})</TabsTrigger>
          <TabsTrigger value="media">Media Logs ({mediaLogs?.totalCount || 0})</TabsTrigger>
          <TabsTrigger value="auth">Auth Logs ({authLogs?.totalCount || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                All System Logs
              </CardTitle>
              <CardDescription>
                Complete log of all system activities including API requests, authentication, and media operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {allLogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div>
                    {allLogs?.logs?.map(formatLogEntry) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No logs available
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Media Upload Logs
              </CardTitle>
              <CardDescription>
                Detailed logs of media upload operations, file processing, and S3 storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {mediaLogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div>
                    {mediaLogs?.logs?.map(formatLogEntry) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No media logs available
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Authentication Logs
              </CardTitle>
              <CardDescription>
                User authentication attempts, session management, and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {authLogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div>
                    {authLogs?.logs?.map(formatLogEntry) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No auth logs available
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}