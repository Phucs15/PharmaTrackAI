import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ROLES } from '../constants/roles.js';
import { pick } from '../utils/pick.js';
import { logAudit } from '../utils/audit.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Excludes role/status (privilege fields, not self-editable) and password (changed via /auth/password).
const PROFILE_UPDATABLE_FIELDS = ['name', 'email', 'title', 'avatarUrl', 'bio', 'facility'];

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.', 'VALIDATION_ERROR');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'Invalid email format.', 'VALIDATION_ERROR');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  user.lastActiveAt = new Date();
  await user.save();

  const token = generateToken(user);
  setRefreshCookie(res, generateRefreshToken(user));
  await logAudit(req, { action: 'LOGIN', entity: 'Auth', entityId: user._id, entityName: user.email });
  res.json({ user: user.toJSON(), token });
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required.', 'VALIDATION_ERROR');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'Invalid email format.', 'VALIDATION_ERROR');
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
    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, 'Invalid email format.', 'VALIDATION_ERROR');
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
  await logAudit(req, { action: 'PASSWORD_CHANGE', entity: 'Auth', entityId: req.user._id, entityName: req.user.email });
  res.json({ success: true });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided.', 'UNAUTHORIZED');
  }

  const { default: jwt } = await import('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Refresh token is invalid or expired.', 'UNAUTHORIZED');
  }

  if (decoded.type !== 'refresh') {
    throw new ApiError(401, 'Invalid token type.', 'UNAUTHORIZED');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(401, 'User no longer exists.', 'UNAUTHORIZED');
  }

  setRefreshCookie(res, generateRefreshToken(user));
  res.json({ token: generateToken(user), user: user.toJSON() });
});

// POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required.', 'VALIDATION_ERROR');
  if (!EMAIL_REGEX.test(email)) throw new ApiError(400, 'Invalid email format.', 'VALIDATION_ERROR');

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    // In production, plug in an email transport (e.g. nodemailer with SMTP_* env vars).
    // For dev/demo, the reset URL is logged to the server console.
    console.log(`[PharmaTrack] Password reset URL for ${email}: ${resetUrl}`);
  }

  // Always return the same message to avoid leaking whether an account exists.
  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required.', 'VALIDATION_ERROR');
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters.', 'VALIDATION_ERROR');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or has expired.', 'TOKEN_INVALID');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // req.user is not set (unauthenticated route), so pass minimal context manually.
  await logAudit(
    { ip: req.ip, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    { action: 'PASSWORD_RESET', entity: 'Auth', entityId: user._id, entityName: user.email }
  );
  res.json({ success: true });
});
