#!/usr/bin/env node

import axios from 'axios';

// Email testing configuration
const CONFIG = {
  baseUrl: 'http://localhost:5000',
  primaryEmail: 'marty@24flix.com',
  from: 'Talents & Stars <onboarding@resend.dev>',
  replyTo: 'noreply@talentsandstars.com'
};

// Email test definitions with endpoint URLs
const EMAIL_TESTS = [
  { name: 'Basic Test Email', endpoint: '/api/admin/test-email', method: 'POST' },
  { name: 'Welcome Email - Talent Role', endpoint: '/api/test-welcome-email', method: 'POST', data: { role: 'talent' } },
  { name: 'Welcome Email - Manager Role', endpoint: '/api/test-welcome-email', method: 'POST', data: { role: 'manager' } },
  { name: 'Welcome Email - Producer Role', endpoint: '/api/test-welcome-email', method: 'POST', data: { role: 'producer' } },
  { name: 'Welcome Email - Agent Role', endpoint: '/api/test-welcome-email', method: 'POST', data: { role: 'agent' } },
  { name: 'Password Reset Email', endpoint: '/api/test-password-reset', method: 'POST' },
  { name: 'Job Application Notification', endpoint: '/api/test-job-notification', method: 'POST' },
  { name: 'Job Communication Notification', endpoint: '/api/test-job-communication-email', method: 'POST', data: { firstName: 'Test', jobTitle: 'Lead Actor', senderName: 'Casting Director', message: 'We are interested in your profile for our upcoming production.' } },
  { name: 'Job Match Notification', endpoint: '/api/test-job-match-email', method: 'POST', data: { firstName: 'Test', jobTitle: 'Feature Film Lead', jobLocation: 'Los Angeles, CA', matchScore: '95%', jobDescription: 'Perfect match for your acting experience and location preferences.' } },
  { name: 'Meeting Invitation Email', endpoint: '/api/test-meeting-email', method: 'POST' },
  { name: 'Profile Verification Email', endpoint: '/api/test-verification-email', method: 'POST' },
  { name: 'New Message Notification', endpoint: '/api/test-message-email', method: 'POST' }
];

async function sendEmailTest(test) {
  try {
    console.log(`📤 Testing: ${test.name}`);
    
    const requestData = {
      email: CONFIG.primaryEmail,
      ...test.data
    };
    
    const response = await axios({
      method: test.method,
      url: `${CONFIG.baseUrl}${test.endpoint}`,
      data: requestData,
      timeout: 30000
    });
    
    if (response.status === 200) {
      console.log(`  ✅ API Success - ${test.name}`);
      console.log(`  📧 Response: ${JSON.stringify(response.data)}`);
      return { success: true, name: test.name, response: response.data };
    } else {
      console.log(`  ❌ API Error - ${test.name}: Status ${response.status}`);
      return { success: false, name: test.name, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`  ❌ Request Failed - ${test.name}: ${error.message}`);
    return { success: false, name: test.name, error: error.message };
  }
}

async function runEmailDeliveryTest() {
  console.log('🧪 EMAIL DELIVERY VERIFICATION TEST');
  console.log(`📧 Target Email: ${CONFIG.primaryEmail}`);
  console.log(`📧 From: ${CONFIG.from}`);
  console.log(`📧 Reply-To: ${CONFIG.replyTo}`);
  console.log('🔍 Checking for actual Resend API delivery...\n');
  
  const results = [];
  
  for (const test of EMAIL_TESTS) {
    const result = await sendEmailTest(test);
    results.push(result);
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📋 EMAIL DELIVERY TEST SUMMARY:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful API Calls: ${successful.length}`);
  console.log(`❌ Failed API Calls: ${failed.length}`);
  console.log(`📧 Total Tests: ${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL TESTS:');
    successful.forEach(result => {
      console.log(`  - ${result.name}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach(result => {
      console.log(`  - ${result.name}: ${result.error}`);
    });
  }
  
  console.log('\n🔍 NOTE: Check server logs for actual Resend email IDs to confirm delivery');
  console.log('📧 Expected format: "Email sent successfully via Resend: [email-id]"');
  console.log('\n📬 Check your email inbox at marty@24flix.com for delivered emails.');
}

// Run the test
runEmailDeliveryTest().catch(console.error);