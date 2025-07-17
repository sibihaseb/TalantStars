console.log('Environment variables check:');
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('RESEND_API_KEY value:', process.env.RESEND_API_KEY ? 'PRESENT' : 'MISSING');
console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);

// Test direct Resend usage
import { Resend } from 'resend';

if (process.env.RESEND_API_KEY) {
  console.log('Attempting to initialize Resend...');
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Resend initialized successfully');
} else {
  console.log('Cannot initialize Resend - no API key');
}