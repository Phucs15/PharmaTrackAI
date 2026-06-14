import { ApiError } from '../utils/ApiError.js';

/** Restricts a route to the given roles (req.user.role), e.g. authorize(...MANAGEMENT_ROLES). */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.', 'FORBIDDEN');
    }
    next();
  };
}
