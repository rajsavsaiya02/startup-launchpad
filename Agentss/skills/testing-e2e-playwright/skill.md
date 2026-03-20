---
name: Testing-E2E-Playwright
description: Specialized logic for browser automation with Playwright.
---

# Goal
To validate that the entire system (Frontend + Backend + Database) works together as expected from the user's perspective, covering critical user journeys.

# Step-by-Step Logic
1. **Test Environment**: Run tests against a stable staging or local development environment.
2. **Page Object Model (POM)**: Use POM to encapsulate page-specific logic and selectors.
3. **Dynamic Data**: Use test fixtures to generate clean database states for each test.
4. **Cross-Browser Verification**: Ensure critical flows work on Chromium, Firefox, and WebKit.
5. **State Management**: Handle authentication flows efficiently using storage state to avoid logging in for every test.

# Technical Constraints
- **Runner**: Playwright.
- **Speed**: Use parallel execution while managing database concurrency.
- **Resilience**: Use `await expect(...)` to handle asynchronous UI updates without fragile sleeps.

# Code Patterns
```typescript
// Playwright Page Object Model
import { test, expect } from '@playwright/test';

test('user can successfully launch a startup project', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=New Project');
  
  await page.fill('input[name="projectName"]', 'Project X');
  await page.selectOption('select[name="category"]', 'FinTech');
  await page.click('button:has-text("Launch")');

  await expect(page).toHaveURL(/\/project\/.*\/success/);
  await expect(page.locator('h1')).toContainText('Congratulations!');
});
```

# Tool Integration
- **Google Search**: Research Playwright plugins for visual regression testing or CI integration.
- **Figma**: Reference Figma clickable prototypes to map E2E user flows.
