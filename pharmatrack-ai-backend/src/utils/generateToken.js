import jwt from 'jsonwebtoken';

/** Signs a JWT for the given user document, matching the mock token's payload shape. */
export function generateToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}
