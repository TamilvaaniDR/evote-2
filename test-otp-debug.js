/**
 * Debug script to test OTP generation and verification
 * Run this to verify the OTP system is working correctly
 */

// Simulate the OTP service
const otpStore = new Map();

function generateOtp(identifier) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 1000 * 60 * 5; // 5 minutes
  otpStore.set(identifier, { otp, expiresAt });
  console.log(`[DEV OTP] ${identifier} -> ${otp}`);
  return otp;
}

function verifyOtp(identifier, otp) {
  const entry = otpStore.get(identifier);
  if (!entry) {
    console.log(`❌ No OTP found for identifier: ${identifier}`);
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    console.log(`❌ OTP expired for identifier: ${identifier}`);
    otpStore.delete(identifier);
    return false;
  }
  const ok = entry.otp === otp;
  if (ok) {
    console.log(`✅ OTP verified successfully for identifier: ${identifier}`);
    otpStore.delete(identifier);
  } else {
    console.log(`❌ OTP mismatch for identifier: ${identifier}. Expected: ${entry.otp}, Got: ${otp}`);
  }
  return ok;
}

// Test the OTP system
console.log("=== OTP System Test ===\n");

const testIdentifier = "STU001";
console.log(`Testing with identifier: ${testIdentifier}`);

// Generate OTP
const generatedOtp = generateOtp(testIdentifier);
console.log(`Generated OTP: ${generatedOtp}\n`);

// Test correct OTP
console.log("Testing correct OTP:");
const result1 = verifyOtp(testIdentifier, generatedOtp);
console.log(`Result: ${result1}\n`);

// Test incorrect OTP
console.log("Testing incorrect OTP:");
const result2 = verifyOtp(testIdentifier, "123456");
console.log(`Result: ${result2}\n`);

// Test expired OTP (simulate by setting old timestamp)
console.log("Testing expired OTP:");
const expiredOtp = generateOtp("EXPIRED_USER");
otpStore.set("EXPIRED_USER", { otp: expiredOtp, expiresAt: Date.now() - 1000 }); // Expired 1 second ago
const result3 = verifyOtp("EXPIRED_USER", expiredOtp);
console.log(`Result: ${result3}\n`);

console.log("=== Test Complete ===");
console.log("If all tests show expected results, the OTP system is working correctly.");
console.log("If not, there may be an issue with the OTP service implementation.");


