import { Router } from 'express';
import { useToken } from '../services/tokenService';
import Vote from '../models/Vote';
import Election from '../models/Election';
import Token from '../models/Token';
import Voter from '../models/Voter';
import { voteRateLimit, auditLogger } from '../middleware/security';
import crypto from 'crypto';

const router = Router();

router.post('/:electionId/cast', voteRateLimit, auditLogger('cast_vote'), async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const { token, candidateId } = req.body;
    
    if (!token || !candidateId) {
      return res.status(400).json({ error: 'Token and candidate ID are required' });
    }
    
    if (typeof token !== 'string' || typeof candidateId !== 'string') {
      return res.status(400).json({ error: 'Token and candidate ID must be strings' });
    }
    
    // Validate election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.status !== 'running') {
      return res.status(403).json({ error: 'Election is not active' });
    }
    
    // Check if election is within time bounds
    const now = new Date();
    if (!election.startAt || !election.endAt) {
      return res.status(403).json({ error: 'Election timing not configured' });
    }
    const start = new Date(election.startAt as unknown as Date);
    const end = new Date(election.endAt as unknown as Date);
    
    if (now < start || now > end) {
      return res.status(403).json({ error: 'Election is not currently active' });
    }
    
    // Validate candidate exists
    const candidate = election.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(400).json({ error: 'Invalid candidate' });
    }
    
    const tokenDoc = await useToken(electionId, token);
    if (!tokenDoc) {
      return res.status(403).json({ error: 'invalid_or_used_token' });
    }
    // Defense-in-depth: ensure the token's voterRef maps to a voter assigned to this election and eligible
    const voter = await Voter.findOne({ hashedRef: tokenDoc.voterRef, assignedElections: electionId, eligible: true });
    if (!voter) {
      return res.status(403).json({ error: 'not_eligible_for_this_election' });
    }
    
    // Create ballot hash for integrity
    const ballotData = `${electionId}|${candidateId}|${tokenDoc.voterRef}|${Date.now()}`;
    const ballotHash = crypto.createHash('sha256').update(ballotData).digest('hex');
    
    // Create vote
    const vote = new Vote({ 
      electionId, 
      candidateId, 
      ballotHash 
    });
    
    await vote.save();
    
    // Increment turnout atomically
    await Election.findByIdAndUpdate(electionId, { $inc: { turnoutCount: 1 } });
    
    res.json({ ok: true, message: 'Vote cast successfully' });
  } catch (err) { 
    next(err); 
  }
});

export default router;