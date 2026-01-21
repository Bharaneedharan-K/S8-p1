# Email Configuration Guide - Officer Credentials

## Overview

When an admin creates a new officer account, the system automatically sends the officer's login credentials (email and password) to their email address.

## Setup Instructions

### Step 1: Enable Gmail API and Generate App Password

1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a **16-character app password**
6. Copy this password (without spaces)

### Step 2: Update .env File

Open `server/.env` and update these values:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Example:**

```env
EMAIL_USER=admin@government.in
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:3000
```

### Step 3: Verify Email Service (Optional)

The system automatically verifies the email connection on server startup. Check server logs for:

- ✅ `Email service is ready to send emails` - Configuration is correct
- ❌ `Email service connection error` - Check your credentials

## How It Works

### When Officer is Created:

1. **Admin creates officer** → Fills form with officer details
2. **Password is set** → Admin enters a password in the form
3. **Officer account saved** → Officer record created in database
4. **Email sent automatically** → Officer's credentials emailed to their address
5. **Success message shown** → Admin sees confirmation that email was sent

### Email Content:

The officer receives a professional HTML email containing:

- ✉️ Their email address
- 🔐 Their login password
- 🔗 Link to login page
- ⚠️ Security warning to change password after first login
- 📋 Overview of officer responsibilities

## Troubleshooting

### Email Not Sending?

1. **Check .env credentials**

   ```bash
   EMAIL_USER=your-email@gmail.com (must be valid)
   EMAIL_PASSWORD=app-password (not your regular password)
   ```

2. **Check Gmail 2-Step Verification**
   - Must be enabled to use App Passwords
   - App Passwords only work with 2FA enabled

3. **Check server logs**

   ```
   // Look for these messages:
   Email service is ready to send emails  // ✅ Good
   Email service connection error         // ❌ Problem with credentials
   ```

4. **Test email configuration**
   - Run the test email endpoint (if implemented)
   - Check spam/junk folder in recipient email

### Common Issues:

| Issue                   | Solution                                             |
| ----------------------- | ---------------------------------------------------- |
| "Invalid credentials"   | Use app password, not regular password               |
| "Less secure app" error | Enable 2-Step Verification in Gmail settings         |
| Email not received      | Check spam folder, verify recipient email is correct |
| Service times out       | Check internet connection, Gmail servers status      |

## Security Considerations

1. ⚠️ **App Password**: Use Google App Password, not your regular password
2. 🔐 **Never commit .env**: Add `.env` to `.gitignore`
3. 📧 **Email in logs**: Server logs contain email addresses (normal)
4. 🔄 **Password change**: Officer should change password on first login
5. 🚨 **Credentials in email**: Considered acceptable for admin-created accounts

## Alternative Email Services

If you want to use a different service instead of Gmail:

### Option 1: SendGrid

```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
```

### Option 2: Outlook/Office365

```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_SERVICE=outlook
```

### Option 3: Nodemailer with SMTP

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

## Files Modified

- `server/utils/email.js` - Email sending utility
- `server/controllers/authController.js` - Updated createOfficer to send email
- `server/.env` - Added email configuration

## Testing

To test the setup:

1. **Create a test officer** through the admin panel
2. **Check the officer's email** for the credentials email
3. **Verify email content** includes name, email, and password
4. **Test login** with the provided credentials

## Environment Variables

```env
EMAIL_USER          # Gmail address
EMAIL_PASSWORD      # Google App Password (16 chars)
FRONTEND_URL        # Frontend URL for login link
NODE_ENV            # development/production
```

## Notes

- 📧 Email sending is **non-blocking** - Officer creation succeeds even if email fails
- 🔍 All email activities are logged to server console
- 🔐 Passwords are never stored in plain text (bcrypt hashed)
- 📱 Officers should change password after first login
- 🌐 Works in both development and production environments
