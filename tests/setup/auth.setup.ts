import { test as setup } from '@playwright/test';
import { ENV, ADMIN_STORAGE_STATE } from '../../config/env';
import { LoginPage } from '../../src/pages';

/**
 * Logs in once as Admin and stores the session, so every other test
 * starts authenticated without repeating the login UI.
 */
setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAndWaitForDashboard(ENV.admin.username, ENV.admin.password);
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
