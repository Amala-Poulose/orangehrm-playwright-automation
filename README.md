# OrangeHRM – Playwright + TypeScript Automation Framework

End-to-end automation of the complete **employee lifecycle** in [OrangeHRM](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login): authentication, employee creation, role-based validation, update and deletion.

## Tech stack

Playwright Test 1.48, TypeScript 5 (strict), dotenv for environment configuration, cross-env for cross-platform scripts, and GitHub Actions for CI.

## Project structure

```
orangehrm-playwright/
├── .github/workflows/playwright.yml   # CI pipeline (env / tag / browser inputs)
├── config/
│   ├── env.ts                         # Loads env/.env.<TEST_ENV>, validates required vars
│   └── routes.ts                      # Application URLs in one place
├── env/
│   ├── .env.qa                        # QA (public demo) – default
│   ├── .env.staging                   # Staging placeholder
│   └── .env.example                   # Template for new environments
├── src/
│   ├── components/                    # Reusable UI parts shared by pages
│   │   ├── SideMenu.ts
│   │   └── TopBar.ts
│   ├── pages/                         # Page Object Model
│   │   ├── BasePage.ts                # Toasts, loaders, oxd-control helpers
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── AddEmployeePage.ts
│   │   ├── EmployeeDetailsPage.ts
│   │   ├── EmployeeListPage.ts
│   │   └── index.ts
│   ├── fixtures/test-fixtures.ts      # Page fixtures + self-cleaning ESS employee fixture
│   ├── data/                          # Types, UI messages, menu definitions
│   └── utils/                         # Data factory, session helper, logger, text helpers
├── tests/
│   ├── setup/auth.setup.ts            # Logs in once, saves admin storage state
│   ├── auth/authentication.spec.ts
│   ├── employee/employee-lifecycle.spec.ts
│   └── rbac/role-based-access.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Test coverage

| Area | Spec | What is verified |
|---|---|---|
| Authentication | `auth/authentication.spec.ts` | Valid login, invalid credentials, required-field validation, logout, redirect of unauthenticated users |
| Employee lifecycle | `employee/employee-lifecycle.spec.ts` | Create employee with login → search in list → ESS login with restricted menus → update personal details (persisted after reload) → list reflects update → delete → deleted user can no longer log in |
| Role-based access | `rbac/role-based-access.spec.ts` | Admin sees Admin/PIM and can open User Management; ESS user sees only self-service modules and cannot reach User Management by URL |

## Setup

Prerequisites: Node.js 18+ (20 recommended) and Git.

```bash
git clone <your-repo-url>
cd orangehrm-playwright
npm install
npm run install:browsers      # or: npx playwright install chromium
```

## Running tests

```bash
npm test                      # all tests, Chromium, QA env
npm run test:smoke            # @smoke only
npm run test:regression       # @regression
npm run test:lifecycle        # employee lifecycle
npm run test:rbac             # role-based access
npm run test:auth             # authentication
npm run test:headed           # watch the browser
npm run test:firefox          # Firefox project
npm run test:all-browsers     # Chromium + Firefox
npm run test:staging          # TEST_ENV=staging
npm run report                # open the last HTML report
```

Any Playwright CLI option still works, e.g. `npx playwright test --grep "@smoke|@security"` or `npx playwright test --grep-invert @negative`.

## Environment configuration

The environment is chosen with `TEST_ENV` (default `qa`), which loads `env/.env.<TEST_ENV>`. Required variables are `BASE_URL`, `ADMIN_USERNAME` and `ADMIN_PASSWORD`; optional ones are `DEFAULT_TIMEOUT` and `HEADLESS`. Real environment variables (for example GitHub secrets) override file values, so credentials for private environments never need to be committed. To add an environment, copy `env/.env.example` to `env/.env.<name>` and run with `TEST_ENV=<name>`.

## Tagging strategy

Tags use Playwright's native `tag` option and are filtered with `--grep`.

| Tag | Purpose |
|---|---|
| `@smoke` | Fast, critical-path checks for every commit |
| `@regression` | Full functional suite |
| `@critical` | Business-critical steps (login, create, delete) |
| `@auth` / `@lifecycle` / `@rbac` | Feature areas |
| `@negative` | Invalid-input scenarios |
| `@security` | Access-control checks |

## Reporting and observability

Every run produces an HTML report (`playwright-report/`), JUnit XML and JSON results (`reports/`) for CI dashboards, and on failure a screenshot, video and Playwright trace in `test-results/`. Traces can be opened with `npx playwright show-trace <path-to-trace.zip>`, or directly from the HTML report.

## CI – GitHub Actions

`.github/workflows/playwright.yml` runs on push and pull request to `main`, and manually via **Actions → Playwright Tests → Run workflow**, where you can pick the environment, a tag filter and the browser. The HTML report and JUnit/JSON results are uploaded on every run; screenshots, videos and traces are uploaded when a run fails. Commit `package-lock.json`, since the pipeline uses `npm ci`.

## Key design decisions

**Page Object Model with components.** Pages expose intent-level methods (`createEmployee`, `updatePersonalDetails`, `deleteEmployee`) and keep locators private to the page. The side menu and top bar are components composed into `BasePage`, so they are defined once.

**Label-based locators for OrangeHRM's custom controls.** OrangeHRM renders inputs and dropdowns without stable IDs. `BasePage` finds fields by their visible label (`inputByLabel`, `selectOption`), which is more resilient than positional CSS like `nth(3)`.

**Waiting on real signals, not timeouts.** There are no hard waits. The framework waits for the auto-generated Employee Id before overwriting it, for the details form to be populated before editing, and for the actual `/api/v2/pim/employees` response after a search so assertions never run against stale rows.

**Authenticate once.** A `setup` project logs in as Admin and stores the session in `.auth/admin.json`; other projects depend on it. Authentication tests opt out with an empty storage state.

**Isolated, self-cleaning test data.** `dataFactory` generates unique names, employee IDs, usernames and policy-compliant passwords. The `essEmployee` fixture creates a user and deletes it after the test; the lifecycle suite has an `afterAll` that removes its employee if an earlier step failed.

**Multi-user role checks.** ESS sessions run in a separate browser context alongside the admin session (`openSessionAs`), so role-based behaviour is verified with genuinely different users rather than by inspecting role labels.

**Serial lifecycle, parallel everything else.** The lifecycle steps depend on each other, so that file uses `describe.serial` and reports each stage as its own test. Other specs are independent and run in parallel.

## Known limitations

The public demo is shared and is reset periodically, so occasional slowness or data changes from other users are possible. CI uses one worker and one retry to reduce this flakiness. For stable results, point `staging` at your own OrangeHRM instance (for example the official Docker image).
git init
## Test reports and build artifacts

- **Saved local run:** `test-reports/html-report/index.html` (download the repo and open in a browser) and `test-reports/results/` (JUnit XML and JSON).
- **CI runs:** every GitHub Actions run uploads the HTML report, JUnit/JSON results and, on failure, screenshots, videos and traces. Open the **Actions** tab, choose a run, and download them under **Artifacts**.