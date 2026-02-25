const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://85b1971b.debt-consolidation-dashboard-8e1.pages.dev';

const PAGES_TO_TEST = [
  { page: 'ManagerDashboard', name: 'Manager Dashboard' },
  { page: 'OwnerDashboard', name: 'Owner Dashboard' },
  { page: 'AIAgentManagement', name: 'AI Agent Management' },
  { page: 'AICoach', name: 'AI Coach' },
  { page: 'TeamManagement', name: 'Team Management' },
  { page: 'Analytics', name: 'Analytics' },
  { page: 'Compliance', name: 'Compliance' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function login(page) {
  await page.goto(BASE_URL);
  await page.waitForSelector('input[placeholder*="email"]', { timeout: 10000 });
  await page.fill('input[placeholder*="email"]', 'owner@demo.com');
  await page.fill('input[placeholder*="password"]', 'demo');
  await page.click('button:has-text("Sign In")');
  await sleep(2000);
}

async function nav(page, pageName) {
  await page.evaluate((pn) => {
    const items = document.querySelectorAll('[onclick*="navigateTo"]');
    for (const item of items) {
      if (item.getAttribute('onclick').includes("'" + pn + "'")) { item.click(); return; }
    }
  }, pageName);
  await sleep(1500);
}

async function testPage(page, pi) {
  await nav(page, pi.page);

  // ---- CATALOG ----
  const catalog = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return { error: 'no main' };
    // Exclude header area (top bar with search/notifications)
    const header = main.querySelector('header');
    const isInHeader = (el) => header && header.contains(el);

    const heading = (main.querySelector('h1, h2')?.textContent || '').trim();

    const buttons = [...main.querySelectorAll('button')].filter(b => !isInHeader(b)).map((b, i) => ({
      idx: i + 1, text: b.textContent.trim().substring(0, 60), disabled: b.disabled,
    }));

    const inputs = [...main.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea')]
      .filter(el => !isInHeader(el))
      .map((inp, i) => ({ idx: i+1, placeholder: inp.placeholder||'', type: inp.type||'text', id: inp.id||'', disabled: inp.disabled }));

    const selects = [...main.querySelectorAll('select')].filter(el => !isInHeader(el)).map((s, i) => ({
      idx: i+1, id: s.id||'', optionCount: s.options.length, options: [...s.options].map(o=>o.text).slice(0,10),
    }));

    const tables = [...main.querySelectorAll('table')].map((t, i) => ({
      idx: i+1, headers: [...t.querySelectorAll('th')].map(th=>th.textContent.trim()), rowCount: t.querySelectorAll('tbody tr').length,
    }));

    const checkboxes = [...main.querySelectorAll('input[type=checkbox]')].filter(el => !isInHeader(el)).map((c, i) => ({
      idx: i+1, id: c.id||'', checked: c.checked, label: c.closest('label')?.textContent?.trim()?.substring(0,40)||'',
    }));

    const tabs = [...main.querySelectorAll('[role=tab]')].map((t, i) => ({
      idx: i+1, text: t.textContent.trim().substring(0,40),
    }));

    return { heading, buttons, inputs, selects, tables, checkboxes, tabs };
  });

  // ---- TEST BUTTONS one at a time ----
  const buttonResults = [];
  const btnCount = catalog.buttons?.length || 0;

  for (let i = 0; i < btnCount; i++) {
    const btn = catalog.buttons[i];
    if (btn.disabled) {
      buttonResults.push({ ...btn, result: 'Disabled', working: 'N/A' });
      continue;
    }

    // Re-navigate to get clean state
    await nav(page, pi.page);
    await sleep(300);

    let dialogText = null;
    const dh = d => { dialogText = d.message(); d.accept(); };
    page.on('dialog', dh);

    const beforeHash = await page.evaluate(() => window.location.hash);

    try {
      const clicked = await page.evaluate((idx) => {
        const main = document.querySelector('main');
        if (!main) return 'no-main';
        const header = main.querySelector('header');
        const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
        if (idx >= btns.length) return 'out-of-range';
        btns[idx].click();
        return 'clicked';
      }, i);

      if (clicked !== 'clicked') {
        buttonResults.push({ ...btn, result: `Nav issue: ${clicked}`, working: '❌' });
        page.removeListener('dialog', dh);
        continue;
      }

      await sleep(700);

      const afterHash = await page.evaluate(() => window.location.hash);
      const modal = await page.evaluate(() => {
        // Check for any overlay/modal that appeared
        const els = document.querySelectorAll('.fixed, [role="dialog"], [class*="modal"]');
        for (const el of els) {
          const style = getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 50) {
            const t = el.textContent.trim();
            if (t.length > 10 && !el.closest('aside') && !el.closest('nav') && !el.closest('header')) {
              return t.substring(0, 80);
            }
          }
        }
        return null;
      });

      let result = '';
      if (dialogText) result += `Alert: "${dialogText}" `;
      if (afterHash !== beforeHash) result += `Navigate: ${afterHash} `;
      if (modal) result += `Modal: "${modal.substring(0,50)}..." `;
      if (!result) {
        // Check if any toast appeared
        const toast = await page.evaluate(() => {
          const t = document.querySelector('[class*="toast"], [class*="Toast"]');
          return t ? t.textContent.trim().substring(0, 60) : null;
        });
        if (toast) result = `Toast: "${toast}"`;
        else result = 'No visible change';
      }

      buttonResults.push({ ...btn, result, working: result === 'No visible change' ? '⚠️' : '✅' });
    } catch (err) {
      buttonResults.push({ ...btn, result: `Error: ${err.message.substring(0,60)}`, working: '❌' });
    }
    page.removeListener('dialog', dh);
  }

  // ---- TEST INPUTS ----
  await nav(page, pi.page);
  const inputResults = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const header = main.querySelector('header');
    return [...main.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea')]
      .filter(el => !(header && header.contains(el)))
      .map((inp, i) => {
        const orig = inp.value;
        try {
          inp.focus();
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (nativeInputValueSetter) nativeInputValueSetter.call(inp, 'QA_TEST');
          else inp.value = 'QA_TEST';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          const accepted = inp.value === 'QA_TEST';
          if (nativeInputValueSetter) nativeInputValueSetter.call(inp, orig);
          else inp.value = orig;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          return { idx: i+1, placeholder: inp.placeholder||'', type: inp.type||'text', id: inp.id||'', acceptsInput: accepted, disabled: inp.disabled };
        } catch(e) {
          return { idx: i+1, placeholder: inp.placeholder||'', type: inp.type||'text', acceptsInput: false, error: e.message };
        }
      });
  });

  // ---- TEST SELECTS ----
  const selectResults = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const header = main.querySelector('header');
    return [...main.querySelectorAll('select')]
      .filter(el => !(header && header.contains(el)))
      .map((s, i) => {
        const opts = [...s.options].map(o => o.text);
        let working = false;
        if (s.options.length > 1) {
          const orig = s.selectedIndex;
          s.selectedIndex = 1;
          s.dispatchEvent(new Event('change', { bubbles: true }));
          working = s.selectedIndex === 1;
          s.selectedIndex = orig;
        }
        return { idx: i+1, id: s.id||'', optionCount: opts.length, options: opts.slice(0,8), working };
      });
  });

  // ---- TEST CHECKBOXES ----
  await nav(page, pi.page);
  const checkboxResults = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const header = main.querySelector('header');
    return [...main.querySelectorAll('input[type=checkbox]')]
      .filter(el => !(header && header.contains(el)))
      .map((c, i) => {
        const orig = c.checked;
        c.click();
        const toggled = c.checked !== orig;
        if (toggled) c.click(); // restore
        return { idx: i+1, id: c.id||'', label: c.closest('label')?.textContent?.trim()?.substring(0,40)||'', toggled };
      });
  });

  return { catalog, buttonResults, inputResults, selectResults, checkboxResults };
}

function fmtReport(passes) {
  let md = `# QA Report — Management & Dashboard Pages\n\n`;
  md += `**Tester:** QA Opus Agent 2\n**Date:** ${new Date().toISOString().split('T')[0]}\n**URL:** ${BASE_URL}\n**Login:** owner@demo.com / demo\n**Total Passes:** 3\n\n---\n\n`;

  for (const pi of PAGES_TO_TEST) {
    for (let p = 0; p < passes.length; p++) {
      const d = passes[p]?.[pi.name];
      if (!d) { md += `## ${pi.name} — Pass ${p+1}/3\n\n**SKIPPED**\n\n---\n\n`; continue; }

      md += `## ${pi.name} — Pass ${p+1}/3\n\n`;
      md += `**Heading:** ${d.catalog.heading || 'N/A'}\n\n`;

      // Buttons
      md += `### Buttons\n| # | Button Text | Click Result | Working? |\n|---|------------|--------------|----------|\n`;
      if (!d.buttonResults.length) md += `| - | No buttons | - | - |\n`;
      for (const b of d.buttonResults) {
        md += `| ${b.idx} | ${(b.text||'').replace(/\|/g,'\\|').replace(/\n/g,' ').substring(0,50)} | ${(b.result||'').replace(/\|/g,'\\|').replace(/\n/g,' ').substring(0,70)} | ${b.working} |\n`;
      }
      md += `\n`;

      // Inputs
      md += `### Inputs\n| # | Placeholder/ID | Type | Accepts Input? |\n|---|---------------|------|-----------|\n`;
      if (!d.inputResults.length) md += `| - | None | - | - |\n`;
      for (const inp of d.inputResults)
        md += `| ${inp.idx} | ${(inp.placeholder||inp.id||'(none)').substring(0,40)} | ${inp.type} | ${inp.acceptsInput?'✅':'❌'} |\n`;
      md += `\n`;

      // Selects
      md += `### Dropdowns/Selects\n| # | ID | Options | Working? |\n|---|-----|---------|----------|\n`;
      if (!d.selectResults.length) md += `| - | None | - | - |\n`;
      for (const s of d.selectResults)
        md += `| ${s.idx} | ${s.id||'(anon)'} | ${s.optionCount}: ${s.options.slice(0,5).join(', ')} | ${s.working?'✅':'⚠️'} |\n`;
      md += `\n`;

      // Tables
      md += `### Tables\n`;
      if (d.catalog.tables?.length) for (const t of d.catalog.tables) md += `- Table ${t.idx}: [${t.headers.join(', ')}] — ${t.rowCount} data rows\n`;
      else md += `- None\n`;
      md += `\n`;

      // Checkboxes
      md += `### Checkboxes/Toggles\n`;
      if (d.checkboxResults?.length) {
        md += `| # | ID | Label | Toggles? |\n|---|-----|-------|----------|\n`;
        for (const c of d.checkboxResults) md += `| ${c.idx} | ${c.id||'(anon)'} | ${c.label||'(none)'} | ${c.toggled?'✅':'❌'} |\n`;
      } else md += `- None\n`;
      md += `\n`;

      // Tabs
      if (d.catalog.tabs?.length) {
        md += `### Tabs\n`;
        for (const t of d.catalog.tabs) md += `- "${t.text}"\n`;
        md += `\n`;
      }

      // Issues
      md += `### Issues Found\n`;
      const issues = [];
      for (const b of d.buttonResults) {
        if (b.working === '⚠️') issues.push(`Button "${b.text}" — no visible result on click`);
        if (b.working === '❌') issues.push(`Button "${b.text}" — ${b.result}`);
      }
      for (const inp of d.inputResults) if (!inp.acceptsInput && !inp.disabled) issues.push(`Input "${inp.placeholder||inp.id}" won't accept input`);
      if (!issues.length) md += `- None ✅\n`; else for (const i of issues) md += `- ⚠️ ${i}\n`;
      md += `\n---\n\n`;
    }
  }

  // Summary table
  md += `## Consistency Summary (Across 3 Passes)\n\n`;
  md += `| Page | P1 Btns | P2 Btns | P3 Btns | P1 Inputs | P2 Inputs | P3 Inputs | Consistent? |\n`;
  md += `|------|---------|---------|---------|-----------|-----------|-----------|-------------|\n`;
  for (const pi of PAGES_TO_TEST) {
    const b = passes.map(p => p?.[pi.name]?.buttonResults?.length ?? '-');
    const inp = passes.map(p => p?.[pi.name]?.inputResults?.length ?? '-');
    const cons = b[0]===b[1]&&b[1]===b[2]&&inp[0]===inp[1]&&inp[1]===inp[2];
    md += `| ${pi.name} | ${b[0]} | ${b[1]} | ${b[2]} | ${inp[0]} | ${inp[1]} | ${inp[2]} | ${cons?'✅':'⚠️'} |\n`;
  }
  md += `\n`;

  return md;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const passes = [];
  for (let p = 1; p <= 3; p++) {
    console.log(`\n=== PASS ${p}/3 ===`);
    try {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await login(page);
      const report = {};
      for (const pi of PAGES_TO_TEST) {
        console.log(`  ${pi.name}...`);
        report[pi.name] = await testPage(page, pi);
        const r = report[pi.name];
        console.log(`    ${r.buttonResults.length}btn ${r.inputResults.length}inp ${r.selectResults.length}sel ${r.checkboxResults.length}chk`);
      }
      passes.push(report);
      await ctx.close();
    } catch (err) {
      console.error(`  Pass ${p} error:`, err.message);
      passes.push({});
    }
  }
  await browser.close();

  const md = fmtReport(passes);
  const dir = '/Users/mauichinery/Projects/debt-consolidation-dashboard/qa-reports';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + '/qa-opus-2-management.md', md);
  console.log(`\nDone! ${md.length} chars written.`);
})();
