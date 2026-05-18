## Management System Notice

This repository targets a Lawyer management system.

---
name: playwright-e2e
description: 'Playwright E2E testing best practices for Next.js projects. Covers locator strategies, auto-waiting assertions, Page Object Model, fixtures, accessibility testing, API testing, CI/CD integration, and anti-patterns. Triggers when writing, editing, or running Playwright tests.'
argument-hint: "Describe the Playwright E2E scenario, page flow, and assertions"
license: MIT
metadata:
  author: project
  version: '2.0.0'
  filePattern:
    - 'tests/e2e/**'
    - 'playwright.config.*'
  bashPattern:
    - 'playwright'
    - 'test:e2e'
---

# Playwright E2E Testing — Best Practices

For full workflow context, see `docs/project-workflow.md`.

## Core Principles

1. **Test user-visible behavior** — assert what users see, not implementation details
2. **Test isolation** — each test gets its own `page` and `context`, no shared state
3. **Auto-waiting first** — never use `waitForTimeout`; rely on Playwright's built-in auto-waiting
4. **Don't test third-party services** — mock external APIs with `page.route()`

---

## 1. Locator Strategy (Priority Order)

Use locators that reflect how users find elements — most accessible first:

| Priority | Locator | When to Use |
|----------|---------|-------------|
| 1 | `getByRole()` | Buttons, headings, links, checkboxes, navigation |
| 2 | `getByLabel()` | Form fields with associated `<label>` |
| 3 | `getByPlaceholder()` | Inputs with placeholder text |
| 4 | `getByText()` | Non-interactive elements (div, span, p) |
| 5 | `getByAltText()` | Images with alt text |
| 6 | `getByTitle()` | Elements with title attribute |
| 7 | `getByTestId()` | Last resort — resilient but not user-facing |

### Anti-patterns

```typescript
// ❌ Brittle CSS chain tied to DOM structure
page.locator('#app > div:nth-child(2) > div.wrapper > input');

// ❌ Class-based selectors
page.locator('button.btn-primary.submit');

// ❌ XPath
page.locator('//button[@type="submit"]');

// ✅ Role-based (accessible and resilient)
page.getByRole('button', { name: 'Submit' });
page.getByRole('heading', { name: 'Welcome', level: 1 });
page.getByLabel('Email');
```

### Filtering and Chaining

```typescript
// Filter by text content
page.getByRole('listitem').filter({ hasText: 'Product 2' });

// Filter by child locator
page.getByRole('listitem').filter({
  has: page.getByRole('heading', { name: 'Product 2' }),
});

// Chain to narrow scope
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
await product.getByRole('button', { name: 'Add to cart' }).click();

// AND / OR operators
const button = page.getByRole('button').and(page.getByTitle('Subscribe'));
const element = page.getByRole('button', { name: 'New' })
  .or(page.getByText('Confirm'));
```

### Strictness Rule

Locators are **strict by default** — they throw if multiple elements match. Avoid `.first()` / `.nth()` unless you genuinely need positional selection. Prefer more specific locators instead.

---

## 2. Assertions — Always Use Auto-Retrying

### Web-first assertions (auto-retry until timeout)

```typescript
// ✅ Auto-retrying — waits for condition, no flakiness
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle('Dashboard');

// ❌ Evaluates once — race condition, causes flaky tests
expect(await page.getByText('Welcome').isVisible()).toBe(true);
```

### Key auto-retrying assertions

| Category | Assertions |
|----------|------------|
| **Visibility** | `toBeVisible()`, `toBeHidden()` |
| **State** | `toBeEnabled()`, `toBeDisabled()`, `toBeChecked()`, `toBeFocused()` |
| **Content** | `toHaveText()`, `toContainText()`, `toHaveValue()` |
| **Count** | `toHaveCount()` |
| **Attributes** | `toHaveAttribute()`, `toHaveClass()`, `toHaveCSS()` |
| **Page** | `toHaveTitle()`, `toHaveURL()` |

### Soft assertions (collect all failures, don't stop early)

```typescript
await expect.soft(page.getByTestId('status')).toHaveText('Success');
await expect.soft(page.getByTestId('count')).toHaveText('42');
// Test continues; ALL failures reported at end
```

### Custom messages for debugging

```typescript
await expect(page.getByText('Name'), 'User should be logged in').toBeVisible();
```

### Polling for non-element conditions

```typescript
await expect.poll(async () => {
  const response = await page.request.get('/api/health');
  return response.status();
}, {
  message: 'API should be healthy',
  timeout: 10_000,
}).toBe(200);
```

### Retry entire blocks

```typescript
await expect(async () => {
  const response = await page.request.get('/api/data');
  expect(response.status()).toBe(200);
}).toPass({ timeout: 30_000 });
```

---

## 3. Page Object Model (POM)

Encapsulate page structure and user workflows in reusable classes:

```typescript
// tests/e2e/pages/presentation.page.ts
import { type Locator, type Page, expect } from '@playwright/test';

export class PresentationPage {
  readonly page: Page;
  readonly slideContent: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly themeToggle: Locator;
  readonly overviewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.slideContent = page.locator('main');
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.prevButton = page.getByRole('button', { name: /previous/i });
    this.themeToggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    this.overviewButton = page.getByRole('button', { name: 'Slide overview' });
  }

  async goto(locale: 'th' | 'en' = 'th') {
    const response = await this.page.goto(`/${locale}/presentation`);
    expect(response?.status()).toBeLessThan(400);
  }

  async nextSlide() {
    await this.page.keyboard.press('ArrowRight');
  }

  async prevSlide() {
    await this.page.keyboard.press('ArrowLeft');
  }

  async verifySlideChanged(previousContent: string) {
    await expect(this.slideContent).not.toHaveText(previousContent);
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }
}
```

### POM Principles

- Store `Page` and `Locator` as **readonly** properties
- Initialize locators in constructor (lazy — no DOM lookup until used)
- Methods encapsulate **user workflows**, not individual actions
- Include assertions inside POM methods where they validate workflow completion
- Combine with fixtures for automatic setup/teardown

---

## 4. Fixtures

### Custom fixtures with `test.extend()`

```typescript
// tests/e2e/fixtures.ts
import { test as base } from '@playwright/test';
import { PresentationPage } from './pages/presentation.page';

type Fixtures = {
  presentationPage: PresentationPage;
};

export const test = base.extend<Fixtures>({
  presentationPage: async ({ page }, use) => {
    const presentationPage = new PresentationPage(page);
    await presentationPage.goto();
    await use(presentationPage);
    // teardown runs here after test completes
  },
});

export { expect } from '@playwright/test';
```

### Usage in tests

```typescript
import { test, expect } from './fixtures';

test('can navigate slides', async ({ presentationPage }) => {
  const before = await presentationPage.slideContent.textContent();
  await presentationPage.nextSlide();
  await presentationPage.verifySlideChanged(before!);
});
```

### Fixture option for locale parameterization

```typescript
export const test = base.extend<{ locale: 'th' | 'en' }>({
  locale: ['th', { option: true }],
});

// In playwright.config.ts:
// projects: [
//   { name: 'thai', use: { locale: 'th' } },
//   { name: 'english', use: { locale: 'en' } },
// ]
```

### Automatic fixtures (run for every test)

```typescript
export const test = base.extend({
  consoleErrors: [async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await use(errors);
    if (errors.length > 0) {
      await testInfo.attach('console-errors', {
        body: errors.join('\n'),
        contentType: 'text/plain',
      });
    }
  }, { auto: true }],
});
```

---

## 5. API Testing

### Use `request` fixture for API-only checks (no browser overhead)

```typescript
test('API returns correct headers', async ({ request }) => {
  const response = await request.get('/th');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
});
```

### Use API to set up preconditions

```typescript
test.beforeAll(async ({ request }) => {
  await request.post('/api/seed', { data: { fixture: 'test-data' } });
});
```

### Validate UI actions via API

```typescript
test('form submission creates record', async ({ page, request }) => {
  // UI action
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Created!')).toBeVisible();

  // API validation
  const response = await request.get('/api/items/latest');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.title).toBe('New Item');
});
```

### Mock external APIs

```typescript
test('handles API failure gracefully', async ({ page }) => {
  await page.route('**/api/external/**', route =>
    route.fulfill({ status: 500, body: 'Internal Error' })
  );
  await page.goto('/th');
  await expect(page.getByText('Service unavailable')).toBeVisible();
});
```

---

## 6. Accessibility Testing

### Install and configure @axe-core/playwright

```bash
pnpm add -D @axe-core/playwright
```

### Full page scan

```typescript
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/th');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### Targeted scan (specific section)

```typescript
const results = await new AxeBuilder({ page })
  .include('#main-content')
  .analyze();
```

### WCAG-specific compliance levels

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

### Exclude known violations

```typescript
const results = await new AxeBuilder({ page })
  .exclude('#legacy-widget')
  .disableRules(['color-contrast'])
  .analyze();
```

### Attach results for CI debugging

```typescript
await testInfo.attach('a11y-scan', {
  body: JSON.stringify(results.violations, null, 2),
  contentType: 'application/json',
});
```

> **Note**: Automated a11y testing catches ~30-50% of WCAG issues. It complements but does not replace manual testing.

---

## 7. Parameterized Tests

### Array-driven (test multiple locales, routes, viewports)

```typescript
const locales = ['th', 'en'] as const;

for (const locale of locales) {
  test(`home page loads for locale: ${locale}`, async ({ page }) => {
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  });
}
```

### Project-level parameterization (full suite per config)

```typescript
// playwright.config.ts
projects: [
  {
    name: 'local',
    use: { baseURL: 'http://localhost:3000' },
  },
  {
    name: 'staging',
    use: { baseURL: 'https://staging.example.com' },
  },
  {
    name: 'production',
    use: { baseURL: 'https://example.com' },
  },
]
```

### Important: keep `beforeEach`/`afterEach` outside `forEach` loops

---

## 8. Console & Network Monitoring

### Capture JS runtime errors (filter noise)

```typescript
test('no JS runtime errors on page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/th');

  const criticalErrors = errors.filter(
    (e) =>
      !e.includes('Failed to load resource') && // network 404s
      !e.includes('ResizeObserver') &&           // browser warning
      !e.includes('hydrat') &&                   // React dev noise
      !e.includes('net::ERR_')                   // network errors
  );
  expect(criticalErrors).toHaveLength(0);
});
```

### Detect broken assets (404s)

```typescript
test('no broken assets', async ({ page }) => {
  const notFound: string[] = [];
  page.on('response', (resp) => {
    if (resp.status() === 404) notFound.push(resp.url());
  });
  await page.goto('/th', { waitUntil: 'networkidle' });

  const critical404s = notFound.filter((u) => !u.includes('favicon'));
  expect(critical404s, `Broken: ${critical404s.join(', ')}`).toHaveLength(0);
});
```

---

## 9. Project Configuration

### Use only when the repo actually has Playwright wired

Before using Playwright E2E commands in this repository, verify all of the following exist:

- `playwright.config.ts` or `playwright.config.js`
- package scripts such as `test:e2e`
- a `tests/e2e` or equivalent Playwright test directory

If those files are missing, do not assume Playwright E2E is ready. Prefer the `ai-agent-testing` skill for browser QA, or set up Playwright explicitly before using this skill as the primary path.

### Example config pattern

```text
Base URL resolution:
  1. PLAYWRIGHT_BASE_URL env var -> deployed URL (no webServer)
  2. CI=true -> webServer runs `pnpm start` (pre-built app)
  3. Local dev -> webServer runs `pnpm dev` (reuses existing)
```

### Example commands after Playwright is configured

```bash
pnpm exec playwright test
pnpm build && CI=true pnpm exec playwright test
PLAYWRIGHT_BASE_URL=https://url.vercel.app pnpm exec playwright test

pnpm exec playwright test --ui
pnpm exec playwright test --headed
pnpm exec playwright show-report
```

---

## 10. CI/CD Pipeline

### GitHub Actions flow (`.github/workflows/ci.yml`)

```
quality (lint + typecheck)
  ↓
unit-test (vitest)
  ↓
e2e-local (build → pnpm start → Playwright)
  ↓
deploy (Vercel preview) ← push only
  ↓
e2e-deployed (Playwright → PLAYWRIGHT_BASE_URL)
```

### CI best practices

- **Linux runners** — most cost-effective
- **Install only needed browsers**: `pnpm exec playwright install --with-deps chromium`
- **Single worker in CI**: `workers: process.env.CI ? 1 : undefined`
- **Retries in CI only**: `retries: process.env.CI ? 2 : 0`
- **Forbid `.only` in CI**: `forbidOnly: !!process.env.CI`
- **Upload reports on failure** as artifacts
- **Use sharding** for large suites: `pnpm exec playwright test --shard=1/3`
- **Keep Playwright updated**: `pnpm add -D @playwright/test@latest`

---

## 11. Anti-Patterns Summary

| Anti-Pattern | Fix |
|---|---|
| `expect(await el.isVisible()).toBe(true)` | `await expect(el).toBeVisible()` |
| CSS selectors `#a > div:nth-child(2)` | `getByRole()`, `getByLabel()`, etc. |
| `page.waitForTimeout(5000)` | Rely on auto-waiting in actions and assertions |
| Testing third-party APIs directly | Mock with `page.route()` |
| Sharing state between tests | Use fixtures for test isolation |
| Missing `await` on assertions | Enable `@typescript-eslint/no-floating-promises` |
| Asserting on implementation details | Assert on user-visible outcomes |
| `page.evaluate()` for assertions | Use web-first assertions on locators |
| Giant test files with no structure | Use POM + fixtures |
| `.first()` / `.nth()` as primary strategy | Use more specific locators with filtering |
| `innerHTML` equality checks | `toHaveText()`, `toContainText()` |
| Hardcoded sleep for animations | `waitForTimeout` as last resort, prefer `toBeVisible()` |

---

## 12. Debugging

```bash
# Headed browser (watch the test run)
pnpm exec playwright test --headed

# Interactive UI mode (time-travel debugging)
pnpm exec playwright test --ui

# Generate trace for all tests
pnpm exec playwright test --trace on

# View trace file
pnpm exec playwright show-trace test-results/*/trace.zip

# HTML report with screenshots/videos
pnpm exec playwright show-report

# Generate test code from browser actions
pnpm exec playwright codegen http://localhost:3000

# Run specific test file
pnpm exec playwright test tests/e2e/home.spec.ts

# Run tests matching name pattern
pnpm exec playwright test --grep "locale redirect"
```

---

## 13. File Conventions

| Convention | Rule |
|---|---|
| Test files | `tests/e2e/*.spec.ts` |
| Page objects | `tests/e2e/pages/*.page.ts` |
| Fixtures | `tests/e2e/fixtures.ts` |
| Test data | `tests/e2e/data/*.json` or inline arrays |
| Group by feature | `home.spec.ts`, `presentation.spec.ts`, `auth.spec.ts` |
| Both locales | Always test `/th/...` and `/en/...` routes |
| Describe blocks | Group related tests with `test.describe()` |
| Test names | Read as sentences: `'Thai home page renders without error'` |
