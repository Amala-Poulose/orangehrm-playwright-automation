import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Environment-based configuration.
 * Select an environment with TEST_ENV=<name> (default: qa). Values are read from env/.env.<name>.
 * Real process variables (e.g. GitHub Actions secrets) always win over the file values.
 */
const envName = process.env.TEST_ENV ?? 'qa';
const envFile = path.resolve(__dirname, `../env/.env.${envName}`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.warn(`[config] ${envFile} not found – relying on process environment variables only.`);
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[config] Missing required environment variable "${key}" for environment "${envName}".`);
  }
  return value;
}

export const ENV = {
  name: envName,
  baseUrl: required('BASE_URL'),
  admin: {
    username: required('ADMIN_USERNAME'),
    password: required('ADMIN_PASSWORD'),
  },
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 15_000),
  headless: process.env.HEADLESS !== 'false',
} as const;

/** Where the authenticated admin session is stored by the setup project. */
export const ADMIN_STORAGE_STATE = path.resolve(__dirname, '../.auth/admin.json');
