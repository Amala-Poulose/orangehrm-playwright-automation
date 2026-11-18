import { Page, expect } from '@playwright/test';
import { ROUTES } from '../../config/routes';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.open(ROUTES.DASHBOARD);
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard\/index/);
    await this.expectTitle('Dashboard');
  }

  async logout(): Promise<void> {
    await this.topBar.logout();
    await this.page.waitForURL(/\/auth\/login/);
  }
}
