import { Schema, model } from 'mongoose';

const VoterSchema = new Schema({
  // Unique voter identifier. For institutions, this can be the roll number.
  voterId: { type: String, required: true, index: true, unique: true },
  // Human-readable fields managed by admin
  name: { type: String, index: true },
  rollno: { type: String, index: true },
  dept: { type: String, index: true },
  year: { type: String, index: true },
  // Optional contacts
  email: { type: String, index: true, sparse: true },
  phone: { type: String, index: true, sparse: true },
  // Eligibility and references
  eligible: { type: Boolean, default: true, index: true },
  hashedRef: { type: String, index: true },
  assignedElections: [{ type: Schema.Types.ObjectId, ref: 'Election' }],
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes for better query performance
VoterSchema.index({ assignedElections: 1, eligible: 1 });
VoterSchema.index({ voterId: 1, assignedElections: 1 });
VoterSchema.index({ rollno: 1, assignedElections: 1 });
VoterSchema.index({ email: 1, assignedElections: 1 });
VoterSchema.index({ phone: 1, assignedElections: 1 });

export default model('Voter', VoterSchema);
