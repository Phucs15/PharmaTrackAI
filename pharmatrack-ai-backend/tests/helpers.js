import User from '../src/models/User.js';
import { generateToken } from '../src/utils/generateToken.js';
import { ROLES } from '../src/constants/roles.js';

let counter = 0;

/** Creates a User document with sensible defaults, overridable per test. */
export async function createUser(overrides = {}) {
  counter += 1;
  return User.create({
    name: 'Test User',
    email: `user${counter}@example.com`,
    password: 'password123',
    role: ROLES.STAFF,
    ...overrides,
  });
}

/** `Authorization` header for a logged-in request as the given user. */
export function authHeader(user) {
  return { Authorization: `Bearer ${generateToken(user)}` };
}
