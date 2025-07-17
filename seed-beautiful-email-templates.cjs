const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const beautifulTemplates = [
  {
    name: 'welcome_talent_modern',
    subject: 'Welcome to Talents & Stars - Your Journey Begins! 🌟',
    category: 'welcome',
    description: 'Modern welcome email for new talent members with gradient design',
    variables: ['firstName', 'talentType', 'platformUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Talents & Stars</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 700; }
    .header p { font-size: 16px; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .welcome-message { font-size: 18px; line-height: 1.6; color: #2d3748; margin-bottom: 30px; }
    .features { background: #f7fafc; padding: 30px; border-radius: 12px; margin: 30px 0; }
    .features h3 { color: #2d3748; margin-bottom: 20px; font-size: 20px; }
    .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
    .feature-icon { width: 24px; height: 24px; background: #667eea; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
    .cta-button:hover { transform: translateY(-2px); }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Talents & Stars!</h1>
      <p>Your entertainment career starts here</p>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        <p>Hi {{firstName}},</p>
        <p>Welcome to Talents & Stars! We're thrilled to have you join our community of talented {{talentType}} professionals. Your journey to discover amazing opportunities starts now.</p>
      </div>
      
      <div class="features">
        <h3>What you can do now:</h3>
        <div class="feature-item">
          <div class="feature-icon">1</div>
          <span>Complete your profile to attract the right opportunities</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">2</div>
          <span>Upload your portfolio and showcase your best work</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">3</div>
          <span>Connect with industry professionals and expand your network</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">4</div>
          <span>Apply to exciting projects and casting calls</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="{{platformUrl}}" class="cta-button">Get Started Now</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
      <p>You're receiving this email because you signed up for Talents & Stars.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Welcome to Talents & Stars!

Hi {{firstName}},

Welcome to Talents & Stars! We're thrilled to have you join our community of talented {{talentType}} professionals.

What you can do now:
1. Complete your profile to attract the right opportunities
2. Upload your portfolio and showcase your best work
3. Connect with industry professionals and expand your network
4. Apply to exciting projects and casting calls

Get started: {{platformUrl}}

Best regards,
The Talents & Stars Team`,
    sort_order: 1
  },
  {
    name: 'password_reset_secure',
    subject: 'Reset Your Password - Talents & Stars',
    category: 'transactional',
    description: 'Secure password reset email with modern design',
    variables: ['resetUrl', 'firstName'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .content { padding: 30px; text-align: center; }
    .security-info { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 20px 0; color: #c53030; }
    .reset-button { display: inline-block; background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .expiry-note { color: #718096; font-size: 14px; margin-top: 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
      <p>Secure your account</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <a href="{{resetUrl}}" class="reset-button">Reset Password</a>
      
      <div class="security-info">
        <strong>Security Notice:</strong> If you didn't request this reset, please ignore this email. Your password will remain unchanged.
      </div>
      
      <p class="expiry-note">This link will expire in 24 hours for security reasons.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Password Reset - Talents & Stars

Hi {{firstName}},

We received a request to reset your password. Click the link below to create a new password:

{{resetUrl}}

Security Notice: If you didn't request this reset, please ignore this email. Your password will remain unchanged.

This link will expire in 24 hours for security reasons.

Best regards,
The Talents & Stars Team`,
    sort_order: 2
  },
  {
    name: 'job_notification_premium',
    subject: 'New Opportunity Alert: {{jobTitle}} 🎯',
    category: 'notification',
    description: 'Premium job notification with visual appeal',
    variables: ['firstName', 'jobTitle', 'company', 'location', 'salary', 'jobUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Opportunity</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f4f8; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; color: white; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .job-card { background: #f7fafc; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #48bb78; }
    .job-title { font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 10px; }
    .job-details { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; }
    .detail-item { background: white; padding: 8px 12px; border-radius: 6px; font-size: 14px; color: #4a5568; }
    .apply-button { display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .content { padding: 30px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Opportunity Alert</h1>
      <p>A perfect match for your skills</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We found an exciting new opportunity that matches your profile:</p>
      
      <div class="job-card">
        <div class="job-title">{{jobTitle}}</div>
        <div class="job-details">
          <div class="detail-item">🏢 {{company}}</div>
          <div class="detail-item">📍 {{location}}</div>
          <div class="detail-item">💰 {{salary}}</div>
        </div>
        <p>This opportunity aligns perfectly with your skills and experience. Don't miss out!</p>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="{{jobUrl}}" class="apply-button">View & Apply Now</a>
        </div>
      </div>
      
      <p>Applications are being reviewed on a rolling basis, so apply early to increase your chances.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
      <p>You're receiving this because you subscribed to job alerts.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `New Opportunity Alert: {{jobTitle}}

Hi {{firstName}},

We found an exciting new opportunity that matches your profile:

Job Title: {{jobTitle}}
Company: {{company}}
Location: {{location}}
Salary: {{salary}}

This opportunity aligns perfectly with your skills and experience. Don't miss out!

View & Apply: {{jobUrl}}

Applications are being reviewed on a rolling basis, so apply early to increase your chances.

Best regards,
The Talents & Stars Team`,
    sort_order: 3
  },
  {
    name: 'newsletter_monthly',
    subject: 'Monthly Spotlight: Industry Updates & Success Stories 📰',
    category: 'marketing',
    description: 'Beautiful monthly newsletter template',
    variables: ['firstName', 'month', 'year', 'featuredStory', 'industryUpdate', 'unsubscribeUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Newsletter</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #805ad5 0%, #553c9a 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .section { padding: 30px; border-bottom: 1px solid #e2e8f0; }
    .section:last-child { border-bottom: none; }
    .section h2 { color: #2d3748; font-size: 22px; margin-bottom: 15px; }
    .story-card { background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%); border-radius: 12px; padding: 20px; margin: 15px 0; }
    .cta-section { background: linear-gradient(135deg, #805ad5 0%, #553c9a 100%); color: white; text-align: center; }
    .cta-button { display: inline-block; background: white; color: #805ad5; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 Monthly Spotlight</h1>
      <p>{{month}} {{year}} - Industry Updates & Success Stories</p>
    </div>
    
    <div class="section">
      <h2>🌟 Featured Success Story</h2>
      <div class="story-card">
        <p>{{featuredStory}}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>📈 Industry Update</h2>
      <p>{{industryUpdate}}</p>
    </div>
    
    <div class="section cta-section">
      <h2>Ready to Create Your Success Story?</h2>
      <p>Join thousands of professionals who are advancing their careers with Talents & Stars.</p>
      <a href="{{platformUrl}}" class="cta-button">Explore Opportunities</a>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> from monthly newsletters.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Monthly Spotlight - {{month}} {{year}}

Hi {{firstName}},

FEATURED SUCCESS STORY:
{{featuredStory}}

INDUSTRY UPDATE:
{{industryUpdate}}

Ready to Create Your Success Story?
Join thousands of professionals who are advancing their careers with Talents & Stars.

Explore Opportunities: {{platformUrl}}

Unsubscribe: {{unsubscribeUrl}}

Best regards,
The Talents & Stars Team`,
    sort_order: 4
  },
  {
    name: 'profile_completion_reminder',
    subject: 'Complete Your Profile & Get 3x More Opportunities! 🚀',
    category: 'reminder',
    description: 'Motivational profile completion reminder',
    variables: ['firstName', 'completionPercentage', 'missingItems', 'profileUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Profile</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f7ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%); padding: 40px 30px; text-align: center; color: white; }
    .progress-bar { background: rgba(255,255,255,0.3); border-radius: 10px; height: 20px; margin: 20px 0; overflow: hidden; }
    .progress-fill { background: white; height: 100%; transition: width 0.3s ease; }
    .content { padding: 30px; }
    .benefits { background: #ebf8ff; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .benefit-item { display: flex; align-items: center; margin-bottom: 12px; }
    .benefit-icon { width: 30px; height: 30px; background: #3182ce; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .complete-button { display: inline-block; background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 You're Almost There!</h1>
      <p>Complete your profile to unlock more opportunities</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {{completionPercentage}}%"></div>
      </div>
      <p>{{completionPercentage}}% Complete</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>You're so close to having a complete profile! Profiles that are 100% complete get 3x more opportunities than incomplete ones.</p>
      
      <div class="benefits">
        <h3>Why complete your profile?</h3>
        <div class="benefit-item">
          <div class="benefit-icon">3x</div>
          <span>Get 3x more job opportunities</span>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">📈</div>
          <span>Rank higher in search results</span>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">💼</div>
          <span>Attract premium clients</span>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">⭐</div>
          <span>Stand out from the competition</span>
        </div>
      </div>
      
      <p><strong>Still missing:</strong> {{missingItems}}</p>
      
      <div style="text-align: center;">
        <a href="{{profileUrl}}" class="complete-button">Complete Profile Now</a>
      </div>
      
      <p>It only takes 5 minutes to finish, and the results are worth it!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Complete Your Profile & Get 3x More Opportunities!

Hi {{firstName}},

You're {{completionPercentage}}% complete with your profile!

You're so close to having a complete profile! Profiles that are 100% complete get 3x more opportunities than incomplete ones.

Why complete your profile?
- Get 3x more job opportunities
- Rank higher in search results
- Attract premium clients
- Stand out from the competition

Still missing: {{missingItems}}

Complete Profile: {{profileUrl}}

It only takes 5 minutes to finish, and the results are worth it!

Best regards,
The Talents & Stars Team`,
    sort_order: 5
  },
  {
    name: 'application_received',
    subject: 'Application Received - {{jobTitle}} ✅',
    category: 'transactional',
    description: 'Confirmation email for job applications',
    variables: ['firstName', 'jobTitle', 'company', 'applicationId', 'timelineInfo'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f9ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; text-align: center; color: white; }
    .checkmark { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .content { padding: 30px; }
    .application-details { background: #f0f9ff; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .detail-label { font-weight: 600; color: #374151; }
    .timeline { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✅</div>
      <h1>Application Received!</h1>
      <p>We've got your application</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Great news! We've successfully received your application for the following position:</p>
      
      <div class="application-details">
        <div class="detail-row">
          <span class="detail-label">Position:</span>
          <span>{{jobTitle}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Company:</span>
          <span>{{company}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Application ID:</span>
          <span>{{applicationId}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Submitted:</span>
          <span>Just now</span>
        </div>
      </div>
      
      <div class="timeline">
        <h3>⏰ What happens next?</h3>
        <p>{{timelineInfo}}</p>
      </div>
      
      <p>We'll keep you updated on the progress of your application. In the meantime, feel free to explore more opportunities on our platform!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Application Received - {{jobTitle}}

Hi {{firstName}},

Great news! We've successfully received your application for the following position:

Position: {{jobTitle}}
Company: {{company}}
Application ID: {{applicationId}}
Submitted: Just now

What happens next?
{{timelineInfo}}

We'll keep you updated on the progress of your application. In the meantime, feel free to explore more opportunities on our platform!

Best regards,
The Talents & Stars Team`,
    sort_order: 6
  },
  {
    name: 'interview_invitation',
    subject: 'Interview Invitation - {{jobTitle}} at {{company}} 🎉',
    category: 'notification',
    description: 'Exciting interview invitation email',
    variables: ['firstName', 'jobTitle', 'company', 'interviewDate', 'interviewTime', 'location', 'interviewType', 'contactPerson'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Invitation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f4f8; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); padding: 40px 30px; text-align: center; color: white; }
    .celebration { font-size: 48px; margin-bottom: 15px; }
    .content { padding: 30px; }
    .interview-card { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 25px; margin: 20px 0; border: 2px solid #e9d5ff; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail-item { background: white; padding: 15px; border-radius: 8px; text-align: center; }
    .detail-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .detail-value { font-size: 16px; font-weight: 600; color: #1f2937; }
    .tips { background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="celebration">🎉</div>
      <h1>Interview Invitation!</h1>
      <p>Congratulations on making it to the next round</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Congratulations! We're impressed with your application and would love to invite you for an interview.</p>
      
      <div class="interview-card">
        <h3>📅 Interview Details</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Position</div>
            <div class="detail-value">{{jobTitle}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Company</div>
            <div class="detail-value">{{company}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">{{interviewDate}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">{{interviewTime}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Type</div>
            <div class="detail-value">{{interviewType}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Location</div>
            <div class="detail-value">{{location}}</div>
          </div>
        </div>
      </div>
      
      <div class="tips">
        <h3>💡 Interview Tips</h3>
        <ul style="margin-left: 20px; color: #4b5563;">
          <li>Research the company and role thoroughly</li>
          <li>Prepare specific examples of your work</li>
          <li>Arrive 10 minutes early</li>
          <li>Bring copies of your resume and portfolio</li>
        </ul>
      </div>
      
      <p>Your contact person: <strong>{{contactPerson}}</strong></p>
      <p>We're excited to meet you and learn more about your experience!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Interview Invitation - {{jobTitle}} at {{company}}

Hi {{firstName}},

Congratulations! We're impressed with your application and would love to invite you for an interview.

Interview Details:
- Position: {{jobTitle}}
- Company: {{company}}
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Type: {{interviewType}}
- Location: {{location}}

Interview Tips:
- Research the company and role thoroughly
- Prepare specific examples of your work
- Arrive 10 minutes early
- Bring copies of your resume and portfolio

Your contact person: {{contactPerson}}

We're excited to meet you and learn more about your experience!

Best regards,
The Talents & Stars Team`,
    sort_order: 7
  },
  {
    name: 'payment_receipt',
    subject: 'Payment Receipt - {{planName}} Subscription 💳',
    category: 'transactional',
    description: 'Professional payment receipt email',
    variables: ['firstName', 'planName', 'amount', 'currency', 'invoiceNumber', 'billingDate', 'nextBillingDate', 'paymentMethod'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; color: white; }
    .receipt-icon { width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .content { padding: 30px; }
    .receipt-details { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f3f4f6; }
    .receipt-row:last-child { border-bottom: none; }
    .receipt-label { color: #6b7280; }
    .receipt-value { font-weight: 600; color: #1f2937; }
    .total-row { background: #f9fafb; font-weight: 700; }
    .billing-info { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="receipt-icon">💳</div>
      <h1>Payment Received</h1>
      <p>Thank you for your payment</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We've successfully processed your payment. Here are the details:</p>
      
      <div class="receipt-details">
        <div class="receipt-row">
          <span class="receipt-label">Invoice Number:</span>
          <span class="receipt-value">{{invoiceNumber}}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Plan:</span>
          <span class="receipt-value">{{planName}}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Billing Date:</span>
          <span class="receipt-value">{{billingDate}}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Payment Method:</span>
          <span class="receipt-value">{{paymentMethod}}</span>
        </div>
        <div class="receipt-row total-row">
          <span class="receipt-label">Total Paid:</span>
          <span class="receipt-value">{{amount}} {{currency}}</span>
        </div>
      </div>
      
      <div class="billing-info">
        <h3>📅 Next Billing</h3>
        <p>Your next billing date is <strong>{{nextBillingDate}}</strong>. You'll receive a reminder before we process the payment.</p>
      </div>
      
      <p>Need help or have questions? Our support team is here to assist you!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
      <p>This is an automated receipt. Please keep it for your records.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Payment Receipt - {{planName}} Subscription

Hi {{firstName}},

We've successfully processed your payment. Here are the details:

Invoice Number: {{invoiceNumber}}
Plan: {{planName}}
Billing Date: {{billingDate}}
Payment Method: {{paymentMethod}}
Total Paid: {{amount}} {{currency}}

Next Billing:
Your next billing date is {{nextBillingDate}}. You'll receive a reminder before we process the payment.

Need help or have questions? Our support team is here to assist you!

Best regards,
The Talents & Stars Team`,
    sort_order: 8
  },
  {
    name: 'event_invitation',
    subject: 'You\'re Invited: {{eventName}} 🎪',
    category: 'marketing',
    description: 'Elegant event invitation email',
    variables: ['firstName', 'eventName', 'eventDate', 'eventTime', 'venue', 'eventDescription', 'rsvpUrl', 'dressCode'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Invitation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #faf5ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 50px 30px; text-align: center; color: white; position: relative; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="30" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="70" r="1.5" fill="white" opacity="0.1"/></svg>'); }
    .invitation-icon { font-size: 60px; margin-bottom: 20px; }
    .content { padding: 40px 30px; }
    .event-details { background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-radius: 16px; padding: 30px; margin: 30px 0; }
    .detail-item { display: flex; align-items: center; margin-bottom: 15px; }
    .detail-icon { width: 40px; height: 40px; background: #ec4899; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .rsvp-section { background: #fffbeb; border: 2px solid #fed7aa; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .rsvp-button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 15px 0; transition: transform 0.2s; }
    .rsvp-button:hover { transform: translateY(-2px); }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="invitation-icon">🎪</div>
      <h1>You're Invited!</h1>
      <p>Join us for an exclusive event</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We're thrilled to invite you to our upcoming event. This is going to be an amazing experience!</p>
      
      <div class="event-details">
        <h2>{{eventName}}</h2>
        <p style="margin-bottom: 20px; color: #6b7280;">{{eventDescription}}</p>
        
        <div class="detail-item">
          <div class="detail-icon">📅</div>
          <div>
            <strong>Date:</strong> {{eventDate}}<br>
            <strong>Time:</strong> {{eventTime}}
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">📍</div>
          <div><strong>Venue:</strong> {{venue}}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">👔</div>
          <div><strong>Dress Code:</strong> {{dressCode}}</div>
        </div>
      </div>
      
      <div class="rsvp-section">
        <h3>🎉 Ready to Join Us?</h3>
        <p>Please confirm your attendance by clicking the button below. We can't wait to see you there!</p>
        <a href="{{rsvpUrl}}" class="rsvp-button">RSVP Now</a>
      </div>
      
      <p>If you have any questions or special requirements, please don't hesitate to reach out to us.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `You're Invited: {{eventName}}

Hi {{firstName}},

We're thrilled to invite you to our upcoming event. This is going to be an amazing experience!

Event: {{eventName}}
Description: {{eventDescription}}
Date: {{eventDate}}
Time: {{eventTime}}
Venue: {{venue}}
Dress Code: {{dressCode}}

Ready to Join Us?
Please confirm your attendance: {{rsvpUrl}}

If you have any questions or special requirements, please don't hesitate to reach out to us.

Best regards,
The Talents & Stars Team`,
    sort_order: 9
  },
  {
    name: 'milestone_celebration',
    subject: 'Congratulations on Your Achievement! 🏆',
    category: 'notification',
    description: 'Celebratory email for user milestones',
    variables: ['firstName', 'milestone', 'achievement', 'stats', 'nextGoal', 'rewardInfo'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Milestone Achievement</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fffbeb; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 50px 30px; text-align: center; color: white; position: relative; }
    .confetti { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="3" height="3" fill="white" opacity="0.3"/><rect x="70" y="30" width="2" height="2" fill="white" opacity="0.3"/><rect x="40" y="60" width="2" height="2" fill="white" opacity="0.3"/></svg>'); }
    .trophy { font-size: 80px; margin-bottom: 20px; animation: bounce 2s infinite; }
    @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
    .content { padding: 40px 30px; }
    .achievement-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: #f9fafb; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: #f59e0b; margin-bottom: 5px; }
    .stat-label { font-size: 14px; color: #6b7280; }
    .next-goal { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="confetti"></div>
      <div class="trophy">🏆</div>
      <h1>Congratulations!</h1>
      <p>You've reached a new milestone</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We're absolutely thrilled to celebrate this incredible achievement with you!</p>
      
      <div class="achievement-card">
        <h2>🎉 {{milestone}}</h2>
        <p style="margin-top: 15px; font-size: 18px;">{{achievement}}</p>
      </div>
      
      <div class="stats-grid">
        {{stats}}
      </div>
      
      <div class="next-goal">
        <h3>🎯 Your Next Goal</h3>
        <p>{{nextGoal}}</p>
      </div>
      
      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <h3>🎁 Special Reward</h3>
        <p>{{rewardInfo}}</p>
      </div>
      
      <p>Keep up the amazing work! You're an inspiration to our entire community.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Congratulations on Your Achievement!

Hi {{firstName}},

We're absolutely thrilled to celebrate this incredible achievement with you!

Milestone: {{milestone}}
Achievement: {{achievement}}

Your Stats:
{{stats}}

Your Next Goal:
{{nextGoal}}

Special Reward:
{{rewardInfo}}

Keep up the amazing work! You're an inspiration to our entire community.

Best regards,
The Talents & Stars Team`,
    sort_order: 10
  },
  {
    name: 'account_verification',
    subject: 'Please Verify Your Account - Talents & Stars ✨',
    category: 'transactional',
    description: 'Account verification email with modern design',
    variables: ['firstName', 'verificationUrl', 'verificationCode'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f9ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; color: white; }
    .shield { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .content { padding: 40px 30px; text-align: center; }
    .verification-code { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 25px 0; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #1e293b; }
    .verify-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .alternative { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; color: #64748b; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="shield">✨</div>
      <h1>Verify Your Account</h1>
      <p>Just one more step to get started</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Welcome to Talents & Stars! Please verify your account to unlock all features.</p>
      
      <a href="{{verificationUrl}}" class="verify-button">Verify Account</a>
      
      <div class="alternative">
        <p>Or enter this verification code:</p>
        <div class="verification-code">{{verificationCode}}</div>
      </div>
      
      <p>This verification link will expire in 24 hours for security.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Account Verification - Talents & Stars

Hi {{firstName}},

Welcome to Talents & Stars! Please verify your account to unlock all features.

Verify your account: {{verificationUrl}}

Or enter this verification code: {{verificationCode}}

This verification link will expire in 24 hours for security.

Best regards,
The Talents & Stars Team`,
    sort_order: 11
  },
  {
    name: 'booking_confirmation',
    subject: 'Booking Confirmed - {{serviceName}} 📅',
    category: 'transactional',
    description: 'Service booking confirmation email',
    variables: ['firstName', 'serviceName', 'bookingDate', 'bookingTime', 'duration', 'location', 'contactInfo', 'bookingId'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0fdf4; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
    .checkmark { width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .content { padding: 30px; }
    .booking-card { background: #f0fdf4; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #bbf7d0; }
    .booking-detail { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .booking-label { font-weight: 600; color: #374151; }
    .booking-value { color: #1f2937; }
    .calendar-add { background: #eff6ff; border: 2px solid #dbeafe; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">📅</div>
      <h1>Booking Confirmed!</h1>
      <p>Your appointment has been scheduled</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Great news! Your booking has been confirmed. Here are your appointment details:</p>
      
      <div class="booking-card">
        <div class="booking-detail">
          <span class="booking-label">Service:</span>
          <span class="booking-value">{{serviceName}}</span>
        </div>
        <div class="booking-detail">
          <span class="booking-label">Date:</span>
          <span class="booking-value">{{bookingDate}}</span>
        </div>
        <div class="booking-detail">
          <span class="booking-label">Time:</span>
          <span class="booking-value">{{bookingTime}}</span>
        </div>
        <div class="booking-detail">
          <span class="booking-label">Duration:</span>
          <span class="booking-value">{{duration}}</span>
        </div>
        <div class="booking-detail">
          <span class="booking-label">Location:</span>
          <span class="booking-value">{{location}}</span>
        </div>
        <div class="booking-detail">
          <span class="booking-label">Booking ID:</span>
          <span class="booking-value">{{bookingId}}</span>
        </div>
      </div>
      
      <div class="calendar-add">
        <h3>📱 Don't Forget!</h3>
        <p>Add this appointment to your calendar so you don't miss it.</p>
      </div>
      
      <p>Contact Information: {{contactInfo}}</p>
      <p>We'll send you a reminder 24 hours before your appointment.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Booking Confirmed - {{serviceName}}

Hi {{firstName}},

Great news! Your booking has been confirmed. Here are your appointment details:

Service: {{serviceName}}
Date: {{bookingDate}}
Time: {{bookingTime}}
Duration: {{duration}}
Location: {{location}}
Booking ID: {{bookingId}}

Contact Information: {{contactInfo}}

We'll send you a reminder 24 hours before your appointment.

Best regards,
The Talents & Stars Team`,
    sort_order: 12
  },
  {
    name: 'survey_invitation',
    subject: 'We Value Your Feedback - Quick Survey 📝',
    category: 'marketing',
    description: 'Survey invitation with incentive',
    variables: ['firstName', 'surveyUrl', 'incentive', 'estimatedTime', 'surveyTopic'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Invitation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fefce8; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 40px 30px; text-align: center; color: white; }
    .survey-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .content { padding: 40px 30px; }
    .survey-info { background: #fefce8; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #fde047; }
    .info-item { display: flex; align-items: center; margin-bottom: 15px; }
    .info-icon { width: 30px; height: 30px; background: #eab308; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .incentive-box { background: #dcfce7; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .survey-button { display: inline-block; background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="survey-icon">📝</div>
      <h1>We Value Your Feedback</h1>
      <p>Help us improve your experience</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Your opinion matters to us! We'd love to hear about your experience with Talents & Stars.</p>
      
      <div class="survey-info">
        <h3>Survey Details</h3>
        <div class="info-item">
          <div class="info-icon">📊</div>
          <span><strong>Topic:</strong> {{surveyTopic}}</span>
        </div>
        <div class="info-item">
          <div class="info-icon">⏱️</div>
          <span><strong>Time:</strong> Just {{estimatedTime}} minutes</span>
        </div>
        <div class="info-item">
          <div class="info-icon">🎯</div>
          <span><strong>Purpose:</strong> Improve your experience</span>
        </div>
      </div>
      
      <div class="incentive-box">
        <h3>🎁 Thank You Gift</h3>
        <p>{{incentive}}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{surveyUrl}}" class="survey-button">Take Survey</a>
      </div>
      
      <p>Your feedback helps us create better features and services for our community.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `We Value Your Feedback - Quick Survey

Hi {{firstName}},

Your opinion matters to us! We'd love to hear about your experience with Talents & Stars.

Survey Details:
- Topic: {{surveyTopic}}
- Time: Just {{estimatedTime}} minutes
- Purpose: Improve your experience

Thank You Gift: {{incentive}}

Take Survey: {{surveyUrl}}

Your feedback helps us create better features and services for our community.

Best regards,
The Talents & Stars Team`,
    sort_order: 13
  },
  {
    name: 'subscription_renewal',
    subject: 'Your {{planName}} Subscription Renews Tomorrow 🔄',
    category: 'reminder',
    description: 'Subscription renewal reminder',
    variables: ['firstName', 'planName', 'amount', 'currency', 'renewalDate', 'paymentMethod', 'manageUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Renewal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3e8ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; color: white; }
    .renewal-icon { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .content { padding: 30px; }
    .renewal-details { background: #f3e8ff; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .detail-label { font-weight: 600; color: #374151; }
    .detail-value { color: #1f2937; }
    .payment-info { background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .manage-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="renewal-icon">🔄</div>
      <h1>Subscription Renewal</h1>
      <p>Your plan renews tomorrow</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Just a friendly reminder that your subscription will automatically renew tomorrow.</p>
      
      <div class="renewal-details">
        <div class="detail-row">
          <span class="detail-label">Plan:</span>
          <span class="detail-value">{{planName}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Renewal Date:</span>
          <span class="detail-value">{{renewalDate}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value">{{amount}} {{currency}}</span>
        </div>
      </div>
      
      <div class="payment-info">
        <h3>💳 Payment Method</h3>
        <p>We'll charge your {{paymentMethod}} on file.</p>
      </div>
      
      <p>Want to make changes to your subscription? You can manage it anytime:</p>
      
      <div style="text-align: center;">
        <a href="{{manageUrl}}" class="manage-button">Manage Subscription</a>
      </div>
      
      <p>Thank you for being a valued member of Talents & Stars!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Subscription Renewal - {{planName}}

Hi {{firstName}},

Just a friendly reminder that your subscription will automatically renew tomorrow.

Plan: {{planName}}
Renewal Date: {{renewalDate}}
Amount: {{amount}} {{currency}}

Payment Method: We'll charge your {{paymentMethod}} on file.

Want to make changes to your subscription? You can manage it anytime: {{manageUrl}}

Thank you for being a valued member of Talents & Stars!

Best regards,
The Talents & Stars Team`,
    sort_order: 14
  },
  {
    name: 'security_alert',
    subject: 'Security Alert - New Device Login 🔐',
    category: 'system',
    description: 'Security alert for new device login',
    variables: ['firstName', 'deviceInfo', 'location', 'timestamp', 'ipAddress', 'secureAccountUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fef2f2; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; color: white; }
    .alert-icon { width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .content { padding: 30px; }
    .alert-details { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .detail-item { display: flex; align-items: center; margin-bottom: 15px; }
    .detail-icon { width: 30px; height: 30px; background: #dc2626; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
    .security-tips { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .secure-button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="alert-icon">🔐</div>
      <h1>Security Alert</h1>
      <p>New device login detected</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We detected a new login to your account from a device we don't recognize.</p>
      
      <div class="alert-details">
        <h3>⚠️ Login Details</h3>
        <div class="detail-item">
          <div class="detail-icon">📱</div>
          <span><strong>Device:</strong> {{deviceInfo}}</span>
        </div>
        <div class="detail-item">
          <div class="detail-icon">📍</div>
          <span><strong>Location:</strong> {{location}}</span>
        </div>
        <div class="detail-item">
          <div class="detail-icon">🕒</div>
          <span><strong>Time:</strong> {{timestamp}}</span>
        </div>
        <div class="detail-item">
          <div class="detail-icon">🌐</div>
          <span><strong>IP Address:</strong> {{ipAddress}}</span>
        </div>
      </div>
      
      <p><strong>Was this you?</strong> If yes, you can ignore this email. If not, please secure your account immediately.</p>
      
      <div style="text-align: center;">
        <a href="{{secureAccountUrl}}" class="secure-button">Secure My Account</a>
      </div>
      
      <div class="security-tips">
        <h3>🛡️ Security Tips</h3>
        <ul style="margin-left: 20px; color: #4b5563;">
          <li>Use a strong, unique password</li>
          <li>Enable two-factor authentication</li>
          <li>Log out from shared devices</li>
          <li>Keep your software updated</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Security Alert - New Device Login

Hi {{firstName}},

We detected a new login to your account from a device we don't recognize.

Login Details:
- Device: {{deviceInfo}}
- Location: {{location}}
- Time: {{timestamp}}
- IP Address: {{ipAddress}}

Was this you? If yes, you can ignore this email. If not, please secure your account immediately.

Secure My Account: {{secureAccountUrl}}

Security Tips:
- Use a strong, unique password
- Enable two-factor authentication
- Log out from shared devices
- Keep your software updated

Best regards,
The Talents & Stars Team`,
    sort_order: 15
  },
  {
    name: 'team_collaboration',
    subject: 'You\'ve Been Added to Team {{teamName}} 👥',
    category: 'notification',
    description: 'Team collaboration invitation',
    variables: ['firstName', 'teamName', 'inviterName', 'role', 'projectDescription', 'acceptUrl', 'teamUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f4f8; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 30px; text-align: center; color: white; }
    .team-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .content { padding: 40px 30px; }
    .team-info { background: #f0f9ff; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .role-badge { background: #06b6d4; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 10px 0; }
    .project-description { background: #f8fafc; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; }
    .accept-button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="team-icon">👥</div>
      <h1>Join Our Team!</h1>
      <p>You've been invited to collaborate</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Great news! <strong>{{inviterName}}</strong> has invited you to join their team.</p>
      
      <div class="team-info">
        <h3>Team: {{teamName}}</h3>
        <div class="role-badge">{{role}}</div>
        <p>You'll be working as a {{role}} on this exciting project.</p>
      </div>
      
      <div class="project-description">
        <h3>📋 Project Overview</h3>
        <p>{{projectDescription}}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{acceptUrl}}" class="accept-button">Accept Invitation</a>
      </div>
      
      <p>Once you accept, you'll have access to the team workspace and can start collaborating immediately.</p>
      
      <p>Team workspace: <a href="{{teamUrl}}">{{teamUrl}}</a></p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `You've Been Added to Team {{teamName}}

Hi {{firstName}},

Great news! {{inviterName}} has invited you to join their team.

Team: {{teamName}}
Role: {{role}}

Project Overview:
{{projectDescription}}

Accept Invitation: {{acceptUrl}}

Once you accept, you'll have access to the team workspace and can start collaborating immediately.

Team workspace: {{teamUrl}}

Best regards,
The Talents & Stars Team`,
    sort_order: 16
  },
  {
    name: 'holiday_greeting',
    subject: 'Season\'s Greetings from Talents & Stars 🎄',
    category: 'marketing',
    description: 'Holiday greeting with special offers',
    variables: ['firstName', 'holidayName', 'specialOffer', 'offerUrl', 'expiryDate', 'wishes'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holiday Greetings</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%); padding: 50px 30px; text-align: center; color: white; position: relative; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="1" fill="white" opacity="0.3"/><circle cx="90" cy="20" r="1.5" fill="white" opacity="0.3"/><circle cx="30" cy="80" r="1" fill="white" opacity="0.3"/><circle cx="70" cy="70" r="1.5" fill="white" opacity="0.3"/></svg>'); }
    .holiday-icon { font-size: 60px; margin-bottom: 20px; }
    .content { padding: 40px 30px; }
    .greeting-card { background: linear-gradient(135deg, #fef2f2 0%, #fce7e7 100%); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
    .offer-box { background: #059669; color: white; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .offer-button { display: inline-block; background: white; color: #059669; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; }
    .expiry-note { background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center; color: #92400e; }
    .footer { background: #0f172a; color: white; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="holiday-icon">🎄</div>
      <h1>Happy {{holidayName}}!</h1>
      <p>Season's Greetings from all of us</p>
    </div>
    
    <div class="content">
      <div class="greeting-card">
        <h2>🎉 {{wishes}}</h2>
        <p>From all of us at Talents & Stars, we wish you joy, success, and wonderful moments with your loved ones.</p>
      </div>
      
      <p>Hi {{firstName}},</p>
      <p>As we celebrate this special season, we want to thank you for being part of our amazing community.</p>
      
      <div class="offer-box">
        <h3>🎁 Special Holiday Offer</h3>
        <p>{{specialOffer}}</p>
        <a href="{{offerUrl}}" class="offer-button">Claim Your Offer</a>
      </div>
      
      <div class="expiry-note">
        <p>⏰ This special offer expires on {{expiryDate}}</p>
      </div>
      
      <p>Thank you for making Talents & Stars a place where dreams come true. Here's to an even more successful year ahead!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
      <p>Wishing you a wonderful holiday season!</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Season's Greetings from Talents & Stars

Hi {{firstName}},

Happy {{holidayName}}!

{{wishes}}

From all of us at Talents & Stars, we wish you joy, success, and wonderful moments with your loved ones.

As we celebrate this special season, we want to thank you for being part of our amazing community.

Special Holiday Offer:
{{specialOffer}}

Claim Your Offer: {{offerUrl}}

This special offer expires on {{expiryDate}}

Thank you for making Talents & Stars a place where dreams come true. Here's to an even more successful year ahead!

Best regards,
The Talents & Stars Team`,
    sort_order: 17
  },
  {
    name: 'data_export_ready',
    subject: 'Your Data Export is Ready for Download 📊',
    category: 'system',
    description: 'GDPR-compliant data export notification',
    variables: ['firstName', 'exportType', 'downloadUrl', 'fileSize', 'expiryDate', 'supportUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Export Ready</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); padding: 30px; text-align: center; color: white; }
    .export-icon { width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .content { padding: 30px; }
    .export-details { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .detail-item { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .detail-label { font-weight: 600; color: #374151; }
    .detail-value { color: #1f2937; }
    .download-section { background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .download-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; }
    .expiry-warning { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 15px 0; color: #92400e; }
    .privacy-note { background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 15px 0; font-size: 14px; color: #6b7280; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="export-icon">📊</div>
      <h1>Data Export Ready</h1>
      <p>Your requested data is now available</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Your data export request has been processed successfully. Your files are ready for download.</p>
      
      <div class="export-details">
        <h3>Export Details</h3>
        <div class="detail-item">
          <span class="detail-label">Export Type:</span>
          <span class="detail-value">{{exportType}}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">File Size:</span>
          <span class="detail-value">{{fileSize}}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Generated:</span>
          <span class="detail-value">Just now</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Expires:</span>
          <span class="detail-value">{{expiryDate}}</span>
        </div>
      </div>
      
      <div class="download-section">
        <h3>🔒 Secure Download</h3>
        <p>Your data is encrypted and available for secure download.</p>
        <a href="{{downloadUrl}}" class="download-button">Download My Data</a>
      </div>
      
      <div class="expiry-warning">
        <p>⚠️ This download link will expire on {{expiryDate}} for security reasons.</p>
      </div>
      
      <div class="privacy-note">
        <p><strong>Privacy Note:</strong> This export contains your personal data as requested. Please store it securely and delete it when no longer needed.</p>
      </div>
      
      <p>If you have any questions about your data export, please contact our support team: <a href="{{supportUrl}}">{{supportUrl}}</a></p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Your Data Export is Ready for Download

Hi {{firstName}},

Your data export request has been processed successfully. Your files are ready for download.

Export Details:
- Export Type: {{exportType}}
- File Size: {{fileSize}}
- Generated: Just now
- Expires: {{expiryDate}}

Secure Download: {{downloadUrl}}

This download link will expire on {{expiryDate}} for security reasons.

Privacy Note: This export contains your personal data as requested. Please store it securely and delete it when no longer needed.

If you have any questions about your data export, please contact our support team: {{supportUrl}}

Best regards,
The Talents & Stars Team`,
    sort_order: 18
  },
  {
    name: 'referral_reward',
    subject: 'You Earned a Referral Reward! 🎉',
    category: 'notification',
    description: 'Referral program reward notification',
    variables: ['firstName', 'referredName', 'rewardAmount', 'rewardType', 'totalReferrals', 'nextTierReward', 'redeemUrl'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Referral Reward</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fef7ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); padding: 50px 30px; text-align: center; color: white; position: relative; }
    .celebration { font-size: 60px; margin-bottom: 20px; animation: bounce 2s infinite; }
    @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
    .content { padding: 40px 30px; }
    .reward-card { background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; border: 2px solid #e9d5ff; }
    .reward-amount { font-size: 36px; font-weight: 700; color: #a855f7; margin: 15px 0; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
    .stat-card { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 5px; }
    .stat-label { font-size: 14px; color: #6b7280; }
    .redeem-button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .next-tier { background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="celebration">🎉</div>
      <h1>Congratulations!</h1>
      <p>You've earned a referral reward</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Great news! <strong>{{referredName}}</strong> just joined Talents & Stars using your referral link.</p>
      
      <div class="reward-card">
        <h3>🎁 Your Reward</h3>
        <div class="reward-amount">{{rewardAmount}}</div>
        <p>{{rewardType}}</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{totalReferrals}}</div>
          <div class="stat-label">Total Referrals</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{nextTierReward}}</div>
          <div class="stat-label">Next Tier Reward</div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="{{redeemUrl}}" class="redeem-button">Redeem Reward</a>
      </div>
      
      <div class="next-tier">
        <h3>🚀 Keep Going!</h3>
        <p>Refer more friends to unlock even better rewards and exclusive benefits.</p>
      </div>
      
      <p>Thank you for helping us grow the Talents & Stars community!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `You Earned a Referral Reward!

Hi {{firstName}},

Great news! {{referredName}} just joined Talents & Stars using your referral link.

Your Reward: {{rewardAmount}} {{rewardType}}

Stats:
- Total Referrals: {{totalReferrals}}
- Next Tier Reward: {{nextTierReward}}

Redeem Reward: {{redeemUrl}}

Keep Going!
Refer more friends to unlock even better rewards and exclusive benefits.

Thank you for helping us grow the Talents & Stars community!

Best regards,
The Talents & Stars Team`,
    sort_order: 19
  },
  {
    name: 'maintenance_notification',
    subject: 'Scheduled Maintenance - {{maintenanceDate}} 🔧',
    category: 'system',
    description: 'System maintenance notification',
    variables: ['firstName', 'maintenanceDate', 'startTime', 'endTime', 'duration', 'affectedServices', 'improvements'],
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance Notification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white; }
    .maintenance-icon { width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .content { padding: 30px; }
    .schedule-card { background: #fffbeb; border: 1px solid #fed7aa; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .schedule-item { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .schedule-label { font-weight: 600; color: #92400e; }
    .schedule-value { color: #1f2937; }
    .affected-services { background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .improvements-list { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="maintenance-icon">🔧</div>
      <h1>Scheduled Maintenance</h1>
      <p>We're improving our platform for you</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We're writing to inform you about scheduled maintenance to improve our platform performance and add new features.</p>
      
      <div class="schedule-card">
        <h3>🗓️ Maintenance Schedule</h3>
        <div class="schedule-item">
          <span class="schedule-label">Date:</span>
          <span class="schedule-value">{{maintenanceDate}}</span>
        </div>
        <div class="schedule-item">
          <span class="schedule-label">Start Time:</span>
          <span class="schedule-value">{{startTime}}</span>
        </div>
        <div class="schedule-item">
          <span class="schedule-label">End Time:</span>
          <span class="schedule-value">{{endTime}}</span>
        </div>
        <div class="schedule-item">
          <span class="schedule-label">Duration:</span>
          <span class="schedule-value">{{duration}}</span>
        </div>
      </div>
      
      <div class="affected-services">
        <h3>⚠️ Affected Services</h3>
        <p>{{affectedServices}}</p>
      </div>
      
      <div class="improvements-list">
        <h3>✨ What We're Improving</h3>
        <p>{{improvements}}</p>
      </div>
      
      <p>We apologize for any inconvenience and appreciate your patience as we work to enhance your experience.</p>
      
      <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Talents & Stars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Scheduled Maintenance - {{maintenanceDate}}

Hi {{firstName}},

We're writing to inform you about scheduled maintenance to improve our platform performance and add new features.

Maintenance Schedule:
- Date: {{maintenanceDate}}
- Start Time: {{startTime}}
- End Time: {{endTime}}
- Duration: {{duration}}

Affected Services:
{{affectedServices}}

What We're Improving:
{{improvements}}

We apologize for any inconvenience and appreciate your patience as we work to enhance your experience.

If you have any questions or concerns, please don't hesitate to contact our support team.

Best regards,
The Talents & Stars Team`,
    sort_order: 20
  }
];

async function seedBeautifulTemplates() {
  console.log('Seeding beautiful email templates...');
  
  const client = await pool.connect();
  
  try {
    // Create templates table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        subject VARCHAR(500) NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT NOT NULL,
        variables TEXT[] DEFAULT '{}',
        description TEXT,
        category VARCHAR(100) DEFAULT 'notification',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist
    try {
      await client.query('ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'notification\'');
      await client.query('ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true');
      await client.query('ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0');
    } catch (err) {
      // Columns might already exist
    }

    // Insert templates
    for (const template of beautifulTemplates) {
      try {
        const result = await client.query(
          'SELECT id FROM email_templates WHERE name = $1',
          [template.name]
        );
        
        if (result.rows.length === 0) {
          await client.query(`
            INSERT INTO email_templates (name, subject, html_content, text_content, variables, description, category, is_active, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            template.name,
            template.subject,
            template.html_content,
            template.text_content,
            template.variables,
            template.description,
            template.category,
            true,
            template.sort_order
          ]);
          console.log(`- Created template: ${template.name}`);
        } else {
          console.log(`- Template already exists: ${template.name}`);
        }
      } catch (err) {
        console.error(`Error creating template ${template.name}:`, err);
      }
    }
    
    console.log('Beautiful email templates seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding beautiful email templates:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedBeautifulTemplates()
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBeautifulTemplates, beautifulTemplates };