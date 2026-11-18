import { test, expect } from '../../src/fixtures/test-fixtures';
import { ENV } from '../../config/env';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../../src/data/messages';

test.describe('Authentication', { tag: ['@auth', '@regression'] }, () => {
  // These tests must start logged out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('admin can log in with valid credentials', { tag: ['@smoke', '@critical'] }, async ({ loginPage, dashboardPage }) => {
    await loginPage.login(ENV.admin.username, ENV.admin.password);
    await dashboardPage.expectLoaded();
    await expect(dashboardPage.topBar.userName).toBeVisible();
  });

  test('shows an error for invalid credentials', { tag: '@negative' }, async ({ loginPage }) => {
    await loginPage.login(ENV.admin.username, 'wrong-password-123');
    await expect(loginPage.errorAlert).toHaveText(MESSAGES.INVALID_CREDENTIALS);
    await loginPage.expectOnLoginPage();
  });

  test('shows required-field validation when submitting empty form', { tag: '@negative' }, async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.fieldErrors).toHaveCount(2);
    await expect(loginPage.fieldErrors.first()).toHaveText(MESSAGES.REQUIRED);
  });

  test('admin can log out', { tag: '@smoke' }, async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAndWaitForDashboard(ENV.admin.username, ENV.admin.password);
    await dashboardPage.logout();
    await loginPage.expectOnLoginPage();
  });

  test('protected pages redirect unauthenticated users to login', { tag: '@security' }, async ({ page, loginPage }) => {
    await page.goto(ROUTES.PIM_EMPLOYEE_LIST);
    await loginPage.expectOnLoginPage();
  });
});
