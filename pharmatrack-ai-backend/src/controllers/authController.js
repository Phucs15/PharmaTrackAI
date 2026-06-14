import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.', 'VALIDATION_ERROR');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  user.lastActiveAt = new Date();
  await user.save();

  const token = generateToken(user);
  res.json({ user: user.toJSON(), token });
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required.', 'VALIDATION_ERROR');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'A user with that email already exists.', 'DUPLICATE');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.STAFF,
  });

  res.status(201).json(user.toJSON());
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user.toJSON());
});
