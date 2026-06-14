import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from './asyncHandler.js';

/** Verifies the Bearer token and attaches the loaded user (without password) to req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided.', 'UNAUTHORIZED');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Not authorized, token is invalid or expired.', 'UNAUTHORIZED');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists.', 'UNAUTHORIZED');
  }

  req.user = user;
  next();
});
