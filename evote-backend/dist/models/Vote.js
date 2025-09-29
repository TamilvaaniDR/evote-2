"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VoteSchema = new mongoose_1.Schema({
    electionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    candidateId: { type: String, required: true, index: true },
    castAt: { type: Date, default: Date.now, index: true },
    ballotHash: { type: String, index: true }
});
// Compound indexes for better query performance
VoteSchema.index({ electionId: 1, candidateId: 1 });
VoteSchema.index({ electionId: 1, castAt: 1 });
VoteSchema.index({ candidateId: 1, castAt: 1 });
exports.default = (0, mongoose_1.model)('Vote', VoteSchema);
