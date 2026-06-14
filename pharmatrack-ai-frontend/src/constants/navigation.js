import { ALL_ROLES, ADMIN_ONLY, MANAGEMENT_ROLES } from './roles';

/**
 * Sidebar navigation. `roles` controls visibility (RBAC). `matchPaths`
 * (optional) lists extra route prefixes that should also highlight this
 * item as active (e.g. both Inventory In and Out share one nav entry).
 */
export const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ALL_ROLES },
  { icon: 'medication', label: 'Medicines', path: '/medicines', roles: ALL_ROLES },
  { icon: 'layers', label: 'Batches', path: '/batches', roles: ALL_ROLES },
  {
    icon: 'swap_horiz',
    label: 'Inventory In/Out',
    path: '/inventory/in',
    matchPaths: ['/inventory/in', '/inventory/out'],
    roles: ALL_ROLES,
  },
  { icon: 'history_toggle_off', label: 'Expiry Monitoring', path: '/expiry-monitoring', roles: ALL_ROLES },
  { icon: 'psychology', label: 'AI Forecast', path: '/ai-forecast', roles: MANAGEMENT_ROLES },
  { icon: 'assessment', label: 'Reports', path: '/reports', roles: MANAGEMENT_ROLES },
  { icon: 'settings', label: 'Settings', path: '/settings', roles: ALL_ROLES },
  { icon: 'admin_panel_settings', label: 'User Management', path: '/settings/users', roles: ADMIN_ONLY },
];
