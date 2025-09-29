"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.verifyOtp = verifyOtp;
const otpStore = new Map();
function generateOtp(identifier) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 1000 * 60 * 5; // 5 minutes
    otpStore.set(identifier, { otp, expiresAt });
    // In prod: send SMS/Email here.
    console.log(`[DEV OTP] ${identifier} -> ${otp}`);
    return otp;
}
function verifyOtp(identifier, otp) {
    const entry = otpStore.get(identifier);
    if (!entry)
        return false;
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(identifier);
        return false;
    }
    const ok = entry.otp === otp;
    if (ok)
        otpStore.delete(identifier);
    return ok;
}
