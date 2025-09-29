// Enhanced OTP service with SMS/Email support
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// SMS configuration (Twilio)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function generateOtp(identifier: string, voterEmail?: string, voterPhone?: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 1000 * 60 * 5; // 5 minutes
  const attempts = 0;
  
  otpStore.set(identifier, { otp, expiresAt, attempts });
  
  // Send OTP via Email if available
  if (voterEmail && process.env.ENABLE_EMAIL_OTP === 'true') {
    try {
      await sendEmailOtp(voterEmail, otp);
      console.log(`[OTP] Email OTP sent to ${voterEmail}`);
    } catch (error) {
      console.error(`[OTP] Failed to send email OTP:`, error);
    }
  }
  
  // Send OTP via SMS if available
  if (voterPhone && process.env.ENABLE_SMS_OTP === 'true') {
    try {
      await sendSmsOtp(voterPhone, otp);
      console.log(`[OTP] SMS OTP sent to ${voterPhone}`);
    } catch (error) {
      console.error(`[OTP] Failed to send SMS OTP:`, error);
    }
  }
  
  // Always show in console for development
  console.log(`[DEV OTP] Generated OTP for ${identifier} -> ${otp} (expires at: ${new Date(expiresAt).toISOString()})`);
  console.log(`[DEBUG] OTP Store size: ${otpStore.size}`);
  
  return otp;
}

async function sendEmailOtp(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@evoting.com',
    to: email,
    subject: 'Your Voting OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e88e5;">E-Voting System</h2>
        <p>Your One-Time Password (OTP) for voting is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1e88e5; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p><strong>This OTP is valid for 5 minutes only.</strong></p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from the E-Voting System.</p>
      </div>
    `
  };
  
  await emailTransporter.sendMail(mailOptions);
}

async function sendSmsOtp(phone: string, otp: string) {
  const message = `Your E-Voting OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`;
  
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
}


export function verifyOtp(identifier: string, otp: string) {
  console.log(`[DEBUG] Verifying OTP for ${identifier} with OTP: ${otp}`);
  const entry = otpStore.get(identifier);
  if (!entry) {
    console.log(`[DEBUG] No OTP entry found for ${identifier}`);
    return false;
  }
  
  // Check if OTP has expired
  if (Date.now() > entry.expiresAt) { 
    console.log(`[DEBUG] OTP expired for ${identifier} (expired at: ${new Date(entry.expiresAt).toISOString()})`);
    otpStore.delete(identifier); 
    return false; 
  }
  
  // Check attempt limit (max 3 attempts)
  if (entry.attempts >= 3) {
    console.log(`[DEBUG] Too many attempts for ${identifier}`);
    otpStore.delete(identifier);
    return false;
  }
  
  const ok = entry.otp === otp;
  entry.attempts++;
  
  console.log(`[DEBUG] OTP verification result for ${identifier}: ${ok} (expected: ${entry.otp}, received: ${otp}, attempts: ${entry.attempts})`);
  
  if (ok) {
    console.log(`[DEBUG] OTP verified successfully for ${identifier}, removing from store`);
    otpStore.delete(identifier);
  } else {
    // Update attempts count
    otpStore.set(identifier, entry);
  }
  
  return ok;
}

// Function to regenerate OTP (for multiple voters)
export async function regenerateOtp(identifier: string, voterEmail?: string, voterPhone?: string) {
  // Remove existing OTP
  otpStore.delete(identifier);
  
  // Generate new OTP
  return await generateOtp(identifier, voterEmail, voterPhone);
}

// Function to check if OTP exists and is valid
export function hasValidOtp(identifier: string): boolean {
  const entry = otpStore.get(identifier);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(identifier);
    return false;
  }
  return true;
}