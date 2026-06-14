/**
 * Thrown by controllers to produce a JSON error response of shape
 * `{ message, code, ...extra }` with the given HTTP status. `code` lets
 * the frontend branch on specific error conditions (e.g. 'NOT_FOUND',
 * 'INVALID_CREDENTIALS', 'OVERSTOCK') exactly as the mock services do.
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.extra = extra;
  }
}
