import { db } from './db';
import { users, pricingTiers, paymentTransactions } from '@shared/schema';
import { eq, and, lt, desc } from 'drizzle-orm';
import { sendEmail } from './email';
import { storage } from './storage';

interface SubscriptionNotification {
  type: 'renewal_reminder' | 'payment_failed' | 'grace_period_warning' | 'tier_downgrade_notice';
  daysUntilAction: number;
  userEmail: string;
  firstName: string;
  currentTier: string;
  nextBillingDate: string;
}

/**
 * Subscription Management System
 * Handles automatic renewal reminders, payment failures, and tier downgrades
 */
export class SubscriptionManager {
  
  /**
   * Send renewal reminder emails (7 days before renewal)
   */
  async sendRenewalReminders(): Promise<void> {
    console.log('Checking for upcoming renewals...');
    
    try {
      // Get all users with active subscriptions expiring in 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const upcomingRenewals = await db
        .select({
          user: users,
          tier: pricingTiers,
          lastPayment: paymentTransactions
        })
        .from(users)
        .leftJoin(pricingTiers, eq(users.pricingTierId, pricingTiers.id))
        .leftJoin(paymentTransactions, eq(paymentTransactions.userId, users.id))
        .where(
          and(
            eq(users.role, 'talent'), // Only check paying users
            lt(users.updatedAt, sevenDaysFromNow) // Approximate renewal date check
          )
        )
        .orderBy(desc(paymentTransactions.createdAt));
      
      for (const renewal of upcomingRenewals) {
        if (renewal.user.email && renewal.tier) {
          await this.sendRenewalReminderEmail({
            type: 'renewal_reminder',
            daysUntilAction: 7,
            userEmail: renewal.user.email,
            firstName: renewal.user.firstName || renewal.user.username,
            currentTier: renewal.tier.name,
            nextBillingDate: sevenDaysFromNow.toISOString().split('T')[0]
          });
        }
      }
      
      console.log(`Sent ${upcomingRenewals.length} renewal reminder emails`);
    } catch (error) {
      console.error('Error sending renewal reminders:', error);
    }
  }
  
  /**
   * Process payment failures and initiate grace period
   */
  async processPaymentFailures(): Promise<void> {
    console.log('Processing payment failures...');
    
    try {
      // Get users with failed payments in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const failedPayments = await db
        .select({
          user: users,
          tier: pricingTiers,
          payment: paymentTransactions
        })
        .from(paymentTransactions)
        .leftJoin(users, eq(paymentTransactions.userId, users.id))
        .leftJoin(pricingTiers, eq(users.pricingTierId, pricingTiers.id))
        .where(
          and(
            eq(paymentTransactions.status, 'failed'),
            lt(paymentTransactions.createdAt, yesterday)
          )
        );
      
      for (const failed of failedPayments) {
        if (failed.user?.email && failed.tier) {
          // Send immediate payment failure notification
          await this.sendPaymentFailureEmail({
            type: 'payment_failed',
            daysUntilAction: 10,
            userEmail: failed.user.email,
            firstName: failed.user.firstName || failed.user.username,
            currentTier: failed.tier.name,
            nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      }
      
      console.log(`Processed ${failedPayments.length} payment failures`);
    } catch (error) {
      console.error('Error processing payment failures:', error);
    }
  }
  
  /**
   * Send grace period warnings (3 days and 1 day before downgrade)
   */
  async sendGracePeriodWarnings(): Promise<void> {
    console.log('Sending grace period warnings...');
    
    try {
      // Get users in grace period (failed payments between 7-9 days ago)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const nineDaysAgo = new Date();
      nineDaysAgo.setDate(nineDaysAgo.getDate() - 9);
      
      const gracePeriodUsers = await db
        .select({
          user: users,
          tier: pricingTiers,
          payment: paymentTransactions
        })
        .from(paymentTransactions)
        .leftJoin(users, eq(paymentTransactions.userId, users.id))
        .leftJoin(pricingTiers, eq(users.pricingTierId, pricingTiers.id))
        .where(
          and(
            eq(paymentTransactions.status, 'failed'),
            lt(paymentTransactions.createdAt, sevenDaysAgo),
            lt(nineDaysAgo, paymentTransactions.createdAt)
          )
        );
      
      for (const user of gracePeriodUsers) {
        if (user.user?.email && user.tier) {
          const daysSinceFailure = Math.floor(
            (Date.now() - new Date(user.payment?.createdAt || '').getTime()) / (24 * 60 * 60 * 1000)
          );
          
          if (daysSinceFailure === 7) {
            // 3 days left warning
            await this.sendGracePeriodWarning({
              type: 'grace_period_warning',
              daysUntilAction: 3,
              userEmail: user.user.email,
              firstName: user.user.firstName || user.user.username,
              currentTier: user.tier.name,
              nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          } else if (daysSinceFailure === 9) {
            // 1 day left warning
            await this.sendGracePeriodWarning({
              type: 'grace_period_warning',
              daysUntilAction: 1,
              userEmail: user.user.email,
              firstName: user.user.firstName || user.user.username,
              currentTier: user.tier.name,
              nextBillingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          }
        }
      }
      
      console.log(`Sent grace period warnings to ${gracePeriodUsers.length} users`);
    } catch (error) {
      console.error('Error sending grace period warnings:', error);
    }
  }
  
  /**
   * Automatically downgrade users to free tier after 10-day grace period
   */
  async processAutomaticDowngrades(): Promise<void> {
    console.log('Processing automatic tier downgrades...');
    
    try {
      // Get users with failed payments from 10+ days ago
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      const expiredUsers = await db
        .select({
          user: users,
          tier: pricingTiers,
          payment: paymentTransactions
        })
        .from(paymentTransactions)
        .leftJoin(users, eq(paymentTransactions.userId, users.id))
        .leftJoin(pricingTiers, eq(users.pricingTierId, pricingTiers.id))
        .where(
          and(
            eq(paymentTransactions.status, 'failed'),
            lt(paymentTransactions.createdAt, tenDaysAgo)
          )
        );
      
      // Get free tier ID
      const freeTiers = await db
        .select()
        .from(pricingTiers)
        .where(eq(pricingTiers.price, 0));
      
      const freeTierId = freeTiers[0]?.id;
      
      if (!freeTierId) {
        console.error('No free tier found for automatic downgrades');
        return;
      }
      
      for (const expired of expiredUsers) {
        if (expired.user && expired.tier) {
          // Update user to free tier
          await db
            .update(users)
            .set({ 
              pricingTierId: freeTierId,
              updatedAt: new Date()
            })
            .where(eq(users.id, expired.user.id));
          
          // Send downgrade notification
          if (expired.user.email) {
            await this.sendDowngradeNotification({
              type: 'tier_downgrade_notice',
              daysUntilAction: 0,
              userEmail: expired.user.email,
              firstName: expired.user.firstName || expired.user.username,
              currentTier: 'Free',
              nextBillingDate: 'N/A'
            });
          }
          
          console.log(`Downgraded user ${expired.user.username} to free tier`);
        }
      }
      
      console.log(`Processed ${expiredUsers.length} automatic downgrades`);
    } catch (error) {
      console.error('Error processing automatic downgrades:', error);
    }
  }
  
  /**
   * Send renewal reminder email
   */
  private async sendRenewalReminderEmail(notification: SubscriptionNotification): Promise<void> {
    const subject = `Your ${notification.currentTier} subscription renews in ${notification.daysUntilAction} days`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Subscription Renewal Reminder</h2>
        <p>Hi ${notification.firstName},</p>
        <p>Your <strong>${notification.currentTier}</strong> subscription will automatically renew on <strong>${notification.nextBillingDate}</strong>.</p>
        <p>If you need to update your payment method or have any questions, please log in to your account.</p>
        <div style="margin: 20px 0;">
          <a href="https://talents-stars.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Manage Subscription
          </a>
        </div>
        <p>Thank you for being a valued member of Talents & Stars!</p>
        <p>Best regards,<br>The Talents & Stars Team</p>
      </div>
    `;
    
    await sendEmail({
      to: notification.userEmail,
      subject,
      html,
      text: `Hi ${notification.firstName}, your ${notification.currentTier} subscription renews on ${notification.nextBillingDate}. Manage your subscription at https://talents-stars.com/dashboard`
    });
  }
  
  /**
   * Send payment failure email
   */
  private async sendPaymentFailureEmail(notification: SubscriptionNotification): Promise<void> {
    const subject = `Payment Failed - Update your payment method`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>Hi ${notification.firstName},</p>
        <p>We were unable to process your payment for your <strong>${notification.currentTier}</strong> subscription.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>You have <strong>${notification.daysUntilAction} days</strong> to update your payment method</li>
          <li>Your account will remain active during this grace period</li>
          <li>If payment is not updated, your account will be downgraded to the free tier</li>
        </ul>
        <div style="margin: 20px 0;">
          <a href="https://talents-stars.com/dashboard" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </div>
        <p>Need help? Contact our support team at support@talents-stars.com</p>
        <p>Best regards,<br>The Talents & Stars Team</p>
      </div>
    `;
    
    await sendEmail({
      to: notification.userEmail,
      subject,
      html,
      text: `Hi ${notification.firstName}, your payment for ${notification.currentTier} subscription failed. You have ${notification.daysUntilAction} days to update your payment method. Update at https://talents-stars.com/dashboard`
    });
  }
  
  /**
   * Send grace period warning email
   */
  private async sendGracePeriodWarning(notification: SubscriptionNotification): Promise<void> {
    const subject = `Urgent: ${notification.daysUntilAction} days left to update payment`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Payment Required - ${notification.daysUntilAction} Days Left</h2>
        <p>Hi ${notification.firstName},</p>
        <p>This is an urgent reminder that your payment for the <strong>${notification.currentTier}</strong> subscription is still pending.</p>
        <p><strong>Time remaining:</strong> ${notification.daysUntilAction} day${notification.daysUntilAction > 1 ? 's' : ''}</p>
        <p>If you don't update your payment method by ${notification.nextBillingDate}, your account will be automatically downgraded to the free tier.</p>
        <div style="margin: 20px 0;">
          <a href="https://talents-stars.com/dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Now
          </a>
        </div>
        <p>Don't lose access to your premium features!</p>
        <p>Best regards,<br>The Talents & Stars Team</p>
      </div>
    `;
    
    await sendEmail({
      to: notification.userEmail,
      subject,
      html,
      text: `Hi ${notification.firstName}, urgent: ${notification.daysUntilAction} days left to update payment for ${notification.currentTier} subscription. Update at https://talents-stars.com/dashboard`
    });
  }
  
  /**
   * Send downgrade notification email
   */
  private async sendDowngradeNotification(notification: SubscriptionNotification): Promise<void> {
    const subject = `Account downgraded to Free tier`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b7280;">Account Downgraded</h2>
        <p>Hi ${notification.firstName},</p>
        <p>Your account has been automatically downgraded to the <strong>Free tier</strong> due to failed payment.</p>
        <p><strong>What this means:</strong></p>
        <ul>
          <li>Your account remains active with basic features</li>
          <li>Premium features are no longer available</li>
          <li>Your data and profile are preserved</li>
          <li>You can upgrade anytime to restore full access</li>
        </ul>
        <div style="margin: 20px 0;">
          <a href="https://talents-stars.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Upgrade Account
          </a>
        </div>
        <p>We'd love to have you back as a premium member!</p>
        <p>Best regards,<br>The Talents & Stars Team</p>
      </div>
    `;
    
    await sendEmail({
      to: notification.userEmail,
      subject,
      html,
      text: `Hi ${notification.firstName}, your account has been downgraded to Free tier due to failed payment. Upgrade anytime at https://talents-stars.com/dashboard`
    });
  }
  
  /**
   * Run all subscription management tasks
   */
  async runDailyTasks(): Promise<void> {
    console.log('Running daily subscription management tasks...');
    
    try {
      await this.sendRenewalReminders();
      await this.processPaymentFailures();
      await this.sendGracePeriodWarnings();
      await this.processAutomaticDowngrades();
      
      console.log('Daily subscription management tasks completed successfully');
    } catch (error) {
      console.error('Error running daily subscription management tasks:', error);
    }
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();