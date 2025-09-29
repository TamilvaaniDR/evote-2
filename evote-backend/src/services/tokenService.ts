import crypto from 'crypto';
import Token from '../models/Token';


export async function issueVotingToken(electionId: string, voterRef: string, ttlSeconds = 60 * 60) {
const tokenStr = crypto.randomBytes(24).toString('hex');
const now = new Date();
const token = new Token({ electionId, voterRef, token: tokenStr, issuedAt: now, expiresAt: new Date(now.getTime() + ttlSeconds * 1000) });
await token.save();
return tokenStr;
}


export async function useToken(electionId: string, tokenStr: string) {
// atomic find and update to prevent race conditions
const token = await Token.findOneAndUpdate({ electionId, token: tokenStr, used: false, expiresAt: { $gt: new Date() } }, { used: true, usedAt: new Date() }, { new: true });
return token;
}