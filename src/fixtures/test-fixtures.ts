import { test as base, expect, Page } from '@playwright/test';
import { AddEmployeePage, DashboardPage, EmployeeDetailsPage, EmployeeListPage, LoginPage } from '../pages';
import { EmployeeData } from '../data/types';
import { buildEmployee } from '../utils/dataFactory';
import { openSessionAs } from '../utils/session';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  addEmployeePage: AddEmployeePage;
  employeeDetailsPage: EmployeeDetailsPage;
  employeeListPage: EmployeeListPage;
};

type DataFixtures = {
  /** An ESS employee (with login) created before the test and deleted after it. */
  essEmployee: EmployeeData;
  /** A logged-in page for `essEmployee`, in its own isolated browser context. */
  essPage: Page;
};

export const test = base.extend<PageFixtures & DataFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  addEmployeePage: async ({ page }, use) => use(new AddEmployeePage(page)),
  employeeDetailsPage: async ({ page }, use) => use(new EmployeeDetailsPage(page)),
  employeeListPage: async ({ page }, use) => use(new EmployeeListPage(page)),

  essEmployee: async ({ addEmployeePage, employeeListPage }, use) => {
    const employee = buildEmployee({ withLogin: true });
    await addEmployeePage.createEmployee(employee);
    await use(employee);
    await employeeListPage.deleteEmployeeIfExists(employee.employeeId);
  },

  essPage: async ({ browser, essEmployee }, use) => {
    const { context, page } = await openSessionAs(browser, essEmployee.login!.username, essEmployee.login!.password);
    await use(page);
    await context.close();
  },
});

export { expect };
