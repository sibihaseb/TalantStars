import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { storage } from './storage';
import { storage as storage } from './simple-storage';
import { User } from '@shared/schema';

let resend: Resend | null = null;
let smtpTransporter: nodemailer.Transporter | null = null;

// Export getEmailTemplate function used in routes
export function getEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Talents & Stars</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 28px; margin: 0;">⭐ Talents & Stars</h1>
          <p style="color: #6c757d; margin: 5px 0; font-size: 16px;">Where Talent Meets Opportunity</p>
        </div>
        
        ${content}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            © 2025 Talents & Stars. All rights reserved.
          </p>
          <p style="color: #6c757d; font-size: 12px; margin: 5px 0;">
            This email was sent from Talents & Stars platform.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface EmailSettings {
  provider: 'resend' | 'smtp';
  fromAddress: string;
  fromName: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  enabled: boolean;
}

async function getEmailSettings(): Promise<EmailSettings> {
  // Use environment variable for Resend API key - prioritize environment over database
  const config: EmailSettings = {
    provider: 'resend',
    fromAddress: 'onboarding@resend.dev',
    fromName: 'Talents & Stars',
    enabled: true,
    resendApiKey: process.env.RESEND_API_KEY
  };

  console.log('Email settings initialized with environment variable');

  return config;
}

// Template variable replacement function
function replaceTemplateVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

interface EmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const settings = await getEmailSettings();
    
    if (!settings.enabled) {
      console.log('Email sending is disabled');
      return false;
    }

    const fromAddress = `${settings.fromName} <${settings.fromAddress}>`;
    const replyToAddress = params.replyTo || 'noreply@talentsandstars.com';

    if (settings.provider === 'resend' && settings.resendApiKey) {
      if (!resend) {
        resend = new Resend(settings.resendApiKey);
      }

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: replyToAddress,
      });

      if (error) {
        console.error('Resend email error:', error);
        return false;
      }

      console.log('Email sent successfully via Resend:', data?.id);
      return true;
    } else if (settings.provider === 'smtp' && smtpTransporter) {
      const mailOptions: any = {
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: replyToAddress,
      };
      
      await smtpTransporter.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP');
      return true;
    } else {
      console.error('No email provider configured or available');
      return false;
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendTestEmail(email: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Test Successful!</h2>
      <p>This is a test email from the Talents & Stars platform.</p>
      <p><strong>Configuration:</strong></p>
      <ul>
        <li>Provider: Resend</li>
        <li>From: Talents & Stars</li>
        <li>Timestamp: ${new Date().toISOString()}</li>
      </ul>
      <p>If you receive this email, the email system is working correctly.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Email System Test - Talents & Stars',
    html,
    text: 'Email system test successful! This email confirms that the Talents & Stars email system is working correctly.',
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your Talents & Stars account.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Click the button below to reset your password:</strong></p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this password reset, you can safely ignore this email.
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour for security reasons.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset - Talents & Stars',
    html,
    text: `Password reset requested. Visit: ${resetUrl}`,
  });
}

export async function sendMeetingInvitation(
  email: string,
  meetingDetails: {
    title: string;
    date: string;
    time: string;
    location?: string;
    virtualLink?: string;
    organizer: string;
    description?: string;
  }
): Promise<boolean> {
  const { title, date, time, location, virtualLink, organizer, description } = meetingDetails;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Meeting Invitation</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #007bff;">${title}</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Organizer:</strong> ${organizer}</p>
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        ${virtualLink ? `<p><strong>Join Link:</strong> <a href="${virtualLink}">${virtualLink}</a></p>` : ''}
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
      </div>
      <p>Please confirm your attendance by replying to this email.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Meeting Invitation: ${title}`,
    html,
    text: `Meeting: ${title}\nDate: ${date}\nTime: ${time}\nOrganizer: ${organizer}${location ? `\nLocation: ${location}` : ''}${virtualLink ? `\nJoin: ${virtualLink}` : ''}`,
  });
}

export async function sendWelcomeEmail(user: User): Promise<boolean> {
  const { email, firstName, role } = user;
  
  if (!email) {
    console.error('No email address provided for welcome email');
    return false;
  }
  
  let roleSpecificContent = '';
  let subject = '';
  
  switch (role) {
    case 'talent':
      subject = '🎭 Welcome to Your Talent Journey!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">🎭 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Your talent journey begins now</p>
        </div>
      `;
      break;
    case 'manager':
      subject = '🎬 Welcome to Talent Management!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">🎬 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Ready to manage top talent</p>
        </div>
      `;
      break;
    case 'producer':
      subject = '🎥 Welcome to Production Excellence!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">🎥 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Your next production awaits</p>
        </div>
      `;
      break;
    default:
      subject = 'Welcome to Talents & Stars!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">We're excited to have you aboard</p>
        </div>
      `;
  }

  const html = getEmailTemplate(roleSpecificContent);

  return await sendEmail({
    to: email,
    subject,
    html,
    text: `Welcome to Talents & Stars, ${firstName}! Thank you for joining our platform.`,
  });
}