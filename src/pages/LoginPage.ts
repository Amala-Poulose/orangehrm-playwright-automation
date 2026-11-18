import { Locator, Page, expect } from '@playwright/test';
import { ROUTES } from '../../config/routes';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.fieldErrors = page.locator('.oxd-input-field-error-message');
  }

  async goto(): Promise<void> {
    await this.open(ROUTES.LOGIN);
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    logger.info(`Logging in as "${username}"`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAndWaitForDashboard(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.page.waitForURL(/\/dashboard\/index/);
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
    await expect(this.loginButton).toBeVisible();
  }
}
