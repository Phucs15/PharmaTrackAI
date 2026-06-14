import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchRegex } from '../utils/queryHelpers.js';

const DEFAULT_TEMP_PASSWORD = 'changeme123';

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
  res.json(users.map((user) => user.toJSON()));
});

// POST /api/users
// AddUserModal does not collect a password, so new accounts get a known
// temporary password the admin can share; the user changes it on first login.
export const createUser = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'A user with that email already exists.', 'DUPLICATE');
  }

  const user = await User.create({
    password: DEFAULT_TEMP_PASSWORD,
    status: 'Active',
    ...req.body,
  });

  res.status(201).json(user.toJSON());
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, `User with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }

  Object.assign(user, req.body);
  await user.save();
  res.json(user.toJSON());
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, `User with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  res.json({ success: true });
});
