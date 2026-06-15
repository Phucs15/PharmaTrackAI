import rateLimit from 'express-rate-limit';

/** Throttles login/register to slow down credential-stuffing and account-spam attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.', code: 'RATE_LIMITED' },
});

/** Throttles AI routes to bound Gemini API cost and abuse. */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please try again later.', code: 'RATE_LIMITED' },
});
