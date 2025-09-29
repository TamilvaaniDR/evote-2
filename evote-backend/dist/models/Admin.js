"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdminSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    roles: [{ type: String, index: true }],
    createdAt: { type: Date, default: Date.now, index: true }
});
exports.default = (0, mongoose_1.model)('Admin', AdminSchema);
