import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let { statusCode, message, code, extra } = normalizeError(err);

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(statusCode).json({ message, code, ...extra });
}

function normalizeError(err) {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message, code: err.code, extra: err.extra };
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid ${err.path}: ${err.value}`, code: 'INVALID_ID', extra: {} };
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
    return { statusCode: 400, message: message || 'Validation failed.', code: 'VALIDATION_ERROR', extra: {} };
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return {
      statusCode: 409,
      message: `A record with that ${field} already exists.`,
      code: 'DUPLICATE',
      extra: {},
    };
  }

  return { statusCode: err.statusCode || 500, message: err.message || 'Server error.', code: err.code || 'SERVER_ERROR', extra: {} };
}
