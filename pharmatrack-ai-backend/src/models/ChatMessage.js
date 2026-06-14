import mongoose from 'mongoose';
import { applyIdTransform } from '../utils/schemaPlugins.js';

const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

applyIdTransform(chatMessageSchema);

export default mongoose.model('ChatMessage', chatMessageSchema);
