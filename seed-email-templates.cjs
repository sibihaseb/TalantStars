const { neonConfig } = require('@neondatabase/serverless');
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaultEmailTemplates = [
  {
    name: 'welcome_talent',
    subject: 'Welcome to Talents & Stars - Your Journey Begins!',
    category: 'welcome',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to Talents & Stars!</h1>
          <p style="color: #6b7280; font-size: 16px;">Your gateway to endless opportunities</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0;">Hi {{firstName}},</h2>
          <p style="margin: 0; font-size: 16px;">Welcome to the platform where talent meets opportunity! We're thrilled to have you join our community of talented professionals.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">What's Next?</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li><strong>Complete Your Profile:</strong> Add your skills, experience, and portfolio</li>
            <li><strong>Upload Your Media:</strong> Showcase your work with photos, videos, and audio</li>
            <li><strong>Browse Opportunities:</strong> Discover jobs that match your talents</li>
            <li><strong>Connect with Professionals:</strong> Network with producers, managers, and other talent</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="{{platformUrl}}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Your Profile</a>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #1f2937;">Need Help?</h4>
          <p style="margin: 0; color: #6b7280;">Our support team is here to help you succeed. Contact us at <a href="mailto:support@talentsandstars.com" style="color: #2563eb;">support@talentsandstars.com</a></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            The Talents & Stars Team
          </p>
        </div>
      </div>
    `,
    textContent: `Welcome to Talents & Stars!

Hi {{firstName}},

Welcome to the platform where talent meets opportunity! We're thrilled to have you join our community of talented professionals.

What's Next?
- Complete Your Profile: Add your skills, experience, and portfolio
- Upload Your Media: Showcase your work with photos, videos, and audio
- Browse Opportunities: Discover jobs that match your talents
- Connect with Professionals: Network with producers, managers, and other talent

Complete your profile: {{platformUrl}}/dashboard

Need help? Contact us at support@talentsandstars.com

Best regards,
The Talents & Stars Team`,
    variables: '["firstName", "platformUrl"]',
    fromName: 'Talents & Stars',
    fromEmail: 'noreply@talentsandstars.com',
    active: true,
    description: 'Welcome email sent to new talent users'
  },
  {
    name: 'welcome_manager',
    subject: 'Welcome to Talents & Stars - Discover Amazing Talent!',
    category: 'welcome',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 28px; margin-bottom: 10px;">Welcome to Talents & Stars!</h1>
          <p style="color: #6b7280; font-size: 16px;">Your talent management hub</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0;">Hi {{firstName}},</h2>
          <p style="margin: 0; font-size: 16px;">Welcome to Talents & Stars! As a manager, you now have access to our comprehensive talent management platform.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">Get Started:</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li><strong>Build Your Network:</strong> Connect with talented professionals</li>
            <li><strong>Manage Your Roster:</strong> Organize and track your talent</li>
            <li><strong>Discover Opportunities:</strong> Find the perfect jobs for your clients</li>
            <li><strong>Schedule Meetings:</strong> Coordinate with talent and industry professionals</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="{{platformUrl}}/dashboard" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Your Dashboard</a>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #1f2937;">Questions?</h4>
          <p style="margin: 0; color: #6b7280;">We're here to help you succeed. Contact us at <a href="mailto:support@talentsandstars.com" style="color: #059669;">support@talentsandstars.com</a></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            The Talents & Stars Team
          </p>
        </div>
      </div>
    `,
    textContent: `Welcome to Talents & Stars!

Hi {{firstName}},

Welcome to Talents & Stars! As a manager, you now have access to our comprehensive talent management platform.

Get Started:
- Build Your Network: Connect with talented professionals
- Manage Your Roster: Organize and track your talent
- Discover Opportunities: Find the perfect jobs for your clients
- Schedule Meetings: Coordinate with talent and industry professionals

Access your dashboard: {{platformUrl}}/dashboard

Questions? Contact us at support@talentsandstars.com

Best regards,
The Talents & Stars Team`,
    variables: '["firstName", "platformUrl"]',
    fromName: 'Talents & Stars',
    fromEmail: 'noreply@talentsandstars.com',
    active: true,
    description: 'Welcome email sent to new manager users'
  },
  {
    name: 'welcome_producer',
    subject: 'Welcome to Talents & Stars - Find Your Perfect Cast!',
    category: 'welcome',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 10px;">Welcome to Talents & Stars!</h1>
          <p style="color: #6b7280; font-size: 16px;">Your casting and production hub</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0;">Hi {{firstName}},</h2>
          <p style="margin: 0; font-size: 16px;">Welcome to Talents & Stars! As a producer, you now have access to our vast network of talented professionals.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">Ready to Start?</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li><strong>Post Casting Calls:</strong> Create detailed job listings for your projects</li>
            <li><strong>Browse Talent:</strong> Search through thousands of professionals</li>
            <li><strong>Manage Applications:</strong> Review and organize submissions</li>
            <li><strong>Connect Directly:</strong> Message and schedule meetings with talent</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="{{platformUrl}}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Casting</a>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #1f2937;">Support</h4>
          <p style="margin: 0; color: #6b7280;">Need assistance with your projects? Contact us at <a href="mailto:support@talentsandstars.com" style="color: #dc2626;">support@talentsandstars.com</a></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            The Talents & Stars Team
          </p>
        </div>
      </div>
    `,
    textContent: `Welcome to Talents & Stars!

Hi {{firstName}},

Welcome to Talents & Stars! As a producer, you now have access to our vast network of talented professionals.

Ready to Start?
- Post Casting Calls: Create detailed job listings for your projects
- Browse Talent: Search through thousands of professionals
- Manage Applications: Review and organize submissions
- Connect Directly: Message and schedule meetings with talent

Start casting: {{platformUrl}}/dashboard

Support: Need assistance with your projects? Contact us at support@talentsandstars.com

Best regards,
The Talents & Stars Team`,
    variables: '["firstName", "platformUrl"]',
    fromName: 'Talents & Stars',
    fromEmail: 'noreply@talentsandstars.com',
    active: true,
    description: 'Welcome email sent to new producer users'
  },
  {
    name: 'password_reset',
    subject: 'Reset Your Talents & Stars Password',
    category: 'security',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 10px;">Password Reset</h1>
          <p style="color: #6b7280; font-size: 16px;">Secure your account</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; color: #92400e;">Password Reset Request</h2>
          <p style="margin: 0; color: #92400e;">You requested a password reset for your Talents & Stars account.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            If you requested this password reset, click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="{{resetUrl}}" style="background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{resetUrl}}" style="color: #2563eb; word-break: break-all;">{{resetUrl}}</a>
          </p>
        </div>
        
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #b91c1c;">Important Security Information</h4>
          <ul style="margin: 0; color: #b91c1c; line-height: 1.6;">
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request this, please ignore this email</li>
            <li>Your password will remain unchanged until you create a new one</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            The Talents & Stars Security Team
          </p>
        </div>
      </div>
    `,
    textContent: `Password Reset - Talents & Stars

You requested a password reset for your Talents & Stars account.

If you requested this password reset, click the link below to create a new password:
{{resetUrl}}

Important Security Information:
- This link will expire in 1 hour
- If you didn't request this, please ignore this email
- Your password will remain unchanged until you create a new one

Best regards,
The Talents & Stars Security Team`,
    variables: '["resetUrl"]',
    fromName: 'Talents & Stars',
    fromEmail: 'noreply@talentsandstars.com',
    active: true,
    description: 'Password reset email with secure link'
  },
  {
    name: 'notification_general',
    subject: 'New Notification from Talents & Stars',
    category: 'notification',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Talents & Stars</h1>
          <p style="color: #6b7280; font-size: 16px;">{{notificationTitle}}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0;">Hi {{firstName}},</h2>
          <p style="margin: 0; font-size: 16px;">{{notificationMessage}}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="{{actionUrl}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">{{actionText}}</a>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #1f2937;">Stay Connected</h4>
          <p style="margin: 0; color: #6b7280;">Visit your dashboard to stay updated on all your opportunities and connections.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            The Talents & Stars Team
          </p>
        </div>
      </div>
    `,
    textContent: `{{notificationTitle}} - Talents & Stars

Hi {{firstName}},

{{notificationMessage}}

{{actionText}}: {{actionUrl}}

Stay Connected: Visit your dashboard to stay updated on all your opportunities and connections.

Best regards,
The Talents & Stars Team`,
    variables: '["firstName", "notificationTitle", "notificationMessage", "actionUrl", "actionText"]',
    fromName: 'Talents & Stars',
    fromEmail: 'noreply@talentsandstars.com',
    active: true,
    description: 'General notification email template'
  }
];

async function seedEmailTemplates() {
  try {
    console.log('Seeding email templates...');
    
    for (const template of defaultEmailTemplates) {
      // Check if template already exists
      const existingTemplate = await pool.query(
        'SELECT id FROM email_templates WHERE name = $1',
        [template.name]
      );
      
      if (existingTemplate.rows.length === 0) {
        // Insert new template
        await pool.query(`
          INSERT INTO email_templates (
            name, subject, category, html_content, text_content, 
            active, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          template.name,
          template.subject,
          template.category,
          template.htmlContent,
          template.textContent,
          template.active,
          template.description
        ]);
        
        console.log(`✓ Created template: ${template.name}`);
      } else {
        console.log(`- Template already exists: ${template.name}`);
      }
    }
    
    console.log('Email templates seeded successfully!');
  } catch (error) {
    console.error('Error seeding email templates:', error);
  } finally {
    await pool.end();
  }
}

seedEmailTemplates();