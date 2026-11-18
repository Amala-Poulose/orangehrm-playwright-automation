/** Application routes, relative to BASE_URL. */
export const ROUTES = {
  LOGIN: '/web/index.php/auth/login',
  DASHBOARD: '/web/index.php/dashboard/index',
  PIM_EMPLOYEE_LIST: '/web/index.php/pim/viewEmployeeList',
  PIM_ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',
  PIM_PERSONAL_DETAILS: (empNumber: string) => `/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`,
  ADMIN_SYSTEM_USERS: '/web/index.php/admin/viewSystemUsers',
} as const;
