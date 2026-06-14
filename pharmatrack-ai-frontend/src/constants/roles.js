/**
 * Application roles. Values match the strings returned by the (future)
 * backend's `user.role` field, so RBAC checks can compare directly.
 */
export const ROLES = {
  ADMIN: 'Administrator',
  MANAGER: 'Warehouse Manager',
  STAFF: 'Warehouse Staff',
};

export const ALL_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF];

/** Roles allowed to create/edit medicines, batches, and view AI/Reports. */
export const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER];

/** Roles allowed to access User Management. */
export const ADMIN_ONLY = [ROLES.ADMIN];
