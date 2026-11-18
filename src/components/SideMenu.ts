import { Locator, Page, expect } from '@playwright/test';
import { exactText } from '../utils/text';

/** Left navigation menu, present on every authenticated page. */
export class SideMenu {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('nav.oxd-navbar-nav');
  }

  item(name: string): Locator {
    return this.root.locator('.oxd-main-menu-item').filter({ hasText: exactText(name) });
  }

  async open(name: string): Promise<void> {
    await this.item(name).click();
  }

  async expectVisible(names: readonly string[]): Promise<void> {
    for (const name of names) {
      await expect(this.item(name), `Menu "${name}" should be visible`).toBeVisible();
    }
  }

  async expectHidden(names: readonly string[]): Promise<void> {
    await expect(this.root).toBeVisible();
    for (const name of names) {
      await expect(this.item(name), `Menu "${name}" should NOT be visible`).toHaveCount(0);
    }
  }
}
