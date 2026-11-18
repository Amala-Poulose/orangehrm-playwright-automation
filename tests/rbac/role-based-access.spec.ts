import { test, expect } from '../../src/fixtures/test-fixtures';
import { ROUTES } from '../../config/routes';
import { ADMIN_ONLY_MODULES, ALL_ADMIN_VISIBLE_MODULES, COMMON_MODULES } from '../../src/data/menus';
import { DashboardPage } from '../../src/pages';

test.describe('Role-based access control', { tag: ['@rbac', '@regression'] }, () => {
  test('Admin role sees admin and common modules', { tag: '@smoke' }, async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.sideMenu.expectVisible(ALL_ADMIN_VISIBLE_MODULES);
  });

  test('Admin role can open User Management', async ({ page, dashboardPage }) => {
    await page.goto(ROUTES.ADMIN_SYSTEM_USERS);
    await dashboardPage.expectTitle('Admin');
    await expect(page.locator('h5', { hasText: 'System Users' })).toBeVisible();
  });

  test('ESS role sees only self-service modules', async ({ essPage, essEmployee }) => {
    const dashboard = new DashboardPage(essPage);
    await dashboard.expectLoaded();
    await expect(dashboard.topBar.userName).toContainText(essEmployee.firstName);
    await dashboard.sideMenu.expectVisible(COMMON_MODULES);
    await dashboard.sideMenu.expectHidden(ADMIN_ONLY_MODULES);
  });

  test('ESS role cannot reach admin User Management by URL', { tag: '@security' }, async ({ essPage }) => {
    await essPage.goto(ROUTES.ADMIN_SYSTEM_USERS);
    await essPage.waitForLoadState('domcontentloaded');
    await expect(essPage.locator('h5', { hasText: 'System Users' })).toHaveCount(0);
  });
});
