import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, ROLES } from '../constants/roles.js';
import { applyIdTransform } from '../utils/schemaPlugins.js';
import { formatDate } from '../utils/statusHelpers.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES, default: ROLES.STAFF },
    title: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    facility: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/** "Just now" / "2 hours ago" / "Yesterday" / "5 days ago" / "Jan 5, 2024" - matches the mock directory's display strings. */
function formatRelativeTime(date) {
  if (!date) return '-';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;

  return formatDate(date);
}

userSchema.virtual('lastActive').get(function () {
  return formatRelativeTime(this.lastActiveAt);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

applyIdTransform(userSchema, { hidePassword: true });

export default mongoose.model('User', userSchema);
