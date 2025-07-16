import { subscriptionManager } from './subscription-management';

/**
 * Cron job system for automated tasks
 * Runs subscription management tasks at scheduled intervals
 */
export class CronJobManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  /**
   * Start the cron job system
   */
  start(): void {
    if (this.isRunning) {
      console.log('Cron job manager is already running');
      return;
    }
    
    console.log('Starting cron job manager...');
    this.isRunning = true;
    
    // Run daily subscription management tasks
    // In production, this would be a proper cron job, but for development we'll run it every hour
    this.intervalId = setInterval(async () => {
      try {
        console.log('Running scheduled subscription management tasks...');
        await subscriptionManager.runDailyTasks();
      } catch (error) {
        console.error('Error running scheduled tasks:', error);
      }
    }, 60 * 60 * 1000); // Run every hour (in production, change to 24 hours)
    
    // Run immediately on startup - disabled for now to prevent database connection issues
    // setTimeout(async () => {
    //   try {
    //     console.log('Running initial subscription management tasks...');
    //     await subscriptionManager.runDailyTasks();
    //   } catch (error) {
    //     console.error('Error running initial tasks:', error);
    //   }
    // }, 5000); // Wait 5 seconds after startup
    
    console.log('Cron job manager started successfully');
  }
  
  /**
   * Stop the cron job system
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Cron job manager is not running');
      return;
    }
    
    console.log('Stopping cron job manager...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('Cron job manager stopped successfully');
  }
  
  /**
   * Check if the cron job system is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
  
  /**
   * Manual trigger for subscription management tasks
   */
  async runSubscriptionTasks(): Promise<void> {
    console.log('Manually triggering subscription management tasks...');
    await subscriptionManager.runDailyTasks();
  }
}

// Export singleton instance
export const cronJobManager = new CronJobManager();