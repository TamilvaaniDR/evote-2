"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TokenSchema = new mongoose_1.Schema({
    electionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    voterRef: { type: String, required: true, index: true },
    token: { type: String, required: true, index: true },
    issuedAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, index: true },
    used: { type: Boolean, default: false, index: true },
    usedAt: Date
});
// Compound indexes for better query performance
TokenSchema.index({ token: 1, electionId: 1 }, { unique: true });
TokenSchema.index({ electionId: 1, voterRef: 1, used: 1 });
TokenSchema.index({ electionId: 1, used: 1, expiresAt: 1 });
TokenSchema.index({ voterRef: 1, used: 1 });
exports.default = (0, mongoose_1.model)('Token', TokenSchema);
