import { Schema, model } from 'mongoose';

const VoterImportSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin', index: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
  filename: { type: String },
  size: { type: Number },
  importedCount: { type: Number, default: 0 },
  // Store raw CSV text (for moderate sizes). For very large files, GridFS would be recommended.
  rawText: { type: String },
  uploadedAt: { type: Date, default: Date.now, index: true },
});

export default model('VoterImport', VoterImportSchema);
