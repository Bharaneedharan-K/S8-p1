# 📧 Google Apps Script Email API Setup Guide

Our project uses a completely free, custom-built Google Apps Script to send emails (like Officer Credentials) securely from your Gmail account. 

This method is superior for free hosting tiers (like Render.com) because it completely bypasses standard SMTP port (465/587) blocking and avoids third-party spam restrictions that require manual human account activation (like Brevo/SendGrid).

---

## 🛠️ Step 1: Create the Apps Script
1. Go to your browser and log into the Google Account you want the emails to be sent from.
2. Go to [script.google.com](https://script.google.com/).
3. Click the **"New Project"** button on the top left.
4. Name the project `Land Registry Email API` (or whatever you like) by clicking on "Untitled project" at the top.

## 💻 Step 2: Add the Code
1. In the editor, you will see a default `function myFunction() { }`. 
2. Delete everything and **paste the exact code below**:

```javascript
function doPost(e) {
  try {
    // 1. Parse the incoming JSON payload from our Node.js server
    var data = JSON.parse(e.postData.contents);
    
    // 2. Validate that we received an email 'to' address
    if (!data.to) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: "Missing 'to' parameter"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Command Google's MailApp to send the email directly
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject || "Land Registry Notification",
      htmlBody: data.html || "<p>No HTML Body provided</p>",
      name: data.name || "Land Registry System" // Optional sender name override
    });
    
    // 4. Return success response to Node.js backend
    return ContentService.createTextOutput(JSON.stringify({
      success: true, 
      message: "Email dispatched successfully via Google Servers"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 5. Catch any Google-side errors and return them to the Node server
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```
3. Click the **Save** icon (Floppy Disk) or press `Ctrl + S`.

## 🚀 Step 3: Deploy as a Web App (Creates your API URL)
1. On the top right of the screen, click the **Deploy** button.
2. Select **New deployment**.
3. Click the gear icon `⚙️` next to "Select type" and choose **Web app**.
4. Configure the settings **EXACTLY** like this:
   - **Description**: `Version 1` (or anything)
   - **Execute as**: `Me (your_email@gmail.com)` ⚠️ *(Crucial: This ensures it uses your email to send)*
   - **Who has access**: `Anyone` ⚠️ *(Crucial: This allows your Render backend to ping it without logging in)*
5. Click **Deploy**.

## 🔐 Step 4: Grant Permissions (One-Time)
When you deploy for the very first time, Google will ask for permission to send emails on your behalf.
1. Click **Authorize access**.
2. Select your Google account.
3. You will see a scary warning page ("Google hasn’t verified this app"). 
4. Click **Advanced** at the bottom left.
5. Click **Go to Land Registry Email API (unsafe)**.
6. Click **Allow**.

## 🔗 Step 5: Copy the URL to your project
1. Standard deployment will finish and show a pop-up.
2. Under "Web app", copy the generated **URL**.
   *(It will look like `https://script.google.com/macros/s/AKfy...something.../exec`)*.
3. Open the `server/.env` file in your project code.
4. Paste the URL into the `APPS_SCRIPT_URL` variable:
   ```env
   # Google Apps Script Email API
   APPS_SCRIPT_URL=https://script.google.com/macros/s/....../exec
   ```

You are done! Your backend will now send a simple JSON packet to this URL, and Google will automatically send an email from your Gmail account to the Officer's inbox instantly!
