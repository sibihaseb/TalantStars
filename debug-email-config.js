// Debug email configuration and test Resend API directly
import { Resend } from 'resend';

async function debugEmailConfig() {
  console.log('🔍 Debugging Email Configuration...\n');
  
  // Check environment variables
  const apiKey = process.env.RESEND_API_KEY;
  console.log('📋 Environment Check:');
  console.log('  RESEND_API_KEY exists:', !!apiKey);
  console.log('  API Key starts with re_:', apiKey?.startsWith('re_') || false);
  console.log('  API Key length:', apiKey?.length || 0);
  console.log('');
  
  if (!apiKey) {
    console.log('❌ ERROR: RESEND_API_KEY not found in environment variables');
    console.log('💡 Solution: Add RESEND_API_KEY to environment secrets');
    return;
  }
  
  if (!apiKey.startsWith('re_')) {
    console.log('❌ ERROR: Invalid Resend API key format');
    console.log('💡 Expected format: re_xxxxxxxxxx');
    console.log('💡 Current format:', apiKey.substring(0, 10) + '...');
    return;
  }
  
  // Test Resend API directly
  console.log('🧪 Testing Resend API directly...');
  const resend = new Resend(apiKey);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Talents & Stars <onboarding@resend.dev>',
      to: 'marty@24flix.com',
      subject: '🔧 Direct Resend API Test',
      reply_to: 'noreply@talentsandstars.com',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">🔧 Direct Resend API Test</h2>
          <p>This email was sent directly through the Resend API to test configuration.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>From: Talents & Stars &lt;onboarding@resend.dev&gt;</li>
            <li>Reply-To: noreply@talentsandstars.com</li>
            <li>API Key: Valid (re_...)</li>
            <li>Test Time: ${new Date().toISOString()}</li>
          </ul>
          <p>If you receive this email, the Resend configuration is working correctly.</p>
        </div>
      `,
      text: 'Direct Resend API Test - If you receive this, the configuration is working.'
    });

    if (error) {
      console.log('❌ Resend API Error:', error);
      console.log('');
      
      // Common error diagnostics
      if (error.message?.includes('API key')) {
        console.log('💡 Solution: Check that your Resend API key is correct');
        console.log('💡 Get your API key from: https://resend.com/api-keys');
      } else if (error.message?.includes('domain')) {
        console.log('💡 Solution: Verify that onboarding@resend.dev is a valid sending domain');
        console.log('💡 You may need to use your own verified domain');
      } else if (error.message?.includes('rate limit')) {
        console.log('💡 Solution: You may have hit rate limits - wait a few minutes');
      }
      
      return;
    }

    console.log('✅ Direct Resend API Test SUCCESSFUL!');
    console.log('📧 Email ID:', data?.id);
    console.log('📧 Email sent to: marty@onlinechannel.tv');
    console.log('📧 From: Talents & Stars <onboarding@resend.dev>');
    console.log('📧 Reply-To: noreply@talentsandstars.com');
    console.log('');
    console.log('🔍 Check your email inbox for the test message.');
    console.log('');
    
    // If direct test works, the issue might be in our application code
    console.log('💡 Since direct API test succeeded, checking application email function...');
    
  } catch (error) {
    console.log('❌ Unexpected Error:', error.message);
    console.log('');
    
    if (error.message.includes('fetch')) {
      console.log('💡 Solution: Check internet connection and API accessibility');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Solution: API request timed out - try again');
    }
  }
}

// Run debug
debugEmailConfig().catch(console.error);