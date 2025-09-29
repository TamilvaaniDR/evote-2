"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VoterSchema = new mongoose_1.Schema({
    voterId: { type: String, required: true, index: true, unique: true },
    email: { type: String, index: true, sparse: true },
    phone: { type: String, index: true, sparse: true },
    eligible: { type: Boolean, default: true, index: true },
    hashedRef: { type: String, index: true },
    assignedElections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Election' }],
    createdAt: { type: Date, default: Date.now, index: true }
});
// Compound indexes for better query performance
VoterSchema.index({ assignedElections: 1, eligible: 1 });
VoterSchema.index({ voterId: 1, assignedElections: 1 });
VoterSchema.index({ email: 1, assignedElections: 1 });
VoterSchema.index({ phone: 1, assignedElections: 1 });
exports.default = (0, mongoose_1.model)('Voter', VoterSchema);
