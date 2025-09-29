import { Router } from 'express';
import Voter from '../models/Voter';
import Election from '../models/Election';
import Vote from '../models/Vote';
import Token from '../models/Token';
import { generateOtp, verifyOtp, regenerateOtp, hasValidOtp } from '../services/otpService';
import { issueVotingToken } from '../services/tokenService';
import { otpRateLimit, auditLogger, validateVoterData, validateOtp } from '../middleware/security';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';


const router = Router();

// Get currently active elections for voters (status running AND within time window)
router.get('/elections', async (req, res, next) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      status: 'running',
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).select('title description candidates startAt endAt status resultsPublished');

    res.json({ elections });
  } catch (err) {
    next(err);
  }
});

// --- Voter session (identifier-wide) login ---
router.post('/login-start', otpRateLimit, async (req, res, next) => {
  try {
    const { identifier } = req.body as { identifier?: string };
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'identifier required' });
    }

    const voter = await Voter.findOne({
      $or: [
        { voterId: identifier.trim() },
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
      eligible: true,
    });

    if (!voter) {
      console.log(`[DEBUG] Voter not found for identifier: ${identifier}`);
      return res.status(404).json({ error: 'voter_not_found_or_not_eligible' });
    }

    console.log(`[DEBUG] Voter found: ${voter.voterId}, eligible: ${voter.eligible}`);

    // Use voterId as the key for OTP generation and verification
    const otp = await generateOtp(voter.voterId, voter.email, voter.phone);
    
    // Determine delivery method
    let deliveryMethod = 'console';
    if (voter.email && process.env.ENABLE_EMAIL_OTP === 'true') {
      deliveryMethod = 'email';
    } else if (voter.phone && process.env.ENABLE_SMS_OTP === 'true') {
      deliveryMethod = 'sms';
    }
    
    if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
      return res.json({ 
        ok: true, 
        message: `OTP sent via ${deliveryMethod}`,
        deliveryMethod 
      });
    }
    return res.json({ 
      ok: true, 
      message: `OTP sent via ${deliveryMethod}`, 
      devOtp: otp,
      deliveryMethod 
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login-verify', otpRateLimit, async (req, res, next) => {
  try {
    const { identifier, otp } = req.body as { identifier?: string; otp?: string };
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'identifier_and_otp_required' });
    }

    const voter = await Voter.findOne({
      $or: [
        { voterId: identifier.trim() },
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
      eligible: true,
    });
    if (!voter) {
      console.log(`[DEBUG] Voter not found for identifier: ${identifier}`);
      return res.status(404).json({ error: 'voter_not_found_or_not_eligible' });
    }

    console.log(`[DEBUG] Verifying OTP for voter: ${voter.voterId}, OTP: ${otp}`);
    const ok = verifyOtp(voter.voterId, otp);
    if (!ok) {
      console.log(`[DEBUG] OTP verification failed for voter: ${voter.voterId}`);
      return res.status(401).json({ error: 'invalid_otp' });
    }
    console.log(`[DEBUG] OTP verification successful for voter: ${voter.voterId}`);

    const secret = process.env.TOKEN_SECRET || 'token_secret';
    const token = jwt.sign({ sub: voter.voterId, type: 'voter' }, secret, { expiresIn: '24h' });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Voter session auth middleware
function requireVoterSession(req: any, res: any, next: any) {
  try {
    const hdr = (req.headers['x-voter-token'] || req.headers['X-Voter-Token'] || req.headers['x-voterauthorization']) as string | undefined;
    const token = hdr || undefined;
    if (!token) return res.status(401).json({ error: 'voter_auth_required' });
    const secret = process.env.TOKEN_SECRET || 'token_secret';
    const decoded: any = jwt.verify(token, secret);
    req.voterId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_voter_session' });
  }
}

// Return voter profile and assigned elections (grouped by status)
router.get('/me', requireVoterSession, async (req: any, res, next) => {
  try {
    const voter = await Voter.findOne({ voterId: req.voterId, eligible: true }).select('voterId name email phone dept year assignedElections');
    if (!voter) return res.status(404).json({ error: 'voter_not_found' });

    const elections = await Election.find({ _id: { $in: voter.assignedElections } }).select('title description candidates startAt endAt status resultsPublished');
    const now = new Date();
    const running = elections.filter(e => e.status === 'running' && e.startAt && e.endAt && (now >= (e.startAt as any) && now <= (e.endAt as any)));
    const upcoming = elections.filter(e => e.startAt && now < (e.startAt as any));
    const closed = elections.filter(e => e.status === 'closed' || (e.endAt && now > (e.endAt as any)));

    res.json({ voter, elections: { running, upcoming, closed } });
  } catch (err) {
    next(err);
  }
});

// Return only elections the provided identifier is eligible to vote in (and currently running within time window)
router.post('/eligible-elections', async (req, res, next) => {
  try {
    const { identifier } = req.body as { identifier?: string };
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'identifier required' });
    }

    const voter = await Voter.findOne({
      $or: [
        { voterId: identifier.trim() },
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
      eligible: true,
    }).select('assignedElections');

    if (!voter || !voter.assignedElections || voter.assignedElections.length === 0) {
      return res.json({ elections: [] });
    }

    const now = new Date();
    const elections = await Election.find({
      _id: { $in: voter.assignedElections },
      status: 'running',
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).select('title description candidates startAt endAt status resultsPublished');

    res.json({ elections });
  } catch (err) {
    next(err);
  }
});

// Public results feed of elections with published results
router.get('/results-feed', async (req, res, next) => {
  try {
    const elections = await Election.find({ resultsPublished: true })
      .sort({ endAt: -1 })
      .select('title description candidates startAt endAt status resultsPublished');
    res.json({ elections });
  } catch (err) {
    next(err);
  }
});

// Get election details for voting
router.get('/elections/:id', async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    if (election.status !== 'running') {
      return res.status(403).json({ error: 'Election is not active' });
    }
    
    res.json({ 
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        candidates: election.candidates,
        startAt: election.startAt,
        endAt: election.endAt
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get election results (public)
router.get('/elections/:id/results', async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    if (!election.resultsPublished) {
      return res.status(403).json({ error: 'Results not yet published' });
    }
    
    const votes = await Vote.find({ electionId: election._id });
    const tally: { [key: string]: number } = {};
    
    votes.forEach(vote => {
      tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1;
    });
    
    const results = election.candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      votes: tally[candidate.id] || 0
    }));
    
    res.json({ 
      election: election.title,
      totalVotes: votes.length,
      results: results.sort((a, b) => b.votes - a.votes)
    });
  } catch (err) {
    next(err);
  }
});


// identify endpoint - accepts voterId/email/phone
router.post('/identify', otpRateLimit, validateVoterData, auditLogger('voter_identify'), async (req, res, next) => {
  try {
    const { identifier, electionId } = req.body;
    
    if (!electionId || typeof electionId !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }
    
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: 'election not found' });
    
    if (election.status !== 'running') {
      return res.status(403).json({ error: 'Election is not active' });
    }
    
    // Check if election is within time bounds
    const now = new Date();
    if (!election.startAt || !election.endAt) {
      return res.status(403).json({ error: 'Election is not currently active' });
    }
    const start = new Date(election.startAt as unknown as Date);
    const end = new Date(election.endAt as unknown as Date);
    
    if (now < start || now > end) {
      return res.status(403).json({ error: 'Election is not currently active' });
    }
    
    const voter = await Voter.findOne({ 
      $or: [
        { voterId: identifier.trim() }, 
        { email: identifier.toLowerCase().trim() }, 
        { phone: identifier.trim() }
      ], 
      assignedElections: electionId,
      eligible: true
    });
    
    if (!voter) return res.status(403).json({ eligible: false, message: 'You are not eligible' });
    
    // Check if already voted by looking for used token
    const usedToken = await Token.findOne({ 
      electionId, 
      voterRef: voter.hashedRef, 
      used: true 
    });
    
    if (usedToken) return res.status(403).json({ eligible: false, message: 'You have already voted' });
    
    // create hashedRef if missing
    if (!voter.hashedRef) {
      voter.hashedRef = crypto.createHmac('sha256', process.env.OTP_SECRET || 'otp_secret')
        .update(voter.voterId + '|' + electionId).digest('hex');
      await voter.save();
    }
    
    // generate OTP
    const otp = generateOtp(voter.voterId + '|' + electionId);
    // Return OTP in non-production for local testing; never expose in production
    if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production') {
      res.json({ ok: true, message: 'otp_sent' });
    } else {
      res.json({ ok: true, message: 'otp_sent', devOtp: otp });
    }
  } catch (err) { 
    next(err); 
  }
});


router.post('/verify-otp', otpRateLimit, validateVoterData, validateOtp, auditLogger('voter_verify_otp'), async (req, res, next) => {
  try {
    const { identifier, electionId, otp } = req.body;
    
    const voter = await Voter.findOne({ 
      $or: [
        { voterId: identifier.trim() }, 
        { email: identifier.toLowerCase().trim() }, 
        { phone: identifier.trim() }
      ], 
      assignedElections: electionId,
      eligible: true
    });
    
    if (!voter) return res.status(403).json({ error: 'not eligible' });
    
    const key = voter.voterId + '|' + electionId;
    const ok = verifyOtp(key, otp);
    if (!ok) return res.status(401).json({ error: 'invalid_otp' });
    
    // issue token
    if (!voter.hashedRef) {
      voter.hashedRef = crypto.createHmac('sha256', process.env.OTP_SECRET || 'otp_secret')
        .update(voter.voterId + '|' + electionId).digest('hex');
      await voter.save();
    }
    
    const token = await issueVotingToken(electionId, voter.hashedRef);
    res.json({ token });
  } catch (err) { 
    next(err); 
  }
});

// Regenerate OTP endpoint (for multiple voters)
router.post('/regenerate-otp', otpRateLimit, async (req, res, next) => {
  try {
    const { identifier } = req.body as { identifier?: string };
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'identifier required' });
    }

    const voter = await Voter.findOne({
      $or: [
        { voterId: identifier.trim() },
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
      eligible: true,
    });

    if (!voter) {
      console.log(`[DEBUG] Voter not found for identifier: ${identifier}`);
      return res.status(404).json({ error: 'voter_not_found_or_not_eligible' });
    }

    // Check if there's already a valid OTP
    if (hasValidOtp(voter.voterId)) {
      return res.status(400).json({ 
        error: 'OTP already exists and is valid. Please use the existing OTP or wait for it to expire.' 
      });
    }

    // Generate new OTP
    const otp = await regenerateOtp(voter.voterId, voter.email, voter.phone);
    
    // Determine delivery method
    let deliveryMethod = 'console';
    if (voter.email && process.env.ENABLE_EMAIL_OTP === 'true') {
      deliveryMethod = 'email';
    } else if (voter.phone && process.env.ENABLE_SMS_OTP === 'true') {
      deliveryMethod = 'sms';
    }
    
    if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
      return res.json({ 
        ok: true, 
        message: `New OTP sent via ${deliveryMethod}`,
        deliveryMethod 
      });
    }
    return res.json({ 
      ok: true, 
      message: `New OTP sent via ${deliveryMethod}`, 
      devOtp: otp,
      deliveryMethod 
    });
  } catch (err) {
    next(err);
  }
});

export default router;