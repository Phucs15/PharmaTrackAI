/**
 * Mirrors pharmatrack-ai-frontend/src/constants/roles.js so RBAC checks
 * on the backend match the role strings the frontend already relies on.
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
