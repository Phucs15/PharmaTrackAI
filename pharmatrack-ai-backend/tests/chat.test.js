import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import ChatMessage from '../src/models/ChatMessage.js';
import { createUser, authHeader } from './helpers.js';
import { ROLES } from '../src/constants/roles.js';

const MAX_HISTORY_MESSAGES = 50;

describe('GET /api/ai/chat/history', () => {
  it('returns at most the most recent messages, oldest first', async () => {
    const user = await createUser({ role: ROLES.ADMIN });

    const docs = Array.from({ length: 60 }, (_, i) => ({
      user: user._id,
      sender: i % 2 === 0 ? 'user' : 'ai',
      text: `message ${i}`,
      createdAt: new Date(Date.now() + i * 1000),
    }));
    await ChatMessage.insertMany(docs);

    const res = await request(app).get('/api/ai/chat/history').set(authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(res.body[0].text).toBe('message 10');
    expect(res.body[MAX_HISTORY_MESSAGES - 1].text).toBe('message 59');
  });
});

describe('POST /api/ai/chat', () => {
  it('trims old messages so per-user history stays within the cap', async () => {
    const user = await createUser({ role: ROLES.ADMIN });

    // Seed history dated in the past so newly-created messages sort after it.
    const now = Date.now();
    const docs = Array.from({ length: MAX_HISTORY_MESSAGES }, (_, i) => ({
      user: user._id,
      sender: 'user',
      text: `message ${i}`,
      createdAt: new Date(now - (MAX_HISTORY_MESSAGES - i) * 1000),
    }));
    await ChatMessage.insertMany(docs);

    const res = await request(app).post('/api/ai/chat').set(authHeader(user)).send({ message: 'one more' });

    expect(res.status).toBe(200);
    expect(res.body.sender).toBe('ai');

    const total = await ChatMessage.countDocuments({ user: user._id });
    expect(total).toBe(MAX_HISTORY_MESSAGES);

    // The 2 oldest seeded messages (message 0, message 1) should have been
    // trimmed to make room for the new user + ai messages.
    const oldest = await ChatMessage.findOne({ user: user._id }).sort({ createdAt: 1 });
    expect(oldest.text).toBe('message 2');
  });
});
