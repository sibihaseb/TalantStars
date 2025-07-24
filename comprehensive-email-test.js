// Comprehensive email system testing - test all email types including password reset, job communications, etc.
import axios from 'axios';

const testEmail = 'marty@24flix.com';
const baseURL = 'http://localhost:5000';

async function testAllEmailTypes() {
  console.log('🧪 COMPREHENSIVE EMAIL TESTING - All email types with proper branding');
  console.log('📧 Testing emails to:', testEmail);
  console.log('📧 From: Talents & Stars <onboarding@resend.dev>');
  console.log('📧 Reply-To: noreply@talentsandstars.com');
  console.log('');
  
  const emailTests = [
    {
      name: '1. Basic Test Email',
      endpoint: '/api/admin/test-email',
      data: { email: testEmail },
      description: 'Basic email system functionality test'
    },
    {
      name: '2. Welcome Email - Talent Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'talent'
      },
      description: 'Welcome email for talent users'
    },
    {
      name: '3. Welcome Email - Manager Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'manager'
      },
      description: 'Welcome email for manager users'
    },
    {
      name: '4. Welcome Email - Producer Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'producer'
      },
      description: 'Welcome email for producer users'
    },
    {
      name: '5. Welcome Email - Agent Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'agent'
      },
      description: 'Welcome email for agent users'
    },
    {
      name: '6. Password Reset Email',
      endpoint: '/api/test-password-reset',
      data: { 
        email: testEmail,
        firstName: 'Marty'
      },
      description: 'Password reset email with secure reset link'
    },
    {
      name: '7. Job Application Notification',
      endpoint: '/api/test-job-notification',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        jobTitle: 'Lead Actor - Netflix Series',
        applicantName: 'Maya Thompson'
      },
      description: 'Email when someone applies to your job posting'
    },
    {
      name: '8. Job Communication Notification',
      endpoint: '/api/test-job-communication-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        jobTitle: 'Feature Film Production',
        senderName: 'Tom Glassman',
        message: 'Hello, I am very interested in this position. Could we schedule a discussion about the role requirements?'
      },
      description: 'Email notification for job-related messages'
    },
    {
      name: '9. Job Match Notification',
      endpoint: '/api/test-job-match-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        jobTitle: 'Lead Actor for Blockbuster Film',
        jobLocation: 'Vancouver, BC',
        matchScore: '95%',
        jobDescription: 'Major studio blockbuster seeking experienced lead actor for $50M production'
      },
      description: 'Email notification for AI-matched job opportunities'
    },
    {
      name: '10. Meeting Invitation Email',
      endpoint: '/api/test-meeting-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        meetingTitle: 'Casting Discussion',
        meetingDate: 'July 28, 2025',
        meetingTime: '2:00 PM PST'
      },
      description: 'Meeting invitation email for industry professionals'
    },
    {
      name: '11. Profile Verification Email',
      endpoint: '/api/test-verification-email',
      data: { 
        email: testEmail,
        firstName: 'Marty'
      },
      description: 'Email notification when profile gets verified'
    },
    {
      name: '12. New Message Notification',
      endpoint: '/api/test-message-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        senderName: 'Sarah Productions',
        messagePreview: 'We would like to discuss a potential role for you in our upcoming series...'
      },
      description: 'Email notification for new platform messages'
    }
  ];

  console.log(`📤 Sending ${emailTests.length} different email types to ${testEmail}...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const test of emailTests) {
    try {
      console.log(`📤 ${test.name}: ${test.description}`);
      
      const response = await axios.post(`${baseURL}${test.endpoint}`, test.data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.status === 200) {
        console.log(`  ✅ Success - ${test.name} sent successfully`);
        successCount++;
      } else {
        console.log(`  ❌ Failed - ${test.name} returned status ${response.status}`);
        failureCount++;
      }
    } catch (error) {
      console.log(`  ❌ Error - ${test.name}: ${error.message}`);
      failureCount++;
    }
    
    // Add small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 Email testing completed!\n');
  console.log(`📋 Summary of email testing:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failureCount}`);
  console.log(`  📧 Total: ${emailTests.length}`);
  console.log(`\n📬 Please check ${testEmail} for all test emails.`);
  console.log(`📧 All emails should be from: Talents & Stars <onboarding@resend.dev>`);
  console.log(`📧 All emails should have reply-to: noreply@talentsandstars.com`);
  
  if (successCount === emailTests.length) {
    console.log('\n🎉 All email tests passed! Email system is fully operational.');
  } else {
    console.log(`\n⚠️  ${failureCount} email tests failed. Check server logs for details.`);
  }
}

// Run the comprehensive email test
testAllEmailTypes().catch(console.error);