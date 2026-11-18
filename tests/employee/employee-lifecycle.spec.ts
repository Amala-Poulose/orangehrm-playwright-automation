import { test, expect } from '../../src/fixtures/test-fixtures';
import { MESSAGES } from '../../src/data/messages';
import { ADMIN_ONLY_MODULES, COMMON_MODULES } from '../../src/data/menus';
import { buildEmployee, buildEmployeeUpdate } from '../../src/utils/dataFactory';
import { openSessionAs } from '../../src/utils/session';
import { ENV, ADMIN_STORAGE_STATE } from '../../config/env';
import { DashboardPage, EmployeeListPage, LoginPage } from '../../src/pages';

/**
 * End-to-end employee lifecycle: create → verify → role check → update → delete → verify access revoked.
 * Runs serially because each step depends on the previous one.
 */
test.describe.serial('Employee lifecycle', { tag: ['@lifecycle', '@regression'] }, () => {
  const employee = buildEmployee({ withLogin: true });
  const update = buildEmployeeUpdate();
  let empNumber: string;
  let deleted = false;

  test('admin creates a new employee with login details', { tag: ['@smoke', '@critical'] }, async ({ addEmployeePage, employeeDetailsPage }) => {
    empNumber = await addEmployeePage.createEmployee(employee);

    await employeeDetailsPage.waitForLoaded();
    await employeeDetailsPage.expectDetails({
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
    });
    await employeeDetailsPage.expectProfileName(employee.firstName, employee.lastName);
  });

  test('new employee is searchable in the PIM employee list', async ({ employeeListPage }) => {
    await employeeListPage.goto();
    await employeeListPage.searchByEmployeeId(employee.employeeId);
    await employeeListPage.expectEmployeeListed(employee.employeeId, employee.firstName, employee.lastName);
  });

  test('new employee logs in with ESS role and restricted access', { tag: '@rbac' }, async ({ browser }) => {
    const { context, page } = await openSessionAs(browser, employee.login!.username, employee.login!.password);
    try {
      const essHome = new DashboardPage(page);
      await essHome.expectLoaded();
      await expect(essHome.topBar.userName).toContainText(employee.firstName);
      await essHome.sideMenu.expectVisible(COMMON_MODULES);
      await essHome.sideMenu.expectHidden(ADMIN_ONLY_MODULES);
    } finally {
      await context.close();
    }
  });

  test('admin updates the employee personal details', async ({ employeeDetailsPage, page }) => {
    await employeeDetailsPage.goto(empNumber);
    await employeeDetailsPage.updatePersonalDetails(update);

    // Reload to prove the change was persisted, not just shown in the form.
    await page.reload();
    await employeeDetailsPage.waitForLoaded();
    await employeeDetailsPage.expectDetails({ firstName: employee.firstName, ...update });
  });

  test('updated details are reflected in the employee list', async ({ employeeListPage }) => {
    await employeeListPage.goto();
    await employeeListPage.searchByEmployeeId(employee.employeeId);
    await employeeListPage.expectEmployeeListed(employee.employeeId, employee.firstName, update.lastName!);
  });

  test('admin deletes the employee', { tag: '@critical' }, async ({ employeeListPage }) => {
    await employeeListPage.goto();
    await employeeListPage.searchByEmployeeId(employee.employeeId);
    await employeeListPage.deleteEmployee(employee.employeeId);
    deleted = true;

    await employeeListPage.searchByEmployeeId(employee.employeeId);
    await employeeListPage.expectNoRecords();
  });

  test('deleted employee can no longer log in', { tag: '@security' }, async ({ browser }) => {
    const context = await browser.newContext({ baseURL: ENV.baseUrl, storageState: { cookies: [], origins: [] } });
    try {
      const loginPage = new LoginPage(await context.newPage());
      await loginPage.goto();
      await loginPage.login(employee.login!.username, employee.login!.password);
      await expect(loginPage.errorAlert).toHaveText(MESSAGES.INVALID_CREDENTIALS);
    } finally {
      await context.close();
    }
  });

  // If an earlier step failed, don't leave test data behind on the shared instance.
  test.afterAll(async ({ browser }) => {
    if (deleted) return;
    const context = await browser.newContext({ baseURL: ENV.baseUrl, storageState: ADMIN_STORAGE_STATE });
    await new EmployeeListPage(await context.newPage()).deleteEmployeeIfExists(employee.employeeId);
    await context.close();
  });
});
