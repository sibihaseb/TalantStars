import { automatedTesting } from './automated-testing';
import { storage } from './simple-storage';
import { db } from './db';
import { profileQuestions } from '@shared/schema';

interface MonitoringAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
  details?: any;
}

interface SystemMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  database: {
    connected: boolean;
    questionCount: number;
    lastQuery: Date;
  };
  authentication: {
    activeUsers: number;
    lastLogin: Date | null;
  };
  errors: MonitoringAlert[];
}

class MonitoringSystem {
  private alerts: MonitoringAlert[] = [];
  private maxAlerts = 100;
  private testInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private lastMetrics: SystemMetrics | null = null;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    console.log('🔍 Starting monitoring system...');
    
    // Run automated tests every 10 minutes
    this.testInterval = setInterval(async () => {
      try {
        const results = await automatedTesting.runAllTests();
        const failedTests = results.filter(r => r.status === 'FAIL');
        
        if (failedTests.length > 0) {
          this.addAlert('warning', 'Automated tests failed', 'testing-system', {
            failedTests: failedTests.length,
            totalTests: results.length
          });
        }
      } catch (error) {
        this.addAlert('error', 'Automated testing failed to run', 'testing-system', { error: error.message });
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Collect metrics every 5 minutes
    this.metricsInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        this.addAlert('error', 'Metrics collection failed', 'monitoring-system', { error: error.message });
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Initial metrics collection
    this.collectMetrics();
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics: SystemMetrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: await this.getDatabaseMetrics(),
        authentication: await this.getAuthenticationMetrics(),
        errors: this.alerts.filter(a => a.level === 'error' || a.level === 'critical')
      };

      this.lastMetrics = metrics;
      
      // Check for issues
      await this.checkMetricsForIssues(metrics);
      
    } catch (error) {
      this.addAlert('error', 'Failed to collect metrics', 'monitoring-system', { error: error.message });
    }
  }

  private async getDatabaseMetrics(): Promise<SystemMetrics['database']> {
    try {
      const questions = await db.select().from(profileQuestions);
      
      return {
        connected: true,
        questionCount: questions.length,
        lastQuery: new Date()
      };
    } catch (error) {
      return {
        connected: false,
        questionCount: 0,
        lastQuery: new Date()
      };
    }
  }

  private async getAuthenticationMetrics(): Promise<SystemMetrics['authentication']> {
    try {
      const users = await storage.getUsers();
      
      return {
        activeUsers: users.length,
        lastLogin: users.length > 0 ? new Date(Math.max(...users.map(u => new Date(u.updatedAt).getTime()))) : null
      };
    } catch (error) {
      return {
        activeUsers: 0,
        lastLogin: null
      };
    }
  }

  private async checkMetricsForIssues(metrics: SystemMetrics): Promise<void> {
    // Check memory usage
    const memoryUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      this.addAlert('warning', `High memory usage: ${memoryUsagePercent.toFixed(1)}%`, 'metrics-monitor', {
        memoryUsage: metrics.memory
      });
    }

    // Check database connection
    if (!metrics.database.connected) {
      this.addAlert('critical', 'Database connection lost', 'metrics-monitor', {
        lastQuery: metrics.database.lastQuery
      });
    }

    // Check if we have questions in database
    if (metrics.database.questionCount === 0) {
      this.addAlert('error', 'No profile questions found in database', 'metrics-monitor', {
        questionCount: metrics.database.questionCount
      });
    }

    // Check for recent errors
    const recentErrors = this.alerts.filter(a => 
      (a.level === 'error' || a.level === 'critical') && 
      Date.now() - a.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentErrors.length > 5) {
      this.addAlert('critical', 'High error rate detected', 'metrics-monitor', {
        errorCount: recentErrors.length,
        timeWindow: '5 minutes'
      });
    }
  }

  public addAlert(level: MonitoringAlert['level'], message: string, source: string, details?: any): void {
    const alert: MonitoringAlert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date(),
      source,
      details
    };

    this.alerts.unshift(alert);
    
    // Keep only the latest alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Log critical and error alerts
    if (level === 'critical' || level === 'error') {
      console.error(`🚨 ${level.toUpperCase()}: ${message}`, details ? JSON.stringify(details) : '');
    } else if (level === 'warning') {
      console.warn(`⚠️ WARNING: ${message}`, details ? JSON.stringify(details) : '');
    }

    // Auto-trigger fixes for critical issues
    if (level === 'critical') {
      this.triggerAutoFix(alert);
    }
  }

  private async triggerAutoFix(alert: MonitoringAlert): Promise<void> {
    console.log(`🔧 Triggering auto-fix for critical alert: ${alert.message}`);
    
    try {
      // Run automated tests to identify and fix issues
      const results = await automatedTesting.runAllTests();
      const fixedCount = results.filter(r => r.status === 'FIXED').length;
      
      if (fixedCount > 0) {
        this.addAlert('info', `Auto-fix completed: ${fixedCount} issues resolved`, 'auto-fix-system', {
          originalAlert: alert.id,
          fixedCount
        });
      }
    } catch (error) {
      this.addAlert('error', 'Auto-fix failed', 'auto-fix-system', {
        originalAlert: alert.id,
        error: error.message
      });
    }
  }

  public getAlerts(level?: MonitoringAlert['level']): MonitoringAlert[] {
    if (level) {
      return this.alerts.filter(a => a.level === level);
    }
    return this.alerts;
  }

  public getMetrics(): SystemMetrics | null {
    return this.lastMetrics;
  }

  public clearAlerts(): void {
    this.alerts = [];
  }

  public stop(): void {
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    console.log('🛑 Monitoring system stopped');
  }

  public async runHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics | null;
    alerts: MonitoringAlert[];
    recommendations: string[];
  }> {
    const metrics = await this.collectMetrics();
    const criticalAlerts = this.alerts.filter(a => a.level === 'critical');
    const warningAlerts = this.alerts.filter(a => a.level === 'warning');
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];
    
    if (criticalAlerts.length > 0) {
      status = 'critical';
      recommendations.push('Immediate attention required for critical alerts');
    } else if (warningAlerts.length > 0) {
      status = 'warning';
      recommendations.push('Review and address warning alerts');
    }
    
    // Add specific recommendations
    if (this.lastMetrics) {
      const memoryUsage = (this.lastMetrics.memory.heapUsed / this.lastMetrics.memory.heapTotal) * 100;
      if (memoryUsage > 70) {
        recommendations.push('Consider optimizing memory usage or increasing server resources');
      }
      
      if (!this.lastMetrics.database.connected) {
        recommendations.push('Database connection needs to be restored');
      }
      
      if (this.lastMetrics.database.questionCount === 0) {
        recommendations.push('Database needs to be seeded with profile questions');
      }
    }
    
    return {
      status,
      metrics: this.lastMetrics,
      alerts: this.alerts.slice(0, 20), // Return latest 20 alerts
      recommendations
    };
  }
}

// Export singleton instance
export const monitoring = new MonitoringSystem();

// Graceful shutdown
process.on('SIGTERM', () => {
  monitoring.stop();
});

process.on('SIGINT', () => {
  monitoring.stop();
});