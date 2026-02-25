import { test, expect } from '@playwright/test';

const PAGES = [
  'AgentDashboard', 'ManagerDashboard', 'OwnerDashboard',
  'PowerDialer', 'CRMLeads', 'DealPipeline', 'CaseManagement',
  'CallHistory', 'Analytics', 'AICoach', 'Compliance', 'Financial',
  'Marketing', 'Gamification', 'Automation', 'TeamManagement',
  'Settings', 'ClientPortal', 'DataImport'
];

const CREDENTIALS = {
  email: process.env.DASHBOARD_EMAIL || 'owner@demo.com',
  password: process.env.DASHBOARD_PASSWORD || 'demo',
};

test('dashboard pages load cleanly twice with no console errors or dead buttons', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('baseURL is not defined');

  const consoleErrors: { type: string; text: string }[] = [];
  page.on('pageerror', (error) => {
    consoleErrors.push({ type: 'pageerror', text: error.message });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ type: 'console', text: msg.text() });
    }
  });

  await page.goto(baseURL);
  await page.waitForLoadState('domcontentloaded');
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button:has-text("Sign In")');
  await page.waitForSelector('#mainContent', { timeout: 20_000 });
  await page.waitForFunction('typeof App !== "undefined" && typeof App.loadPage === "function"', undefined, { timeout: 20_000 });
  await page.evaluate(() => {
    const app = (0, eval)('App');
    if (!app || typeof app.loadPage !== 'function') {
      throw new Error('App.loadPage missing after wait');
    }
    (window as typeof window & { __loadPage?: (page: string) => Promise<void> }).__loadPage = app.loadPage.bind(app);
  });

  const qaResults = await page.evaluate(async (pages) => {
    const errors: { page: string; error: string; source?: string; line?: number }[] = [];
    const deadButtons: { page: string; button: string; onclick: string; func: string }[] = [];

    window.addEventListener('error', (e) => {
      errors.push({
        page: (window as any).__currentPage || 'unknown',
        error: e.message,
        source: e.filename,
        line: e.lineno,
      });
    });

    async function navigateAndScan(pageName: string, waitMs: number) {
      (window as any).__currentPage = pageName;
      const loadPage = (window as typeof window & { __loadPage?: (page: string) => Promise<void> }).__loadPage;
      if (typeof loadPage !== 'function') {
        throw new Error('loadPage bridge is not available');
      }
      await loadPage(pageName);
      await new Promise((resolve) => setTimeout(resolve, waitMs));

      const buttons = document.querySelectorAll('#pageContent [onclick]');
      buttons.forEach((btn) => {
        const onclick = btn.getAttribute('onclick');
        if (!onclick) return;
        // Skip compound statements starting with event.* (e.g. "event.stopPropagation(); doThing()")
        const cleaned = onclick.replace(/^\s*event\.\w+\([^)]*\)\s*;?\s*/, '');
        // Match standalone function calls like "doThing()" but also "Obj.method()"
        const match = cleaned.match(/^(\w+(?:\.\w+)*)\s*\(/);
        if (!match) return;
        const chain = match[1].split('.');
        let target: unknown = window;
        for (const part of chain) {
          if (target && typeof target === 'object' && part in (target as Record<string, unknown>)) {
            target = (target as Record<string, unknown>)[part];
          } else {
            target = undefined;
            break;
          }
        }
        if (typeof target !== 'function') {
          deadButtons.push({
            page: pageName,
            button: (btn.textContent || '').trim().slice(0, 40),
            onclick,
            func: match[1],
          });
        }
      });
    }

    for (const name of pages) {
      await navigateAndScan(name, 1500);
    }
    for (const name of pages) {
      await navigateAndScan(`${name}_round2`, 800);
    }

    return { errors, deadButtons };
  }, PAGES);

  if (consoleErrors.length) {
    console.log('Console/Page errors captured:', consoleErrors);
  }

  expect(consoleErrors, 'No console or page errors should be emitted').toHaveLength(0);
  expect(qaResults.errors, 'No window error events expected').toHaveLength(0);
  expect(qaResults.deadButtons, 'All onclick handlers should resolve to functions').toHaveLength(0);
});
