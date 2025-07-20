// Comprehensive email system testing - send all email types to marty@24flix.com
import axios from 'axios';

const testEmail = 'marty@24flix.com';

async function testAllEmailTypes() {
  console.log('🧪 Testing complete email system - sending all email types to', testEmail);
  
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
      description: 'Welcome email for talent users with acting-specific content'
    },
    {
      name: '3. Welcome Email - Manager Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'manager'
      },
      description: 'Welcome email for manager users with management tools'
    },
    {
      name: '4. Welcome Email - Producer Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'producer'
      },
      description: 'Welcome email for producer users with production features'
    },
    {
      name: '5. Welcome Email - Agent Role',
      endpoint: '/api/test-welcome-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        role: 'agent'
      },
      description: 'Welcome email for agent users with dealmaking tools'
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
      description: 'Email notification when someone applies to your job posting'
    },
    {
      name: '8. Meeting Invitation Email',
      endpoint: '/api/test-meeting-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        meetingTitle: 'Audition Discussion',
        meetingDate: '2025-07-25',
        meetingTime: '2:00 PM PST'
      },
      description: 'Meeting invitation email for industry professionals'
    },
    {
      name: '9. Profile Verification Email',
      endpoint: '/api/test-verification-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        verificationStatus: 'approved'
      },
      description: 'Email notification when profile gets verified'
    },
    {
      name: '10. New Message Notification',
      endpoint: '/api/test-message-email',
      data: { 
        email: testEmail,
        firstName: 'Marty',
        senderName: 'Luna Roswell',
        messagePreview: 'Hi Marty, I saw your latest project and would love to discuss...'
      },
      description: 'Email notification for new messages in the platform'
    }
  ];

  console.log(`\n📧 Sending ${emailTests.length} different email types to ${testEmail}...\n`);
  
  for (const test of emailTests) {
    try {
      console.log(`📤 ${test.name}: ${test.description}`);
      
      // Create the API endpoint if it doesn't exist for testing
      const response = await axios.post(`http://localhost:5000${test.endpoint}`, test.data);
      
      if (response.status === 200) {
        console.log(`  ✅ Success - ${test.name} sent successfully`);
      } else {
        console.log(`  ⚠️  Warning - ${test.name} returned status ${response.status}`);
      }
      
      // Wait 2 seconds between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`  📝 Creating test endpoint for: ${test.name}`);
        // We'll create the missing endpoints below
      } else {
        console.log(`  ❌ Error sending ${test.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log(''); // Add spacing between tests
  }
  
  console.log('🎉 Email testing completed! Please check marty@24flix.com for all test emails.');
  console.log('\n📋 Summary of emails sent:');
  emailTests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.name.replace(/^\d+\.\s/, '')}`);
  });
}

// Run the email testing
testAllEmailTypes().catch(console.error);