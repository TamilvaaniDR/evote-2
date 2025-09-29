"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueVotingToken = issueVotingToken;
exports.useToken = useToken;
const crypto_1 = __importDefault(require("crypto"));
const Token_1 = __importDefault(require("../models/Token"));
async function issueVotingToken(electionId, voterRef, ttlSeconds = 60 * 60) {
    const tokenStr = crypto_1.default.randomBytes(24).toString('hex');
    const now = new Date();
    const token = new Token_1.default({ electionId, voterRef, token: tokenStr, issuedAt: now, expiresAt: new Date(now.getTime() + ttlSeconds * 1000) });
    await token.save();
    return tokenStr;
}
async function useToken(electionId, tokenStr) {
    // atomic find and update to prevent race conditions
    const token = await Token_1.default.findOneAndUpdate({ electionId, token: tokenStr, used: false, expiresAt: { $gt: new Date() } }, { used: true, usedAt: new Date() }, { new: true });
    return token;
}
