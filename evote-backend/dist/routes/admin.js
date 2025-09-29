"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Election_1 = __importDefault(require("../models/Election"));
const Voter_1 = __importDefault(require("../models/Voter"));
const Vote_1 = __importDefault(require("../models/Vote"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const multer_1 = __importDefault(require("multer"));
const sync_1 = require("csv-parse/sync");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_1 = require("../middleware/security");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
// Middleware to verify admin JWT
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ADMIN_SECRET || 'secret');
        req.adminId = decoded.sub;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// Get all elections
router.get('/elections', verifyAdmin, async (req, res, next) => {
    try {
        const elections = await Election_1.default.find().sort({ createdAt: -1 });
        res.json({ elections });
    }
    catch (err) {
        next(err);
    }
});
// Get single election with details
router.get('/elections/:id', verifyAdmin, async (req, res, next) => {
    try {
        const election = await Election_1.default.findById(req.params.id);
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
        // Get voter count
        const voterCount = await Voter_1.default.countDocuments({ assignedElections: election._id });
        // Get vote count
        const voteCount = await Vote_1.default.countDocuments({ electionId: election._id });
        res.json({
            election: {
                ...election.toObject(),
                voterCount,
                voteCount
            }
        });
    }
    catch (err) {
        next(err);
    }
});
// Create election
router.post('/elections', verifyAdmin, security_1.validateElectionData, (0, security_1.auditLogger)('create_election'), async (req, res, next) => {
    try {
        const { title, description, candidates, startAt, endAt } = req.body;
        const election = new Election_1.default({
            title: title.trim(),
            description: description?.trim(),
            candidates,
            startAt: new Date(startAt),
            endAt: new Date(endAt),
            status: 'draft'
        });
        await election.save();
        res.json({ election });
    }
    catch (err) {
        next(err);
    }
});
// Update election
router.put('/elections/:id', verifyAdmin, async (req, res, next) => {
    try {
        const { title, description, candidates, startAt, endAt } = req.body;
        const election = await Election_1.default.findByIdAndUpdate(req.params.id, { title, description, candidates, startAt: new Date(startAt), endAt: new Date(endAt) }, { new: true });
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
        await AuditLog_1.default.create({
            actorType: 'admin',
            actorId: req.adminId,
            action: 'update_election',
            metadata: { electionId: election._id, title }
        });
        res.json({ election });
    }
    catch (err) {
        next(err);
    }
});
// Start election
router.post('/elections/:id/start', verifyAdmin, async (req, res, next) => {
    try {
        const election = await Election_1.default.findByIdAndUpdate(req.params.id, { status: 'running' }, { new: true });
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
        await AuditLog_1.default.create({
            actorType: 'admin',
            actorId: req.adminId,
            action: 'start_election',
            metadata: { electionId: election._id, title: election.title }
        });
        res.json({ election });
    }
    catch (err) {
        next(err);
    }
});
// End election and calculate results
router.post('/elections/:id/end', verifyAdmin, async (req, res, next) => {
    try {
        const election = await Election_1.default.findById(req.params.id);
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
        // Calculate results
        const votes = await Vote_1.default.find({ electionId: election._id });
        const tally = {};
        votes.forEach(vote => {
            tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1;
        });
        // Update election
        const updatedElection = await Election_1.default.findByIdAndUpdate(req.params.id, {
            status: 'closed',
            tally,
            resultsPublished: true
        }, { new: true });
        await AuditLog_1.default.create({
            actorType: 'admin',
            actorId: req.adminId,
            action: 'end_election',
            metadata: { electionId: election._id, title: election.title, totalVotes: votes.length }
        });
        res.json({ election: updatedElection });
    }
    catch (err) {
        next(err);
    }
});
// Get election results
router.get('/elections/:id/results', verifyAdmin, async (req, res, next) => {
    try {
        const election = await Election_1.default.findById(req.params.id);
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
        const votes = await Vote_1.default.find({ electionId: election._id });
        const tally = {};
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
    }
    catch (err) {
        next(err);
    }
});
// Get dashboard stats
router.get('/dashboard', verifyAdmin, async (req, res, next) => {
    try {
        const totalElections = await Election_1.default.countDocuments();
        const activeElections = await Election_1.default.countDocuments({ status: 'running' });
        const totalVoters = await Voter_1.default.countDocuments();
        const totalVotes = await Vote_1.default.countDocuments();
        const recentElections = await Election_1.default.find()
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
    }
    catch (err) {
        next(err);
    }
});
// Upload voters CSV - expects columns: voterId,email,phone
router.post('/voters/upload', verifyAdmin, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'File missing' });
        const text = req.file.buffer.toString('utf8');
        const records = (0, sync_1.parse)(text, { columns: true, skip_empty_lines: true });
        const docs = records.map((r) => ({
            voterId: r['voterId'],
            email: r['email'] || null,
            phone: r['phone'] || null,
            eligible: true,
            assignedElections: r['electionId'] ? [r['electionId']] : []
        }));
        await Voter_1.default.insertMany(docs, { ordered: false });
        // Update election voter count if electionId exists in CSV
        if (records[0] && records[0]['electionId']) {
            const electionId = String(records[0]['electionId']);
            await Election_1.default.findByIdAndUpdate(electionId, {
                $inc: { eligibleVoterCount: docs.length }
            });
        }
        await AuditLog_1.default.create({
            actorType: 'admin',
            actorId: req.adminId,
            action: 'upload_voters',
            metadata: { count: docs.length, electionId: records[0] ? records[0]['electionId'] : undefined }
        });
        res.json({ ok: true, imported: docs.length });
    }
    catch (err) {
        console.error(err);
        // insertMany may throw on duplicates; still return OK
        res.json({ ok: true });
    }
});
// Add voters directly via JSON
router.post('/voters/add', verifyAdmin, async (req, res) => {
    try {
        const { electionId, voters } = req.body;
        if (!electionId || !Array.isArray(voters) || voters.length === 0) {
            return res.status(400).json({ error: 'Missing electionId or voters array' });
        }
        const docs = voters.map((v) => ({
            ...v,
            eligible: true,
            assignedElections: [electionId]
        }));
        await Voter_1.default.insertMany(docs, { ordered: false });
        // Update election voter count
        await Election_1.default.findByIdAndUpdate(electionId, {
            $inc: { eligibleVoterCount: docs.length }
        });
        await AuditLog_1.default.create({
            actorType: 'admin',
            actorId: req.adminId,
            action: 'add_voters',
            metadata: { count: docs.length, electionId }
        });
        res.json({ ok: true, message: 'Voters added successfully', count: docs.length });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get voters for an election
router.get('/elections/:id/voters', verifyAdmin, async (req, res, next) => {
    try {
        const voters = await Voter_1.default.find({ assignedElections: req.params.id })
            .select('voterId email phone eligible createdAt')
            .sort({ createdAt: -1 });
        res.json({ voters });
    }
    catch (err) {
        next(err);
    }
});
// Get audit logs
router.get('/audit-logs', verifyAdmin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const logs = await AuditLog_1.default.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
        const total = await AuditLog_1.default.countDocuments();
        res.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
