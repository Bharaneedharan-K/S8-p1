import nodemailer from 'nodemailer';

// Create transporter (using Gmail or other email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service connection error:', error);
  } else {
    console.log('Email service is ready to send emails');
  }
});

/**
 * Send officer credentials email
 * @param {string} recipientEmail - Officer's email
 * @param {string} officerName - Officer's full name
 * @param {string} password - Officer's password
 */
export const sendOfficerCredentials = async (recipientEmail, officerName, password) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(to right, #0f172a 0%, #1e293b 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
          .header {
            background: linear-gradient(to right, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            color: white;
            padding: 30px;
          }
          .credentials-box {
            background: rgba(59, 130, 246, 0.1);
            border: 2px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-item {
            margin: 15px 0;
            padding: 12px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
          }
          .label {
            color: #cbd5e1;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .value {
            color: #4ade80;
            font-size: 16px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            word-break: break-all;
          }
          .warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fecaca;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
          }
          .footer {
            background: rgba(0, 0, 0, 0.3);
            color: #cbd5e1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          .button {
            display: inline-block;
            background: linear-gradient(to right, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Land Verification System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Officer Account Created</p>
          </div>

          <div class="content">
            <p>Dear <strong>${officerName}</strong>,</p>

            <p>Welcome to the Land Verification & Scheme Application System! Your officer account has been successfully created by the administrator.</p>

            <p>Your login credentials are provided below:</p>

            <div class="credentials-box">
              <div class="credential-item">
                <div class="label">📧 Email Address</div>
                <div class="value">${recipientEmail}</div>
              </div>

              <div class="credential-item">
                <div class="label">🔐 Password</div>
                <div class="value">${password}</div>
              </div>
            </div>

            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Dashboard</a></p>

            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong><br>
              Please change your password immediately after first login. Keep your credentials secure and never share them with anyone.
            </div>

            <p>
              Your responsibilities as an officer include:<br>
              • Verifying farmer accounts and land documents<br>
              • Recording and validating land information<br>
              • Processing scheme applications<br>
              • Maintaining data integrity
            </p>

            <p>If you have any questions or need assistance, please contact the administrator.</p>

            <p>Best regards,<br><strong>Land Verification System</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© 2026 Land Verification & Scheme Application System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@land-verification.gov',
      to: recipientEmail,
      subject: '🌾 Your Land Verification System Officer Account Credentials',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Officer credentials email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending officer credentials email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send test email to verify configuration
 */
export const sendTestEmail = async (recipientEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@land-verification.gov',
      to: recipientEmail,
      subject: 'Test Email - Land Verification System',
      html: '<h1>Test Email</h1><p>Email configuration is working correctly!</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
};
