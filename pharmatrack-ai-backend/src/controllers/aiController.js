import ChatMessage from '../models/ChatMessage.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { generateForecast, generateInsights, chatReply } from '../services/geminiService.js';

// Bounds both the Gemini context window and per-user storage growth.
const MAX_HISTORY_MESSAGES = 50;

/** Returns the most recent MAX_HISTORY_MESSAGES for a user, oldest first. */
async function loadHistory(userId) {
  const messages = await ChatMessage.find({ user: userId }).sort({ createdAt: -1 }).limit(MAX_HISTORY_MESSAGES);
  return messages.reverse();
}

/** Deletes messages beyond MAX_HISTORY_MESSAGES for a user, oldest first. */
async function trimHistory(userId) {
  const total = await ChatMessage.countDocuments({ user: userId });
  if (total <= MAX_HISTORY_MESSAGES) return;

  const stale = await ChatMessage.find({ user: userId })
    .sort({ createdAt: 1 })
    .limit(total - MAX_HISTORY_MESSAGES)
    .select('_id');
  await ChatMessage.deleteMany({ _id: { $in: stale.map((doc) => doc._id) } });
}

// GET /api/ai/forecast?medicineId=
export const getForecast = asyncHandler(async (req, res) => {
  const forecast = await generateForecast(req.query.medicineId);
  res.json(forecast);
});

// GET /api/ai/insights
export const getInsights = asyncHandler(async (req, res) => {
  const insights = await generateInsights();
  res.json(insights);
});

// GET /api/ai/chat/history
export const getChatHistory = asyncHandler(async (req, res) => {
  const messages = await loadHistory(req.user._id);
  res.json(messages.map((msg) => msg.toJSON()));
});

// POST /api/ai/chat
export const postChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  await ChatMessage.create({ user: req.user._id, sender: 'user', text: message });

  const history = (await loadHistory(req.user._id)).map((msg) => msg.toJSON());
  const replyText = await chatReply(message, history);

  const aiMessage = await ChatMessage.create({ user: req.user._id, sender: 'ai', text: replyText });
  await trimHistory(req.user._id);

  res.json(aiMessage.toJSON());
});
