import { Locator, Page, expect } from '@playwright/test';
import { ROUTES } from '../../config/routes';
import { EmployeeUpdate } from '../data/types';
import { MESSAGES } from '../data/messages';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/** PIM > Employee > Personal Details. */
export class EmployeeDetailsPage extends BasePage {
  readonly personalDetailsForm: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly otherIdInput: Locator;
  readonly saveButton: Locator;
  readonly profileName: Locator;

  constructor(page: Page) {
    super(page);
    this.personalDetailsForm = page.locator('form').filter({ has: page.locator('input[name="firstName"]') });
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.otherIdInput = this.inputByLabel('Other Id');
    this.saveButton = this.personalDetailsForm.locator('button[type="submit"]');
    this.profileName = page.locator('.orangehrm-edit-employee-name h6');
  }

  async goto(empNumber: string): Promise<void> {
    await this.open(ROUTES.PIM_PERSONAL_DETAILS(empNumber));
    await this.waitForLoaded();
  }

  /** The form is populated asynchronously; wait until real data is present. */
  async waitForLoaded(): Promise<void> {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.firstNameInput).not.toHaveValue('');
    await this.waitForLoaders();
  }

  async updatePersonalDetails(update: EmployeeUpdate): Promise<void> {
    logger.info(`Updating personal details: ${JSON.stringify(update)}`);
    await this.waitForLoaded();

    if (update.firstName !== undefined) await this.firstNameInput.fill(update.firstName);
    if (update.middleName !== undefined) await this.middleNameInput.fill(update.middleName);
    if (update.lastName !== undefined) await this.lastNameInput.fill(update.lastName);
    if (update.otherId !== undefined) await this.otherIdInput.fill(update.otherId);
    if (update.maritalStatus !== undefined) await this.selectOption('Marital Status', update.maritalStatus);

    await this.saveButton.click();
    await this.expectToast(MESSAGES.UPDATED);
  }

  async expectDetails(expected: EmployeeUpdate & { firstName?: string }): Promise<void> {
    if (expected.firstName !== undefined) await expect(this.firstNameInput).toHaveValue(expected.firstName);
    if (expected.middleName !== undefined) await expect(this.middleNameInput).toHaveValue(expected.middleName);
    if (expected.lastName !== undefined) await expect(this.lastNameInput).toHaveValue(expected.lastName);
    if (expected.otherId !== undefined) await expect(this.otherIdInput).toHaveValue(expected.otherId);
    if (expected.maritalStatus !== undefined) {
      await expect(this.selectedOption('Marital Status')).toHaveText(expected.maritalStatus);
    }
  }

  async expectProfileName(firstName: string, lastName: string): Promise<void> {
    await expect(this.profileName).toHaveText(new RegExp(`${firstName}.*${lastName}`));
  }
}
