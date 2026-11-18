/** Side-menu modules used for role-based validation. */
export const ADMIN_ONLY_MODULES = ['Admin', 'PIM'] as const;
export const COMMON_MODULES = ['Leave', 'Time', 'My Info', 'Dashboard', 'Directory'] as const;
export const ALL_ADMIN_VISIBLE_MODULES = [...ADMIN_ONLY_MODULES, ...COMMON_MODULES] as const;
