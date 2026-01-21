import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to verify email configuration
 * Run with: node utils/testEmail.js
 */

async function testEmailConfiguration() {
  console.log('\n🧪 Testing Email Configuration...\n');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set (hidden)' : '✗ Not set');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    console.log('\n🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Email service is ready!');
    
    // Try to send test email
    console.log('\n📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email - Land Verification System',
      html: '<h1>✅ Test Successful!</h1><p>Email configuration is working correctly.</p>',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Email Configuration Error:');
    console.error('Error:', error.message);
    console.error('\n💡 Solutions:');
    console.error('1. Check if 2-Step Verification is enabled: https://myaccount.google.com/security');
    console.error('2. Generate new App Password: https://myaccount.google.com/apppasswords');
    console.error('3. Make sure you copy the password WITHOUT spaces');
    console.error('4. Restart the server after updating .env');
    process.exit(1);
  }
}

testEmailConfiguration();
