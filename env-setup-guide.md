# Environment Setup Guide for SMS/Email OTP

## 📧 Email OTP Setup (Gmail)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication
- Generate an "App Password" for the e-voting system

### 2. Environment Variables
Add these to your `.env` file:

```bash
# Email Configuration
ENABLE_EMAIL_OTP=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 3. Test Email Setup
```bash
# Test with a voter who has an email address
# OTP will be sent to their email automatically
```

## 📱 SMS OTP Setup (Twilio)

### 1. Create Twilio Account
- Sign up at [twilio.com](https://twilio.com)
- Get your Account SID and Auth Token
- Purchase a phone number

### 2. Environment Variables
Add these to your `.env` file:

```bash
# SMS Configuration
ENABLE_SMS_OTP=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Test SMS Setup
```bash
# Test with a voter who has a phone number
# OTP will be sent via SMS automatically
```

## 🔧 Complete Environment File

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/evoting

# JWT Secrets
JWT_ADMIN_SECRET=your_admin_jwt_secret_here
JWT_VOTER_SECRET=your_voter_jwt_secret_here
TOKEN_SECRET=your_token_secret_here
OTP_SECRET=your_otp_secret_here

# Server Configuration
PORT=4000
NODE_ENV=development

# Email Configuration (for OTP delivery)
ENABLE_EMAIL_OTP=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (for OTP delivery via Twilio)
ENABLE_SMS_OTP=false
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Rate Limiting
OTP_RATE_LIMIT_WINDOW=60000
OTP_RATE_LIMIT_MAX=5
VOTE_RATE_LIMIT_WINDOW=300000
VOTE_RATE_LIMIT_MAX=3
```

## 📦 Required Dependencies

Add these to your `package.json`:

```bash
npm install nodemailer twilio
npm install --save-dev @types/nodemailer
```

## 🚀 How It Works

### OTP Delivery Priority:
1. **Email** (if `ENABLE_EMAIL_OTP=true` and voter has email)
2. **SMS** (if `ENABLE_SMS_OTP=true` and voter has phone)
3. **Console** (development mode - always shows OTP)

### Multiple Voters Support:
- Each voter gets their own OTP
- OTPs are single-use (security)
- "Resend OTP" button for new OTPs
- Max 3 attempts per OTP
- 5-minute expiration

### Security Features:
- Rate limiting (max 5 OTP requests per minute)
- Attempt limiting (max 3 attempts per OTP)
- Automatic expiration (5 minutes)
- Single-use OTPs

## 🧪 Testing

### Test with Email:
1. Set `ENABLE_EMAIL_OTP=true`
2. Add voter with email address
3. Login - OTP sent to email
4. Check email for OTP

### Test with SMS:
1. Set `ENABLE_SMS_OTP=true`
2. Add voter with phone number
3. Login - OTP sent via SMS
4. Check phone for SMS

### Test Multiple Voters:
1. Add multiple voters
2. Each can request their own OTP
3. Use "Resend OTP" for new OTPs
4. Each OTP works only once

## 💰 Cost Considerations

### Email (Gmail):
- **Free** for personal use
- **Paid** for business use (Google Workspace)

### SMS (Twilio):
- **~$0.0075 per SMS** in US
- **~$0.05-0.10 per SMS** internationally
- **Free trial** available

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong, unique secrets
- Enable rate limiting in production
- Monitor OTP usage for abuse
- Consider IP-based rate limiting for production

