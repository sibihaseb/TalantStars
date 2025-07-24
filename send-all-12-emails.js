// Send all 12 email types to verify complete email system functionality
import axios from 'axios';

const primaryEmail = 'marty@24flix.com';
const fallbackEmail = 'marty@24flix.com';
const baseURL = 'http://localhost:5000';

async function sendEmailWithFallback(endpoint, data, description) {
  try {
    // Try primary email first
    console.log(`📤 Attempting ${description} to ${primaryEmail}...`);
    const response = await axios.post(`${baseURL}${endpoint}`, { ...data, email: primaryEmail });
    console.log(`  ✅ Success - ${description} sent to ${primaryEmail}`);
    return true;
  } catch (error) {
    if (error.response?.status === 403 || error.message.includes('testing emails')) {
      // Try fallback email
      console.log(`  ⚠️  Primary email restricted, trying ${fallbackEmail}...`);
      try {
        const response = await axios.post(`${baseURL}${endpoint}`, { ...data, email: fallbackEmail });
        console.log(`  ✅ Success - ${description} sent to ${fallbackEmail}`);
        return true;
      } catch (fallbackError) {
        console.log(`  ❌ Error - ${description}: ${fallbackError.message}`);
        return false;
      }
    } else {
      console.log(`  ❌ Error - ${description}: ${error.message}`);
      return false;
    }
  }
}

async function sendAll12Emails() {
  console.log('🧪 SENDING ALL 12 EMAIL TYPES - Complete Email System Test');
  console.log(`📧 Primary recipient: ${primaryEmail}`);
  console.log(`📧 Fallback recipient: ${fallbackEmail}`);
  console.log(`📧 From: Talents & Stars <onboarding@resend.dev>`);
  console.log(`📧 Reply-To: noreply@talentsandstars.com\n`);

  let successCount = 0;
  let failCount = 0;

  const emailTests = [
    {
      endpoint: '/api/admin/test-email',
      data: {},
      description: '1. Basic Test Email'
    },
    {
      endpoint: '/api/test-welcome-email',
      data: { role: 'talent' },
      description: '2. Welcome Email - Talent Role'
    },
    {
      endpoint: '/api/test-welcome-email',
      data: { role: 'manager' },
      description: '3. Welcome Email - Manager Role'
    },
    {
      endpoint: '/api/test-welcome-email',
      data: { role: 'producer' },
      description: '4. Welcome Email - Producer Role'
    },
    {
      endpoint: '/api/test-welcome-email',
      data: { role: 'agent' },
      description: '5. Welcome Email - Agent Role'
    },
    {
      endpoint: '/api/test-password-reset',
      data: {},
      description: '6. Password Reset Email'
    },
    {
      endpoint: '/api/test-job-notification',
      data: {},
      description: '7. Job Application Notification'
    },
    {
      endpoint: '/api/test-job-communication-email',
      data: {},
      description: '8. Job Communication Notification'
    },
    {
      endpoint: '/api/test-job-match-email',
      data: {},
      description: '9. Job Match Notification'
    },
    {
      endpoint: '/api/test-meeting-email',
      data: {},
      description: '10. Meeting Invitation Email'
    },
    {
      endpoint: '/api/test-verification-email',
      data: {},
      description: '11. Profile Verification Email'
    },
    {
      endpoint: '/api/test-message-email',
      data: {},
      description: '12. New Message Notification'
    }
  ];

  console.log(`📤 Sending ${emailTests.length} different email types...\n`);

  for (const test of emailTests) {
    const success = await sendEmailWithFallback(test.endpoint, test.data, test.description);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 Email sending completed!\n');
  console.log('📋 Summary of email sending:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📧 Total: ${emailTests.length}\n`);

  if (successCount === emailTests.length) {
    console.log('🎉 All emails sent successfully! Check your email inbox.');
  } else if (successCount > 0) {
    console.log(`📬 ${successCount} emails sent successfully. Check your email inbox.`);
    console.log(`⚠️  ${failCount} email(s) failed. Check server logs for details.`);
  } else {
    console.log('❌ All emails failed to send. Check server configuration.');
  }

  console.log('\n📧 All emails should be from: Talents & Stars <onboarding@resend.dev>');
  console.log('📧 All emails should have reply-to: noreply@talentsandstars.com');
}

// Run the email sending
sendAll12Emails().catch(console.error);