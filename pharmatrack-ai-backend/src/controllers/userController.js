import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchRegex, paginateResults } from '../utils/queryHelpers.js';
import { pick } from '../utils/pick.js';
import { logAudit } from '../utils/audit.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_TEMP_PASSWORD = 'changeme123';

// Excludes password (changed via a dedicated endpoint) and Mongo-managed fields (_id, timestamps).
const UPDATABLE_FIELDS = ['name', 'email', 'role', 'title', 'avatarUrl', 'bio', 'facility', 'status'];

// GET /api/users?role=&status=&search=
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;

  if (search) {
    const regex = searchRegex(search);
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(paginateResults(users.map((user) => user.toJSON()), req.query));
});

// POST /api/users
// AddUserModal does not collect a password, so new accounts get a known
// temporary password the admin can share; the user changes it on first login.
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, title, facility } = req.body;

  if (!email) throw new ApiError(400, 'Email is required.', 'VALIDATION_ERROR');
  if (!EMAIL_REGEX.test(email)) throw new ApiError(400, 'Invalid email format.', 'VALIDATION_ERROR');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'A user with that email already exists.', 'DUPLICATE');
  }

  const user = await User.create({
    name,
    email,
    role,
    title,
    facility,
    password: DEFAULT_TEMP_PASSWORD,
    status: 'Active',
  });

  await logAudit(req, { action: 'CREATE', entity: 'User', entityId: user._id, entityName: user.email });
  res.status(201).json(user.toJSON());
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, `User with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }

  const updates = pick(req.body, UPDATABLE_FIELDS);

  if (updates.email !== undefined) {
    if (!EMAIL_REGEX.test(updates.email)) {
      throw new ApiError(400, 'Invalid email format.', 'VALIDATION_ERROR');
    }
    updates.email = updates.email.toLowerCase().trim();
  }

  Object.assign(user, updates);
  await user.save();
  res.json(user.toJSON());
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, `User with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  await logAudit(req, { action: 'DELETE', entity: 'User', entityId: user._id, entityName: user.email });
  res.json({ success: true });
});
