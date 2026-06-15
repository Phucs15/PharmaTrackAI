import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ROLES } from '../constants/roles.js';
import { pick } from '../utils/pick.js';

// Excludes role/status (privilege fields, not self-editable) and password (changed via /auth/password).
const PROFILE_UPDATABLE_FIELDS = ['name', 'email', 'title', 'avatarUrl', 'bio', 'facility'];

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

// PUT /api/auth/me
export const updateProfile = asyncHandler(async (req, res) => {
  const updates = pick(req.body, PROFILE_UPDATABLE_FIELDS);

  if (updates.name !== undefined && !updates.name.trim()) {
    throw new ApiError(400, 'Name cannot be empty.', 'VALIDATION_ERROR');
  }

  if (updates.email !== undefined) {
    const email = updates.email.toLowerCase().trim();
    if (!email) {
      throw new ApiError(400, 'Email cannot be empty.', 'VALIDATION_ERROR');
    }
    if (email !== req.user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new ApiError(409, 'A user with that email already exists.', 'DUPLICATE');
      }
    }
    updates.email = email;
  }

  Object.assign(req.user, updates);
  await req.user.save();
  res.json(req.user.toJSON());
});

// PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required.', 'VALIDATION_ERROR');
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters.', 'VALIDATION_ERROR');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    // 400, not 401: the session itself is valid; a 401 here would trip the
    // frontend's global interceptor and log the user out.
    throw new ApiError(400, 'Current password is incorrect.', 'INVALID_CREDENTIALS');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true });
});
