import { Locator, Page, expect } from '@playwright/test';
import { SideMenu } from '../components/SideMenu';
import { TopBar } from '../components/TopBar';
import { exactText } from '../utils/text';

/**
 * Shared behaviour for all OrangeHRM pages: navigation, loaders, toasts,
 * and label-based locators for OrangeHRM's custom (oxd) form controls.
 */
export abstract class BasePage {
  readonly sideMenu: SideMenu;
  readonly topBar: TopBar;
  readonly toast: Locator;
  readonly formLoader: Locator;

  constructor(protected readonly page: Page) {
    this.sideMenu = new SideMenu(page);
    this.topBar = new TopBar(page);
    this.toast = page.locator('.oxd-toast');
    this.formLoader = page.locator('.oxd-form-loader');
  }

  async open(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForLoaders(): Promise<void> {
    await this.formLoader.first().waitFor({ state: 'hidden' });
    await this.page.locator('.oxd-loading-spinner').first().waitFor({ state: 'hidden' });
  }

  async expectToast(message: string): Promise<void> {
    await expect(this.toast.filter({ hasText: message }).first()).toBeVisible();
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.topBar.title).toHaveText(exactText(title));
  }

  /** The `.oxd-input-group` wrapper whose label matches exactly. */
  protected group(label: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.locator('label', { hasText: exactText(label) }) });
  }

  protected inputByLabel(label: string): Locator {
    return this.group(label).locator('input');
  }

  /** Select an option in an OrangeHRM custom dropdown identified by its label. */
  protected async selectOption(label: string, option: string): Promise<void> {
    await this.group(label).locator('.oxd-select-text').click();
    await this.page.locator('.oxd-select-dropdown [role="option"]').filter({ hasText: exactText(option) }).click();
  }

  protected selectedOption(label: string): Locator {
    return this.group(label).locator('.oxd-select-text-input');
  }
}
