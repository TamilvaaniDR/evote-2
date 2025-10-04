import { Router, Request, Response, NextFunction } from 'express';
import Election from '../models/Election';
import Voter from '../models/Voter';
import Vote from '../models/Vote';
import Token from '../models/Token';
import AuditLog from '../models/AuditLog';
import VoterImport from '../models/VoterImport';
import multer from 'multer';
import { parse as parseCsv } from 'csv-parse/sync';
import jwt from 'jsonwebtoken';
import { validateElectionData, auditLogger } from '../middleware/security';

// Extend Request interface to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

const router = Router();
const upload = multer();

// Middleware to verify admin JWT
const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET || 'secret') as any;
    req.adminId = decoded.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all elections
router.get('/elections', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json({ elections });
  } catch (err) {
    next(err);
  }
});

// Get single election with details
router.get('/elections/:id', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    // Get voter count
    const voterCount = await Voter.countDocuments({ assignedElections: election._id });
    
    // Get vote count
    const voteCount = await Vote.countDocuments({ electionId: election._id });
    
    res.json({ 
      election: {
        ...election.toObject(),
        voterCount,
        voteCount
      }
    });
  } catch (err) {
    next(err);
  }
});

// Create election
router.post('/elections', verifyAdmin, validateElectionData, auditLogger('create_election'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, candidates, startAt, endAt } = req.body;
    const election = new Election({
      title: title.trim(),
      description: description?.trim(),
      candidates,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      status: 'draft'
    });
    await election.save();
    
    res.json({ election });
  } catch (err) {
    next(err);
  }
});

// Update election
router.put('/elections/:id', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, candidates, startAt, endAt } = req.body;
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, candidates, startAt: new Date(startAt), endAt: new Date(endAt) },
      { new: true }
    );
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    await AuditLog.create({
      actorType: 'admin',
      actorId: req.adminId,
      action: 'update_election',
      metadata: { electionId: election._id, title }
    });
    
    res.json({ election });
  } catch (err) {
    next(err);
  }
});

// Start election
router.post('/elections/:id/start', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    const now = new Date();
    // Prevent starting if end time has already passed
    if (election.endAt && now > (election.endAt as any)) {
      return res.status(400).json({ error: 'Cannot start election: end time is in the past' });
    }

    // If startAt missing or in the future, set it to now to make it active immediately
    const update: any = { status: 'running' };
    if (!election.startAt || now < (election.startAt as any)) {
      update.startAt = now;
    }

    const updated = await Election.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    await AuditLog.create({
      actorType: 'admin',
      actorId: req.adminId,
      action: 'start_election',
      metadata: { electionId: updated!._id, title: updated!.title }
    });

    res.json({ election: updated });
  } catch (err) {
    next(err);
  }
});

// End election and calculate results
router.post('/elections/:id/end', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    // Calculate results
    const votes = await Vote.find({ electionId: election._id });
    const tally: { [key: string]: number } = {};
    
    votes.forEach(vote => {
      tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1;
    });
    
    // Update election
    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'closed',
        tally,
        resultsPublished: true
      },
      { new: true }
    );
    
    await AuditLog.create({
      actorType: 'admin',
      actorId: req.adminId,
      action: 'end_election',
      metadata: { electionId: election._id, title: election.title, totalVotes: votes.length }
    });
    
    res.json({ election: updatedElection });
  } catch (err) {
    next(err);
  }
});

// Get election results
router.get('/elections/:id/results', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    
    const votes = await Vote.find({ electionId: election._id });
    const tally: { [key: string]: number } = {};
    
    votes.forEach(vote => {
      tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1;
    });
    
    // Get candidate details
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

// Get dashboard stats
router.get('/dashboard', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'running' });
    const totalVoters = await Voter.countDocuments();
    const totalVotes = await Vote.countDocuments();
    
    const recentElections = await Election.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt turnoutCount eligibleVoterCount');
    
    res.json({
      stats: {
        totalElections,
        activeElections,
        totalVoters,
        totalVotes
      },
      recentElections
    });
  } catch (err) {
    next(err);
  }
});

// Upload voters CSV - expects columns: name,rollno,dept,year,email,phone,electionId
// Backward compatible: if voterId is provided, it will be used; otherwise rollno is used as voterId
router.post('/voters/upload', verifyAdmin, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File missing' });

    // Normalize CSV text: strip BOM and ensure utf8 string
    const raw = req.file.buffer.toString('utf8');
    const text = raw.replace(/^\uFEFF/, '');
    let records: Record<string, string>[] = [];
    try {
      records = parseCsv<Record<string, string>>(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
    } catch (e: any) {
      return res.status(400).json({ error: 'Invalid CSV format', details: e?.message || 'parse_error' });
    }

    // Determine electionId: prefer request body/query (UI selection), else fallback to CSV column
    const csvElectionId = records[0]?.['electionId']?.toString().trim();
    const bodyElectionId = (req.body?.electionId || req.query?.electionId)?.toString().trim();
    const electionId = bodyElectionId || csvElectionId;
    if (!electionId) {
      return res.status(400).json({ error: 'electionId is required (in CSV column "electionId" or as request parameter)' });
    }

    // Validate election exists
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    // Build the desired voter set from CSV (normalize voterId)
    const desiredDocs = records.map((r) => {
      const voterId = (r['voterId'] || r['rollno'] || '').toString().trim();
      return {
        voterId,
        name: (r['name'] || '').toString().trim() || undefined,
        rollno: (r['rollno'] || voterId || '').toString().trim() || undefined,
        dept: (r['dept'] || '').toString().trim() || undefined,
        year: (r['year'] || '').toString().trim() || undefined,
        email: r['email'] ? r['email'].toString().toLowerCase().trim() : undefined,
        phone: r['phone'] ? r['phone'].toString().trim() : undefined,
      };
    }).filter(d => d.voterId);

    const voterIds = desiredDocs.map(d => d.voterId);

    // 1) Remove this election assignment from any voters NOT in the CSV
    await Voter.updateMany(
      { assignedElections: electionId, voterId: { $nin: voterIds } },
      { $pull: { assignedElections: electionId } }
    );

    // 2) Upsert each CSV voter and ensure they are assigned to this election and eligible
    const bulkOps = desiredDocs.map((d) => ({
      updateOne: {
        filter: { voterId: d.voterId },
        update: {
          $set: {
            name: d.name,
            rollno: d.rollno,
            dept: d.dept,
            year: d.year,
            email: d.email,
            phone: d.phone,
            eligible: true,
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
          $addToSet: { assignedElections: electionId },
        },
        upsert: true,
      },
    }));

    const bulkRes = bulkOps.length > 0 ? await Voter.bulkWrite(bulkOps, { ordered: false }) : null;

    // 3) Recalculate eligibleVoterCount for the election
    const eligibleCount = await Voter.countDocuments({ assignedElections: electionId, eligible: true });
    await Election.findByIdAndUpdate(electionId, { $set: { eligibleVoterCount: eligibleCount } });

    // Save import record (always record)
    await VoterImport.create({
      adminId: req.adminId,
      electionId,
      filename: (req.file as any).originalname,
      size: (req.file as any).size,
      importedCount: (bulkRes?.upsertedCount || 0) + (bulkRes?.modifiedCount || 0),
      rawText: text,
    });

    await AuditLog.create({
      actorType: 'admin',
      actorId: req.adminId,
      action: 'upload_voters',
      metadata: { count: desiredDocs.length, electionId }
    });

    res.json({ ok: true, electionId, totalCsvRows: desiredDocs.length, eligibleVoterCount: eligibleCount });
  } catch (err: any) {
    console.error('CSV upload error:', err);
    const msg = err?.message || 'Upload failed';
    res.status(500).json({ ok: false, error: msg });
  }
});

// List voter CSV imports (recent first)
router.get('/voters/imports', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const electionId = (req.query.electionId as string | undefined)?.toString();
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const query: any = {};
    if (electionId) query.electionId = electionId;
    const imports = await VoterImport.find(query)
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .select('electionId adminId filename size importedCount uploadedAt');
    res.json({ imports });
  } catch (err) {
    next(err);
  }
});

// Add voters directly via JSON
// Body: { electionId: string, voters: Array<{ name, rollno, dept, year, email?, phone? }|{ voterId, ... }> }
router.post('/voters/add', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { electionId, voters } = req.body;

    if (!electionId || !Array.isArray(voters) || voters.length === 0) {
      return res.status(400).json({ error: 'Missing electionId or voters array' });
    }

    // Ensure election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Normalize docs and build bulk upserts to avoid duplicate key errors on voterId
    const desiredDocs = voters
      .map((v: any) => {
        const voterId = (v.voterId || v.rollno)?.toString().trim();
        if (!voterId) return null;
        return {
          voterId,
          name: v.name?.toString().trim(),
          rollno: (v.rollno || v.voterId)?.toString().trim(),
          dept: v.dept?.toString().trim(),
          year: v.year?.toString().trim(),
          email: v.email ? v.email.toString().toLowerCase().trim() : undefined,
          phone: v.phone ? v.phone.toString().trim() : undefined,
        };
      })
      .filter(Boolean) as Array<{
        voterId: string;
        name?: string;
        rollno?: string;
        dept?: string;
        year?: string;
        email?: string;
        phone?: string;
      }>;

    if (desiredDocs.length === 0) {
      return res.status(400).json({ error: 'No valid voters provided' });
    }

    const bulkOps = desiredDocs.map((d) => ({
      updateOne: {
        filter: { voterId: d.voterId },
        update: {
          $set: {
            name: d.name,
            rollno: d.rollno,
            dept: d.dept,
            year: d.year,
            email: d.email,
            phone: d.phone,
            eligible: true,
          },
          $setOnInsert: { createdAt: new Date() },
          $addToSet: { assignedElections: electionId },
        },
        upsert: true,
      },
    }));

    const bulkRes = await Voter.bulkWrite(bulkOps, { ordered: false });

    // Recalculate eligible voter count for the election
    const eligibleCount = await Voter.countDocuments({ assignedElections: electionId, eligible: true });
    await Election.findByIdAndUpdate(electionId, { $set: { eligibleVoterCount: eligibleCount } });

    await AuditLog.create({
      actorType: 'admin',
      actorId: req.adminId,
      action: 'add_voters',
      metadata: { count: desiredDocs.length, electionId }
    });

    res.json({ ok: true, message: 'Voters added successfully', count: desiredDocs.length, eligibleVoterCount: eligibleCount });
  } catch (err: any) {
    console.error('add_voters error:', err?.message || err);
    const msg = err?.message || 'Internal server error';
    res.status(500).json({ error: msg });
  }
});

// Get voters for an election
router.get('/elections/:id/voters', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voters = await Voter.find({ assignedElections: req.params.id })
      .select('voterId name rollno dept year email phone eligible assignedElections createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ voters });
  } catch (err) {
    next(err);
  }
});

// Get all voters with their election assignments
router.get('/voters', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;
    
    const voters = await Voter.find()
      .select('voterId name rollno dept year email phone eligible assignedElections createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Voter.countDocuments();
    
    // Populate election details for each voter
    const votersWithElections = await Promise.all(
      voters.map(async (voter) => {
        const elections = await Election.find({ _id: { $in: voter.assignedElections } })
          .select('title status startAt endAt');
        return {
          ...voter.toObject(),
          electionDetails: elections
        };
      })
    );
    
    res.json({ 
      voters: votersWithElections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update voter election assignments
router.put('/voters/:voterId/assignments', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { voterId } = req.params;
    const { assignedElections } = req.body;

    if (!Array.isArray(assignedElections)) {
      return res.status(400).json({ error: 'assignedElections must be an array' });
    }

    // Validate that all election IDs exist
    const elections = await Election.find({ _id: { $in: assignedElections } });
    if (elections.length !== assignedElections.length) {
      return res.status(400).json({ error: 'One or more election IDs are invalid' });
    }

    // Update voter assignments
    const voter = await Voter.findOneAndUpdate(
      { voterId },
      { assignedElections },
      { new: true }
    );

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    // Update eligible voter counts for all affected elections
    for (const electionId of assignedElections) {
      const eligibleCount = await Voter.countDocuments({ 
        assignedElections: electionId, 
        eligible: true 
      });
      await Election.findByIdAndUpdate(electionId, { 
        $set: { eligibleVoterCount: eligibleCount } 
      });
    }

    await AuditLog.create({
      actorType: 'admin',
      actorId: req.adminId,
      action: 'update_voter_assignments',
      metadata: { voterId, assignedElections }
    });

    res.json({ 
      ok: true, 
      message: 'Voter election assignments updated successfully',
      voter: {
        voterId: voter.voterId,
        name: voter.name,
        assignedElections: voter.assignedElections
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get audit logs
router.get('/audit-logs', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.json({ 
      logs, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
