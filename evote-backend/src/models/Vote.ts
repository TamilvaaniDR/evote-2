import { Schema, model } from 'mongoose';

const VoteSchema = new Schema({
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
  candidateId: { type: String, required: true, index: true },
  castAt: { type: Date, default: Date.now, index: true },
  ballotHash: { type: String, index: true }
});

// Compound indexes for better query performance
VoteSchema.index({ electionId: 1, candidateId: 1 });
VoteSchema.index({ electionId: 1, castAt: 1 });
VoteSchema.index({ candidateId: 1, castAt: 1 });

export default model('Vote', VoteSchema);