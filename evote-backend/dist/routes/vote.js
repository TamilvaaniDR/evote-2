"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tokenService_1 = require("../services/tokenService");
const Vote_1 = __importDefault(require("../models/Vote"));
const Election_1 = __importDefault(require("../models/Election"));
const security_1 = require("../middleware/security");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
router.post('/:electionId/cast', security_1.voteRateLimit, (0, security_1.auditLogger)('cast_vote'), async (req, res, next) => {
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
        const election = await Election_1.default.findById(electionId);
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
        const start = new Date(election.startAt);
        const end = new Date(election.endAt);
        if (now < start || now > end) {
            return res.status(403).json({ error: 'Election is not currently active' });
        }
        // Validate candidate exists
        const candidate = election.candidates.find(c => c.id === candidateId);
        if (!candidate) {
            return res.status(400).json({ error: 'Invalid candidate' });
        }
        const tokenDoc = await (0, tokenService_1.useToken)(electionId, token);
        if (!tokenDoc) {
            return res.status(403).json({ error: 'invalid_or_used_token' });
        }
        // Create ballot hash for integrity
        const ballotData = `${electionId}|${candidateId}|${tokenDoc.voterRef}|${Date.now()}`;
        const ballotHash = crypto_1.default.createHash('sha256').update(ballotData).digest('hex');
        // Create vote
        const vote = new Vote_1.default({
            electionId,
            candidateId,
            ballotHash
        });
        await vote.save();
        // Increment turnout atomically
        await Election_1.default.findByIdAndUpdate(electionId, { $inc: { turnoutCount: 1 } });
        res.json({ ok: true, message: 'Vote cast successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
