"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CandidateSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    meta: mongoose_1.Schema.Types.Mixed
});
const ElectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String },
    candidates: [CandidateSchema],
    startAt: { type: Date, index: true },
    endAt: { type: Date, index: true },
    status: {
        type: String,
        enum: ['draft', 'running', 'closed'],
        default: 'draft',
        index: true
    },
    eligibleVoterCount: { type: Number, default: 0 },
    turnoutCount: { type: Number, default: 0 },
    resultsPublished: { type: Boolean, default: false, index: true },
    tally: { type: mongoose_1.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true }
});
// Compound indexes for better query performance
ElectionSchema.index({ status: 1, startAt: 1 });
ElectionSchema.index({ status: 1, endAt: 1 });
ElectionSchema.index({ resultsPublished: 1, status: 1 });
exports.default = (0, mongoose_1.model)('Election', ElectionSchema);
