"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuditSchema = new mongoose_1.Schema({
    actorType: { type: String, required: true, index: true },
    actorId: { type: mongoose_1.Schema.Types.ObjectId, index: true },
    action: { type: String, required: true, index: true },
    metadata: mongoose_1.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now, index: true }
});
// Compound indexes for better query performance
AuditSchema.index({ actorType: 1, timestamp: -1 });
AuditSchema.index({ action: 1, timestamp: -1 });
AuditSchema.index({ timestamp: -1 });
exports.default = (0, mongoose_1.model)('AuditLog', AuditSchema);
