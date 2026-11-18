import { Browser, BrowserContext, Page } from '@playwright/test';
import { ENV } from '../../config/env';
import { LoginPage } from '../pages/LoginPage';
import { logger } from './logger';

export interface UserSession {
  context: BrowserContext;
  page: Page;
}

/**
 * Opens an isolated, unauthenticated browser context and logs in as the given user.
 * Used for role-based checks where a second user acts alongside the admin session.
 */
export async function openSessionAs(browser: Browser, username: string, password: string): Promise<UserSession> {
  logger.info(`Opening isolated session for user "${username}"`);
  const context = await browser.newContext({
    baseURL: ENV.baseUrl,
    storageState: { cookies: [], origins: [] },
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAndWaitForDashboard(username, password);
  return { context, page };
}
