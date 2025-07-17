import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Settings, Activity, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'FIXED';
  error?: string;
  details?: any;
  fixApplied?: string;
}

interface TestingReport {
  message: string;
  results: TestResult[];
  report: string;
  timestamp: string;
}

interface HealthCheck {
  status: 'healthy' | 'warning' | 'critical';
  metrics: any;
  alerts: any[];
  recommendations: string[];
}

const AutomatedTesting: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for test results
  const { data: testResults, isLoading: testResultsLoading } = useQuery({
    queryKey: ['/api/admin/test-results'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Query for health check
  const { data: healthCheck, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/monitoring/health'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Query for system health
  const { data: systemHealth } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000,
  });

  // Mutation to run tests
  const runTestsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/run-tests', { method: 'POST' }),
    onSuccess: (data: TestingReport) => {
      toast({
        title: "Tests Completed",
        description: `${data.results.filter(r => r.status === 'PASS').length} tests passed, ${data.results.filter(r => r.status === 'FAIL').length} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/test-results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/monitoring/health'] });
    },
    onError: (error) => {
      toast({
        title: "Test Run Failed",
        description: "Failed to run automated tests",
        variant: "destructive",
      });
    },
  });

  // Mutation to clear alerts
  const clearAlertsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/monitoring/clear-alerts', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Alerts Cleared",
        description: "All monitoring alerts have been cleared",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/monitoring/health'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAIL':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'FIXED':
        return <Settings className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800';
      case 'FAIL':
        return 'bg-red-100 text-red-800';
      case 'FIXED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSuccessRate = (results: TestResult[]) => {
    const passed = results.filter(r => r.status === 'PASS' || r.status === 'FIXED').length;
    return ((passed / results.length) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Automated Testing & Monitoring</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => runTestsMutation.mutate()}
            disabled={runTestsMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${runTestsMutation.isPending ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
          <Button
            onClick={() => clearAlertsMutation.mutate()}
            disabled={clearAlertsMutation.isPending}
            variant="outline"
          >
            Clear Alerts
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {systemHealth?.status === 'healthy' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <Badge className={getHealthColor(systemHealth?.status || 'unknown')}>
                {systemHealth?.status || 'Unknown'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Database: {systemHealth?.database || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults?.results ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {calculateSuccessRate(testResults.results)}%
                </div>
                <p className="text-sm text-gray-600">
                  {testResults.results.filter(r => r.status === 'PASS').length} passed, {' '}
                  {testResults.results.filter(r => r.status === 'FAIL').length} failed
                </p>
              </div>
            ) : (
              <div className="text-gray-500">No results yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            {healthCheck ? (
              <div className="space-y-1">
                <Badge className={getHealthColor(healthCheck.status)}>
                  {healthCheck.status}
                </Badge>
                <p className="text-sm text-gray-600">
                  {healthCheck.alerts?.length || 0} alerts
                </p>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Results Detail */}
      {testResults?.results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.testName}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    {result.error && (
                      <p className="text-sm text-red-600 mb-1">{result.error}</p>
                    )}
                    {result.fixApplied && (
                      <p className="text-sm text-blue-600 mb-1">Fix: {result.fixApplied}</p>
                    )}
                    {result.details && (
                      <details className="text-sm text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">Details</summary>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Check Recommendations */}
      {healthCheck?.recommendations && healthCheck.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthCheck.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {healthCheck?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Database</h4>
                <div className="space-y-1 text-sm">
                  <div>Status: {healthCheck.metrics.database?.connected ? 'Connected' : 'Disconnected'}</div>
                  <div>Questions: {healthCheck.metrics.database?.questionCount || 0}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">System</h4>
                <div className="space-y-1 text-sm">
                  <div>Uptime: {Math.floor((healthCheck.metrics.uptime || 0) / 60)} minutes</div>
                  <div>Memory: {Math.round((healthCheck.metrics.memory?.heapUsed || 0) / 1024 / 1024)} MB</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutomatedTesting;