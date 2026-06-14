import ChatMessage from '../models/ChatMessage.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { generateForecast, generateInsights, chatReply } from '../services/geminiService.js';

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
  const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 });
  res.json(messages.map((msg) => msg.toJSON()));
});

// POST /api/ai/chat
export const postChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  await ChatMessage.create({ user: req.user._id, sender: 'user', text: message });

  const history = (await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 })).map((msg) =>
    msg.toJSON()
  );
  const replyText = await chatReply(message, history);

  const aiMessage = await ChatMessage.create({ user: req.user._id, sender: 'ai', text: replyText });

  res.json(aiMessage.toJSON());
});
