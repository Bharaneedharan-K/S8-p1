// Use a custom Google Apps Script Web App to bypass Render's SMTP port blocks 
// and 3rd party API spam account activation requirements.
// This sends email securely via the owner's Google account via a simple stateless HTTP POST.

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

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
          .footer {
            background: rgba(0, 0, 0, 0.3);
            color: #cbd5e1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
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
            <p>Your account for the <strong>Blockchain Land Verification System</strong> has been successfully created.</p>
            <p>Please use the credentials below to log in:</p>

            <div class="credentials-box">
              <div class="credential-item">
                <div class="label">Username (Email)</div>
                <div class="value">${recipientEmail}</div>
              </div>
              <div class="credential-item">
                <div class="label">Password</div>
                <div class="value">${password}</div>
              </div>
            </div>

            <p><strong>Instructions:</strong></p>
            <ol style="color:white; padding-left:20px;">
              <li>Go to the Officer Login Portal.</li>
              <li>Enter your username and password.</li>
            </ol>
            <p>Best regards,<br><strong>Admin Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated email via Land Registry Portal.</p>
            <p>© 2026 Blockchain Land Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const payload = {
      to: recipientEmail,
      subject: '🔐 Verify Your Officer Account - Land Verification Portal',
      html: htmlContent
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: we can't send { mode: 'no-cors' } from backend node, but Apps Script standard JSON is fine
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Apps Script:', errorText);
      throw new Error(`Apps Script responded with ${response.status}: ${errorText}`);
    }

    console.log('Officer credentials email sent via Google Apps Script API!');
    return { success: true };

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
    const payload = {
      to: recipientEmail,
      subject: 'Test Email - Land Verification System',
      html: '<h1>Test Email</h1><p>Google Apps Script Email configuration is working correctly!</p>'
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to send test email');

    console.log('Test email sent via Google Apps Script!');
    return { success: true };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
};
