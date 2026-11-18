import { Locator, Page } from '@playwright/test';

/** Header bar: page title and the user dropdown (logout). */
export class TopBar {
  readonly title: Locator;
  readonly userDropdown: Locator;
  readonly userName: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.title = page.locator('.oxd-topbar-header-breadcrumb h6').first();
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.userName = page.locator('.oxd-userdropdown-name');
    this.logoutLink = page.locator('a.oxd-userdropdown-link', { hasText: 'Logout' });
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }
}
