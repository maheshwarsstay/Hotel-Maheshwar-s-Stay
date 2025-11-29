# Gmail SMTP Setup Instructions

The email sending is failing because the Gmail credentials are not working. Here's how to fix it:

## Option 1: Verify App Password (Recommended)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (must be enabled first)
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password (without spaces)
6. Update `.env.local` with the new password:
   ```
   GMAIL_APP_PASSWORD=your16charpassword
   ```

## Option 2: Enable Less Secure Apps (Not Recommended)

If you don't want to use App Passwords:
1. Go to https://myaccount.google.com/lesssecureapps
2. Turn on "Allow less secure apps"
3. Use your regular Gmail password in `.env.local`:
   ```
   GMAIL_APP_PASSWORD=yourregularpassword
   ```

## Option 3: Use a Different Email Service

If Gmail doesn't work, you can use other services. Update `app/api/send-email/route.js`:

### For Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})
```

### For Yahoo:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})
```

## Current Issue

The error "Username and Password not accepted" means:
- The app password is incorrect
- 2-Step Verification is not enabled on the Gmail account
- The Gmail account has security restrictions

## After Updating .env.local

1. Stop the development server (Ctrl+C)
2. Restart it: `npm run dev`
3. Try sending the email again

## Test Email

You can test with a temporary email service like:
- https://temp-mail.org/
- https://10minutemail.com/

Just use any email address in the form to test if the SMTP is working.
