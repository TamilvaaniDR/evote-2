"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Voter_1 = __importDefault(require("../models/Voter"));
const Election_1 = __importDefault(require("../models/Election"));
const Vote_1 = __importDefault(require("../models/Vote"));
const Token_1 = __importDefault(require("../models/Token"));
const otpService_1 = require("../services/otpService");
const tokenService_1 = require("../services/tokenService");
const security_1 = require("../middleware/security");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// Get active elections for voters
router.get('/elections', async (req, res, next) => {
    try {
        const elections = await Election_1.default.find({
            status: { $in: ['running', 'closed'] },
            endAt: { $gte: new Date() }
        }).select('title description candidates startAt endAt status resultsPublished');
        res.json({ elections });
    }
    catch (err) {
        next(err);
    }
});
// Get election details for voting
router.get('/elections/:id', async (req, res, next) => {
    try {
        const election = await Election_1.default.findById(req.params.id);
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
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
    }
    catch (err) {
        next(err);
    }
});
// Get election results (public)
router.get('/elections/:id/results', async (req, res, next) => {
    try {
        const election = await Election_1.default.findById(req.params.id);
        if (!election)
            return res.status(404).json({ error: 'Election not found' });
        if (!election.resultsPublished) {
            return res.status(403).json({ error: 'Results not yet published' });
        }
        const votes = await Vote_1.default.find({ electionId: election._id });
        const tally = {};
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
    }
    catch (err) {
        next(err);
    }
});
// identify endpoint - accepts voterId/email/phone
router.post('/identify', security_1.otpRateLimit, security_1.validateVoterData, (0, security_1.auditLogger)('voter_identify'), async (req, res, next) => {
    try {
        const { identifier, electionId } = req.body;
        if (!electionId || typeof electionId !== 'string') {
            return res.status(400).json({ error: 'Election ID is required' });
        }
        const election = await Election_1.default.findById(electionId);
        if (!election)
            return res.status(404).json({ error: 'election not found' });
        if (election.status !== 'running') {
            return res.status(403).json({ error: 'Election is not active' });
        }
        // Check if election is within time bounds
        const now = new Date();
        if (!election.startAt || !election.endAt) {
            return res.status(403).json({ error: 'Election is not currently active' });
        }
        const start = new Date(election.startAt);
        const end = new Date(election.endAt);
        if (now < start || now > end) {
            return res.status(403).json({ error: 'Election is not currently active' });
        }
        const voter = await Voter_1.default.findOne({
            $or: [
                { voterId: identifier.trim() },
                { email: identifier.toLowerCase().trim() },
                { phone: identifier.trim() }
            ],
            assignedElections: electionId,
            eligible: true
        });
        if (!voter)
            return res.status(403).json({ eligible: false, message: 'You are not eligible' });
        // Check if already voted by looking for used token
        const usedToken = await Token_1.default.findOne({
            electionId,
            voterRef: voter.hashedRef,
            used: true
        });
        if (usedToken)
            return res.status(403).json({ eligible: false, message: 'You have already voted' });
        // create hashedRef if missing
        if (!voter.hashedRef) {
            voter.hashedRef = crypto_1.default.createHmac('sha256', process.env.OTP_SECRET || 'otp_secret')
                .update(voter.voterId + '|' + electionId).digest('hex');
            await voter.save();
        }
        // generate OTP
        (0, otpService_1.generateOtp)(voter.voterId + '|' + electionId);
        res.json({ ok: true, message: 'otp_sent' });
    }
    catch (err) {
        next(err);
    }
});
router.post('/verify-otp', security_1.otpRateLimit, security_1.validateVoterData, security_1.validateOtp, (0, security_1.auditLogger)('voter_verify_otp'), async (req, res, next) => {
    try {
        const { identifier, electionId, otp } = req.body;
        const voter = await Voter_1.default.findOne({
            $or: [
                { voterId: identifier.trim() },
                { email: identifier.toLowerCase().trim() },
                { phone: identifier.trim() }
            ],
            assignedElections: electionId,
            eligible: true
        });
        if (!voter)
            return res.status(403).json({ error: 'not eligible' });
        const key = voter.voterId + '|' + electionId;
        const ok = (0, otpService_1.verifyOtp)(key, otp);
        if (!ok)
            return res.status(401).json({ error: 'invalid_otp' });
        // issue token
        if (!voter.hashedRef) {
            voter.hashedRef = crypto_1.default.createHmac('sha256', process.env.OTP_SECRET || 'otp_secret')
                .update(voter.voterId + '|' + electionId).digest('hex');
            await voter.save();
        }
        const token = await (0, tokenService_1.issueVotingToken)(electionId, voter.hashedRef);
        res.json({ token });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
