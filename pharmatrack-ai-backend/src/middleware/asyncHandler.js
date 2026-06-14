/** Wraps an async route handler so thrown/rejected errors reach errorHandler via next(). */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
