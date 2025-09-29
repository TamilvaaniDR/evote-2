import { Schema, model } from 'mongoose';

const AuditSchema = new Schema({
  actorType: { type: String, required: true, index: true },
  // Store as string to avoid ObjectId cast errors when using JWT subject
  actorId: { type: String, index: true },
  action: { type: String, required: true, index: true },
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true }
});

// Compound indexes for better query performance
AuditSchema.index({ actorType: 1, timestamp: -1 });
AuditSchema.index({ action: 1, timestamp: -1 });
AuditSchema.index({ timestamp: -1 });

export default model('AuditLog', AuditSchema);