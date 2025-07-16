import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { storage } from './storage';

let resend: Resend | null = null;
let smtpTransporter: nodemailer.Transporter | null = null;

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
  const settings = await storage.getSystemSettings();
  const emailSettings = settings.filter(s => s.category === 'email');
  
  const config: EmailSettings = {
    provider: 'resend',
    fromAddress: 'noreply@talentsandstars.com',
    fromName: 'Talents & Stars',
    enabled: true
  };

  emailSettings.forEach(setting => {
    switch(setting.key) {
      case 'email_provider':
        config.provider = setting.value as 'resend' | 'smtp';
        break;
      case 'email_from_address':
        config.fromAddress = setting.value;
        break;
      case 'email_from_name':
        config.fromName = setting.value;
        break;
      case 'resend_api_key':
        config.resendApiKey = setting.value;
        break;
      case 'smtp_host':
        config.smtpHost = setting.value;
        break;
      case 'smtp_port':
        config.smtpPort = parseInt(setting.value);
        break;
      case 'smtp_username':
        config.smtpUsername = setting.value;
        break;
      case 'smtp_password':
        config.smtpPassword = setting.value;
        break;
      case 'smtp_secure':
        config.smtpSecure = setting.value === 'true';
        break;
      case 'email_enabled':
        config.enabled = setting.value === 'true';
        break;
    }
  });

  return config;
}

async function initializeEmailProvider(): Promise<void> {
  const settings = await getEmailSettings();
  
  if (!settings.enabled) {
    console.log('Email sending is disabled');
    return;
  }

  if (settings.provider === 'resend') {
    if (settings.resendApiKey) {
      resend = new Resend(settings.resendApiKey);
      console.log('Resend email provider initialized');
    } else {
      console.warn('Resend API key not configured');
    }
  } else if (settings.provider === 'smtp') {
    if (settings.smtpHost && settings.smtpUsername && settings.smtpPassword) {
      smtpTransporter = nodemailer.createTransporter({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpSecure || false,
        auth: {
          user: settings.smtpUsername,
          pass: settings.smtpPassword,
        },
      });
      console.log('SMTP email provider initialized');
    } else {
      console.warn('SMTP configuration incomplete');
    }
  }
}

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const settings = await getEmailSettings();
    
    if (!settings.enabled) {
      console.log('Email sending is disabled');
      return false;
    }

    await initializeEmailProvider();

    const fromAddress = params.from || `${settings.fromName} <${settings.fromAddress}>`;

    if (settings.provider === 'resend' && resend) {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (error) {
        console.error('Resend email error:', error);
        return false;
      }

      console.log('Email sent successfully via Resend:', data?.id);
      return true;
    } else if (settings.provider === 'smtp' && smtpTransporter) {
      const info = await smtpTransporter.sendMail({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      console.log('Email sent successfully via SMTP:', info.messageId);
      return true;
    } else {
      console.error('No email provider configured or initialized');
      return false;
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your Talents & Stars account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - Talents & Stars',
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

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Talents & Stars!</h2>
      <p>Hi ${firstName},</p>
      <p>Welcome to Talents & Stars, the premier platform connecting talent with opportunities in the entertainment industry.</p>
      <p>Your account has been created successfully. You can now:</p>
      <ul>
        <li>Create and optimize your profile</li>
        <li>Browse and apply for opportunities</li>
        <li>Connect with industry professionals</li>
        <li>Showcase your work and talent</li>
      </ul>
      <p>Get started by completing your profile and uploading your portfolio.</p>
      <p>If you have any questions, don't hesitate to reach out to our support team.</p>
      <p>Best regards,<br>The Talents & Stars Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to Talents & Stars!',
    html,
    text: `Welcome to Talents & Stars, ${firstName}! Your account has been created successfully.`,
  });
}