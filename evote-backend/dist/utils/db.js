"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoConnect = mongoConnect;
const mongoose_1 = __importDefault(require("mongoose"));
async function mongoConnect() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/evote';
    try {
        await mongoose_1.default.connect(uri);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error('MongoDB connection error', err);
        process.exit(1);
    }
}
