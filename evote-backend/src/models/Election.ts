import { Schema, model } from 'mongoose';

const CandidateSchema = new Schema({ 
  id: { type: String, required: true }, 
  name: { type: String, required: true }, 
  meta: Schema.Types.Mixed 
});

const ElectionSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String },
  candidates: [CandidateSchema],
  startAt: { type: Date, index: true },
  endAt: { type: Date, index: true },
  status: { 
    type: String, 
    enum: ['draft','running','closed'], 
    default: 'draft',
    index: true 
  },
  eligibleVoterCount: { type: Number, default: 0 },
  turnoutCount: { type: Number, default: 0 },
  resultsPublished: { type: Boolean, default: false, index: true },
  tally: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes for better query performance
ElectionSchema.index({ status: 1, startAt: 1 });
ElectionSchema.index({ status: 1, endAt: 1 });
ElectionSchema.index({ resultsPublished: 1, status: 1 });

export default model('Election', ElectionSchema);