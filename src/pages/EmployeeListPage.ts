import { Locator, Page, expect } from '@playwright/test';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../data/messages';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/** PIM > Employee List: search, open, delete. */
export class EmployeeListPage extends BasePage {
  readonly employeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly tableRows: Locator;
  readonly recordCount: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.employeeIdInput = this.inputByLabel('Employee Id');
    this.searchButton = page.locator('button[type="submit"]', { hasText: 'Search' });
    this.addButton = page.locator('.orangehrm-header-container button', { hasText: 'Add' });
    this.tableRows = page.locator('.oxd-table-body .oxd-table-card');
    this.recordCount = page.locator('.orangehrm-horizontal-padding span.oxd-text');
    this.confirmDeleteButton = page.locator('.orangehrm-modal-footer button', { hasText: 'Yes, Delete' });
  }

  async goto(): Promise<void> {
    await this.open(ROUTES.PIM_EMPLOYEE_LIST);
    await this.expectTitle('PIM');
    await expect(this.employeeIdInput).toBeVisible();
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    logger.info(`Searching employee list for id ${employeeId}`);
    await this.employeeIdInput.fill(employeeId);
    // Wait for the actual search request so we never assert against stale rows.
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/api/v2/pim/employees') && res.request().method() === 'GET',
      ),
      this.searchButton.click(),
    ]);
    await this.page.locator('.oxd-table-loader').waitFor({ state: 'hidden' });
  }

  rowFor(employeeId: string): Locator {
    return this.tableRows.filter({ hasText: employeeId });
  }

  async expectEmployeeListed(employeeId: string, firstName: string, lastName: string): Promise<void> {
    const row = this.rowFor(employeeId);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(firstName);
    await expect(row).toContainText(lastName);
  }

  async expectNoRecords(): Promise<void> {
    await expect(this.recordCount.filter({ hasText: MESSAGES.NO_RECORDS })).toBeVisible();
    await expect(this.tableRows).toHaveCount(0);
  }

  async openEmployee(employeeId: string): Promise<void> {
    await this.rowFor(employeeId).click();
    await this.page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/);
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    logger.info(`Deleting employee ${employeeId}`);
    await this.rowFor(employeeId).locator('button:has(i.bi-trash)').click();
    await this.confirmDeleteButton.click();
    await this.expectToast(MESSAGES.DELETED);
  }

  /** Best-effort cleanup used by fixtures/hooks – never fails the test. */
  async deleteEmployeeIfExists(employeeId: string): Promise<void> {
    try {
      await this.goto();
      await this.searchByEmployeeId(employeeId);
      if ((await this.rowFor(employeeId).count()) > 0) {
        await this.deleteEmployee(employeeId);
      }
    } catch (error) {
      logger.warn(`Cleanup for employee ${employeeId} failed: ${(error as Error).message}`);
    }
  }
}
