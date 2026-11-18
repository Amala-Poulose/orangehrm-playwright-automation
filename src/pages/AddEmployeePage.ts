import { Locator, Page, expect } from '@playwright/test';
import { ROUTES } from '../../config/routes';
import { EmployeeData } from '../data/types';
import { MESSAGES } from '../data/messages';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class AddEmployeePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly createLoginToggle: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly enabledStatus: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.employeeIdInput = this.inputByLabel('Employee Id');
    this.createLoginToggle = page.locator('.oxd-switch-input');
    this.usernameInput = this.inputByLabel('Username');
    this.passwordInput = this.inputByLabel('Password');
    this.confirmPasswordInput = this.inputByLabel('Confirm Password');
    this.enabledStatus = page.locator('.oxd-radio-wrapper label', { hasText: 'Enabled' });
    this.saveButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.open(ROUTES.PIM_ADD_EMPLOYEE);
    await expect(this.firstNameInput).toBeVisible();
    // The auto-generated Employee Id loads asynchronously – wait so it doesn't overwrite ours.
    await expect(this.employeeIdInput).not.toHaveValue('');
  }

  /** Creates an employee (optionally with ESS login) and returns the internal empNumber. */
  async createEmployee(employee: EmployeeData): Promise<string> {
    logger.info(`Creating employee ${employee.firstName} ${employee.lastName} (id ${employee.employeeId})`);
    await this.goto();

    await this.firstNameInput.fill(employee.firstName);
    if (employee.middleName) await this.middleNameInput.fill(employee.middleName);
    await this.lastNameInput.fill(employee.lastName);
    await this.employeeIdInput.fill(employee.employeeId);

    if (employee.login) {
      await this.createLoginToggle.click();
      await expect(this.usernameInput).toBeVisible();
      await this.usernameInput.fill(employee.login.username);
      await this.enabledStatus.click();
      await this.passwordInput.fill(employee.login.password);
      await this.confirmPasswordInput.fill(employee.login.password);
    }

    await this.saveButton.click();
    await this.expectToast(MESSAGES.SAVED);
    await this.page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/, { timeout: 45_000 });

    const empNumber = this.page.url().match(/empNumber\/(\d+)/)?.[1];
    if (!empNumber) throw new Error(`Could not read empNumber from URL: ${this.page.url()}`);
    logger.info(`Employee created with empNumber ${empNumber}`);
    return empNumber;
  }
}
