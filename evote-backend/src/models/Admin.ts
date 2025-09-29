import { Schema, model } from 'mongoose';

const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  roles: [{ type: String, index: true }],
  createdAt: { type: Date, default: Date.now, index: true }
});

export default model('Admin', AdminSchema);