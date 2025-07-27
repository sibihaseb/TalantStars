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

// Load email template from database
async function loadEmailTemplate(templateName: string): Promise<any> {
  try {
    const template = await storage.getEmailTemplateByName(templateName);
    if (!template) {
      console.warn(`Email template '${templateName}' not found in database`);
      return null;
    }
    return template;
  } catch (error) {
    console.error(`Error loading email template '${templateName}':`, error);
    return null;
  }
}

// Send email using database template
export async function sendEmailWithTemplate(templateName: string, to: string, variables: Record<string, string> = {}): Promise<boolean> {
  try {
    const template = await loadEmailTemplate(templateName);
    if (!template) {
      console.error(`Template '${templateName}' not found`);
      return false;
    }

    const emailSettings = await getEmailSettings();
    if (!emailSettings.enabled) {
      console.log('Email sending is disabled');
      return false;
    }

    // Replace variables in template content
    const subject = replaceTemplateVariables(template.subject, variables);
    const htmlContent = replaceTemplateVariables(template.html_content, variables);
    const textContent = replaceTemplateVariables(template.text_content, variables);

    const fromAddress = `${emailSettings.fromName} <${emailSettings.fromAddress}>`;

    return await sendEmail({
      to,
      subject,
      html: htmlContent,
      text: textContent,
      from: fromAddress,
      replyTo: 'noreply@talentsandstars.com'
    });
  } catch (error) {
    console.error(`Error sending email with template '${templateName}':`, error);
    return false;
  }
}

async function initializeEmailProvider(settings?: EmailSettings): Promise<void> {
  // Use provided settings or fetch them
  const emailSettings = settings || await getEmailSettings();
  
  console.log('Initializing email provider:', emailSettings.provider);
  
  if (!emailSettings.enabled) {
    console.log('Email sending is disabled');
    return;
  }

  if (emailSettings.provider === 'resend') {
    if (emailSettings.resendApiKey) {
      resend = new Resend(emailSettings.resendApiKey);
      console.log('Resend email provider initialized successfully');
    } else {
      console.warn('Resend API key not configured');
    }
  } else if (emailSettings.provider === 'smtp') {
    if (emailSettings.smtpHost && emailSettings.smtpUsername && emailSettings.smtpPassword) {
      smtpTransporter = nodemailer.createTransporter({
        host: emailSettings.smtpHost,
        port: emailSettings.smtpPort || 587,
        secure: emailSettings.smtpSecure || false,
        auth: {
          user: emailSettings.smtpUsername,
          pass: emailSettings.smtpPassword,
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
  replyTo?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const settings = await getEmailSettings();
    
    if (!settings.enabled) {
      console.log('Email sending is disabled');
      return false;
    }

    // Pass the settings to avoid double fetching
    await initializeEmailProvider(settings);

    const fromAddress = params.from || `${settings.fromName} <${settings.fromAddress}>`;

    if (settings.provider === 'resend' && resend) {
      const emailData: any = {
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      };
      
      // Add reply-to if specified
      if (params.replyTo) {
        emailData.reply_to = params.replyTo;
      }
      
      const { data, error } = await resend.emails.send(emailData);

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
      };
      
      // Add reply-to if specified
      if (params.replyTo) {
        mailOptions.replyTo = params.replyTo;
      }
      
      const info = await smtpTransporter.sendMail(mailOptions);

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
  
  const variables = {
    resetUrl
  };

  return await sendEmailWithTemplate('password_reset', email, variables);
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

// Additional email functions would go here
  const { email, firstName, role } = user;
  
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
        
        <div style="background: linear-gradient(135deg, #667eea10 0%, #764ba220 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">🌟 You're now part of something special!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            Welcome to Talents & Stars, where your unique talents shine brighter than ever. 
            You've just joined a community of passionate artists, performers, and creators who are 
            ready to take their careers to the next level.
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎨</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Showcase Your Work</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Upload your portfolio and let your talent speak for itself</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Find Perfect Roles</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Discover opportunities that match your skills and aspirations</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🤝</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Connect & Network</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Build relationships with industry professionals</p>
          </div>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">🚀 Ready to get started?</h4>
          <p style="color: #856404; margin: 0; line-height: 1.6;">
            Complete your profile setup and start connecting with amazing opportunities. 
            Your next big break is just a click away!
          </p>
        </div>
      `;
      break;
      
    case 'manager':
      subject = '👔 Welcome to Talent Management Excellence!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #28a745; font-size: 32px; margin: 0;">👔 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Your management empire starts here</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #28a74510 0%, #20c99720 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">🏆 Welcome to the Manager's Circle!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            As a talent manager on Talents & Stars, you have access to the most comprehensive 
            tools and the most talented individuals in the entertainment industry. 
            Your expertise in nurturing careers will help shape the future of entertainment.
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">👥</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Build Your Roster</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Discover and sign the next generation of stars</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Track Success</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Monitor your clients' progress and achievements</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Strategic Opportunities</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Connect talent with perfect career moves</p>
          </div>
        </div>
        
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
          <h4 style="color: #155724; margin: 0 0 10px 0;">💼 Your management journey awaits!</h4>
          <p style="color: #155724; margin: 0; line-height: 1.6;">
            Set up your management profile and start building relationships with the industry's most promising talent. 
            Success stories begin here!
          </p>
        </div>
      `;
      break;
      
    case 'producer':
      subject = '🎬 Welcome to Production Excellence!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; font-size: 32px; margin: 0;">🎬 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Your next blockbuster starts here</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #dc354510 0%, #fd7e1420 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">🎭 Welcome to the Producer's Studio!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            As a producer on Talents & Stars, you have access to the most comprehensive talent database 
            and production tools in the industry. Your vision will bring stories to life with the 
            perfect cast and crew.
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Find Perfect Talent</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Search and discover exactly the right fit for your project</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📋</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Manage Projects</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Organize casting calls and production workflows</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🤝</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Build Teams</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Collaborate with the best talent in the industry</p>
          </div>
        </div>
        
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0;">
          <h4 style="color: #721c24; margin: 0 0 10px 0;">🎬 Ready to create magic?</h4>
          <p style="color: #721c24; margin: 0; line-height: 1.6;">
            Complete your producer profile and start posting your projects. 
            The entertainment industry's best talent is waiting to bring your vision to life!
          </p>
        </div>
      `;
      break;
      
    case 'agent':
      subject = '🤝 Welcome to the Agent Network!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #6f42c1; font-size: 32px; margin: 0;">🤝 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Your dealmaking empire begins now</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #6f42c110 0%, #e83e8c20 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">💼 Welcome to the Agent's Office!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            As an agent on Talents & Stars, you're at the heart of the entertainment industry's 
            most important connections. Your expertise in negotiation and relationship building 
            will help shape careers and create opportunities.
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎭</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Represent Talent</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Build and manage your client roster</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">💰</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Negotiate Deals</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Secure the best opportunities for your clients</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📈</div>
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Track Success</h4>
            <p style="color: #6c757d; font-size: 14px; margin: 0;">Monitor deals and client achievements</p>
          </div>
        </div>
        
        <div style="background: #e2e3ff; border-left: 4px solid #6f42c1; padding: 20px; margin: 20px 0;">
          <h4 style="color: #4c1d95; margin: 0 0 10px 0;">🚀 Ready to make deals?</h4>
          <p style="color: #4c1d95; margin: 0; line-height: 1.6;">
            Set up your agent profile and start connecting with talent and opportunities. 
            Your next big deal is waiting!
          </p>
        </div>
      `;
      break;
      
    default:
      subject = '🌟 Welcome to Talents & Stars!';
      roleSpecificContent = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">🌟 Welcome, ${firstName}!</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Your entertainment journey starts here</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea10 0%, #764ba220 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">🎉 You're now part of something amazing!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            Welcome to Talents & Stars, the premier platform connecting talent with opportunities 
            in the entertainment industry. Your journey in this exciting world begins now!
          </p>
        </div>
        
        <div style="background: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 20px; margin: 20px 0;">
          <h4 style="color: #055160; margin: 0 0 10px 0;">🚀 Ready to explore?</h4>
          <p style="color: #055160; margin: 0; line-height: 1.6;">
            Complete your profile setup and start discovering all the amazing features waiting for you!
          </p>
        </div>
      `;
      break;
  }
  
  const htmlContent = getEmailTemplate(roleSpecificContent);
  
  return await sendEmail({
    to: email,
    subject,
    html: htmlContent,
    text: `Welcome to Talents & Stars, ${firstName}! Your ${role} account has been created successfully.`,
  });
}

export async function sendTestEmail(email: string, testType: string = 'basic'): Promise<boolean> {
  let subject = '';
  let content = '';
  
  switch (testType) {
    case 'notification':
      subject = '🔔 Test Notification - Talents & Stars';
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">🔔 Test Notification</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">This is a test notification email</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea10 0%, #764ba220 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">📧 Email System Working!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            Great news! The email notification system is working perfectly. 
            You'll receive important updates about your account, new opportunities, 
            and platform features right here in your inbox.
          </p>
        </div>
        
        <div style="background: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 20px; margin: 20px 0;">
          <h4 style="color: #055160; margin: 0 0 10px 0;">✅ Test Completed Successfully</h4>
          <p style="color: #055160; margin: 0; line-height: 1.6;">
            All notification systems are operational and ready to keep you informed!
          </p>
        </div>
      `;
      break;
      
    case 'admin':
      subject = '⚡ Admin Test Email - Talents & Stars';
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #dc3545; font-size: 32px; margin: 0;">⚡ Admin Test Email</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Administrator email system test</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #dc354510 0%, #fd7e1420 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">🛠️ Admin Email System Active!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            The administrator email system is functioning correctly. You'll receive 
            important system alerts, user notifications, and platform updates through 
            this secure channel.
          </p>
        </div>
        
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0;">
          <h4 style="color: #721c24; margin: 0 0 10px 0;">🚨 Admin Features Active</h4>
          <p style="color: #721c24; margin: 0; line-height: 1.6;">
            System monitoring, user management alerts, and security notifications are all operational.
          </p>
        </div>
      `;
      break;
      
    default:
      subject = '✨ Test Email - Talents & Stars';
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #667eea; font-size: 32px; margin: 0;">✨ Test Email</h2>
          <p style="color: #6c757d; font-size: 18px; margin: 10px 0;">Email system test successful</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea10 0%, #764ba220 100%); padding: 25px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">📧 Email System Working!</h3>
          <p style="color: #4a5568; line-height: 1.6;">
            Congratulations! The email system is working perfectly. 
            This test confirms that all email functionality is operational and ready to use.
          </p>
        </div>
        
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
          <h4 style="color: #155724; margin: 0 0 10px 0;">✅ System Status: All Green!</h4>
          <p style="color: #155724; margin: 0; line-height: 1.6;">
            All email services are functioning correctly and ready for production use.
          </p>
        </div>
      `;
      break;
  }
  
  const htmlContent = getEmailTemplate(content);
  
  return await sendEmail({
    to: email,
    subject,
    html: htmlContent,
    text: `Test email sent successfully to ${email}`,
  });
}