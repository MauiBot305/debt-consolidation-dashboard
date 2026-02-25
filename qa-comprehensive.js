const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://85b1971b.debt-consolidation-dashboard-8e1.pages.dev';
const PAGES = [
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
  await page.waitForSelector('input[placeholder*="email"]');
  await page.fill('input[placeholder*="email"]', 'owner@demo.com');
  await page.fill('input[placeholder*="password"]', 'demo');
  await page.click('button:has-text("Sign In")');
  await sleep(2000);
}

async function ensureApp(page) {
  const hasNav = await page.evaluate(() => !!document.querySelector('[onclick*="navigateTo"]')).catch(() => false);
  if (!hasNav) {
    // Navigate back to base URL - session/login state is preserved
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    // Check if we need to login again
    const needsLogin = await page.evaluate(() => !!document.querySelector('input[placeholder*="email"]')).catch(() => false);
    if (needsLogin) {
      await page.fill('input[placeholder*="email"]', 'owner@demo.com');
      await page.fill('input[placeholder*="password"]', 'demo');
      await page.click('button:has-text("Sign In")');
      await sleep(2000);
    }
  }
}

async function nav(page, pageName) {
  await ensureApp(page);
  await page.evaluate((pn) => {
    const items = document.querySelectorAll('[onclick*="navigateTo"]');
    for (const item of items) {
      if (item.getAttribute('onclick').includes("'" + pn + "'")) { item.click(); return; }
    }
  }, pageName);
  await sleep(1500);
}

async function catalog(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;
    const header = main.querySelector('header');
    const skip = el => header && header.contains(el);
    const heading = (main.querySelector('h1, h2')?.textContent || '').trim();
    const buttons = [...main.querySelectorAll('button')].filter(b => !skip(b)).map((b, i) => ({
      idx: i+1, text: b.textContent.trim().replace(/\s+/g,' ').substring(0,60), disabled: b.disabled,
    }));
    const inputs = [...main.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea')]
      .filter(el => !skip(el)).map((inp, i) => ({
        idx: i+1, placeholder: inp.placeholder||'', type: inp.type||'text', id: inp.id||'', disabled: inp.disabled,
      }));
    const selects = [...main.querySelectorAll('select')].filter(el => !skip(el)).map((s, i) => ({
      idx: i+1, id: s.id||'', optionCount: s.options.length, options: [...s.options].map(o=>o.text).slice(0,10),
    }));
    const tables = [...main.querySelectorAll('table')].map((t, i) => ({
      idx: i+1, headers: [...t.querySelectorAll('th')].map(th=>th.textContent.trim()), rowCount: t.querySelectorAll('tbody tr').length,
    }));
    const checkboxes = [...main.querySelectorAll('input[type=checkbox]')].filter(el => !skip(el)).map((c, i) => ({
      idx: i+1, id: c.id||'', checked: c.checked, label: c.closest('label')?.textContent?.trim()?.substring(0,40)||'',
    }));
    const tabs = [...main.querySelectorAll('[role=tab]')].map((t, i) => ({ idx: i+1, text: t.textContent.trim().substring(0,40) }));
    return { heading, buttons, inputs, selects, tables, checkboxes, tabs };
  });
}

async function clickButton(page, idx) {
  let dialogText = null;
  const dh = d => { dialogText = d.message(); d.accept(); };
  page.on('dialog', dh);

  const beforeHash = await page.evaluate(() => window.location.hash);

  try {
    await page.evaluate((i) => {
      const main = document.querySelector('main');
      if (!main) return;
      const header = main.querySelector('header');
      const btns = [...main.querySelectorAll('button')].filter(b => !(header && header.contains(b)));
      if (i < btns.length) btns[i].click();
    }, idx);
  } catch(e) {
    page.removeListener('dialog', dh);
    return `Click error: ${e.message.substring(0,50)}`;
  }

  await sleep(700);

  // Check if page is still intact
  const pageIntact = await page.evaluate(() => !!document.querySelector('main')).catch(() => false);
  
  let result = '';
  if (dialogText) result += `Alert: "${dialogText}" `;
  
  if (!pageIntact) {
    result += 'Page navigated away (full reload)';
    page.removeListener('dialog', dh);
    return result || 'Page destroyed';
  }

  const afterHash = await page.evaluate(() => window.location.hash).catch(() => '');
  if (afterHash !== beforeHash) result += `Navigate: ${afterHash} `;

  const modal = await page.evaluate(() => {
    const els = document.querySelectorAll('.fixed, [role="dialog"], [class*="modal"], [class*="Modal"]');
    for (const el of els) {
      const s = getComputedStyle(el);
      if (s.display !== 'none' && s.visibility !== 'hidden' && el.offsetHeight > 50) {
        const t = el.textContent.trim();
        if (t.length > 10 && !el.closest('aside') && !el.closest('nav')) return t.substring(0,80);
      }
    }
    return null;
  }).catch(() => null);

  if (modal) result += `Modal: "${modal.substring(0,50)}..." `;
  if (!result) result = 'No visible change';

  page.removeListener('dialog', dh);

  // Close modals
  await page.evaluate(() => {
    document.querySelectorAll('.fixed button, [role="dialog"] button').forEach(b => {
      const t = b.textContent.trim().toLowerCase();
      if (t.includes('close')||t.includes('cancel')||t==='×'||t==='x'||t==='✕') b.click();
    });
  }).catch(() => {});
  await sleep(200);

  return result;
}

async function testPage(page, pi) {
  await nav(page, pi.page);
  const cat = await catalog(page);
  if (!cat) return { catalog: {heading:'ERROR',buttons:[],inputs:[],selects:[],tables:[],checkboxes:[],tabs:[]}, buttonResults:[], inputResults:[], selectResults:[], checkboxResults:[] };

  console.log(`    Catalog: ${cat.buttons.length}btn ${cat.inputs.length}inp ${cat.selects.length}sel ${cat.checkboxes.length}chk ${cat.tables.length}tbl`);

  // Test buttons
  const buttonResults = [];
  for (let i = 0; i < cat.buttons.length; i++) {
    const btn = cat.buttons[i];
    if (btn.disabled) { buttonResults.push({...btn, result:'Disabled', working:'N/A'}); continue; }

    await nav(page, pi.page);
    const result = await clickButton(page, i);
    const working = result==='No visible change' ? '⚠️' : (result.includes('error')||result.includes('Error') ? '❌' : '✅');
    buttonResults.push({...btn, result, working});
  }

  // Test inputs
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
          const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
          if(s) s.call(inp,'QA_TEST'); else inp.value='QA_TEST';
          inp.dispatchEvent(new Event('input',{bubbles:true}));
          const ok = inp.value==='QA_TEST';
          if(s) s.call(inp,orig); else inp.value=orig;
          inp.dispatchEvent(new Event('input',{bubbles:true}));
          return {idx:i+1, placeholder:inp.placeholder||'', type:inp.type||'text', id:inp.id||'', acceptsInput:ok, disabled:inp.disabled};
        } catch(e) { return {idx:i+1, placeholder:inp.placeholder||'', type:inp.type||'text', acceptsInput:false}; }
      });
  }).catch(() => []);

  // Test selects
  const selectResults = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const header = main.querySelector('header');
    return [...main.querySelectorAll('select')].filter(el => !(header && header.contains(el))).map((s, i) => {
      const opts = [...s.options].map(o => o.text);
      let working = s.options.length > 1;
      if(working) { const o=s.selectedIndex; s.selectedIndex=1; s.dispatchEvent(new Event('change',{bubbles:true})); working=s.selectedIndex===1; s.selectedIndex=o; }
      return {idx:i+1, id:s.id||'', optionCount:opts.length, options:opts.slice(0,8), working};
    });
  }).catch(() => []);

  // Test checkboxes
  await nav(page, pi.page);
  const checkboxResults = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    const header = main.querySelector('header');
    return [...main.querySelectorAll('input[type=checkbox]')].filter(el => !(header && header.contains(el))).map((c, i) => {
      const orig = c.checked;
      c.click();
      const toggled = c.checked !== orig;
      if(toggled) c.click();
      return {idx:i+1, id:c.id||'', label:c.closest('label')?.textContent?.trim()?.substring(0,40)||'', toggled};
    });
  }).catch(() => []);

  return { catalog: cat, buttonResults, inputResults, selectResults, checkboxResults };
}

function fmtReport(passes) {
  let md = `# QA Report — Management & Dashboard Pages\n\n`;
  md += `**Tester:** QA Opus Agent 2\n**Date:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**URL:** ${BASE_URL}\n**Login:** owner@demo.com / demo\n**Total Passes:** 3\n\n---\n\n`;

  for (const pi of PAGES) {
    for (let p = 0; p < passes.length; p++) {
      const d = passes[p]?.[pi.name];
      if (!d) { md += `## ${pi.name} — Pass ${p+1}/3\n\n**SKIPPED**\n\n---\n\n`; continue; }

      md += `## ${pi.name} — Pass ${p+1}/3\n\n**Heading:** ${d.catalog.heading||'N/A'}\n\n`;

      md += `### Buttons (${d.buttonResults.length})\n| # | Button Text | Click Result | Working? |\n|---|------------|--------------|----------|\n`;
      if(!d.buttonResults.length) md += `| - | No buttons | - | - |\n`;
      for(const b of d.buttonResults) md += `| ${b.idx} | ${(b.text||'').replace(/[|\n]/g,' ').substring(0,50)} | ${(b.result||'').replace(/[|\n]/g,' ').substring(0,70)} | ${b.working} |\n`;
      md += `\n`;

      md += `### Inputs (${d.inputResults.length})\n| # | Placeholder/ID | Type | Accepts Input? |\n|---|---------------|------|-----------|\n`;
      if(!d.inputResults.length) md += `| - | None | - | - |\n`;
      for(const inp of d.inputResults) md += `| ${inp.idx} | ${(inp.placeholder||inp.id||'(none)').substring(0,40)} | ${inp.type} | ${inp.acceptsInput?'✅':'❌'} |\n`;
      md += `\n`;

      md += `### Dropdowns/Selects (${d.selectResults.length})\n| # | ID | Options | Working? |\n|---|-----|---------|----------|\n`;
      if(!d.selectResults.length) md += `| - | None | - | - |\n`;
      for(const s of d.selectResults) md += `| ${s.idx} | ${s.id||'(anon)'} | ${s.optionCount}: ${s.options.slice(0,5).join(', ')} | ${s.working?'✅':'⚠️'} |\n`;
      md += `\n`;

      md += `### Tables (${d.catalog.tables?.length||0})\n`;
      if(d.catalog.tables?.length) for(const t of d.catalog.tables) md += `- Table ${t.idx}: [${t.headers.join(', ')}] — ${t.rowCount} rows\n`;
      else md += `- None\n`;
      md += `\n`;

      md += `### Checkboxes/Toggles (${d.checkboxResults?.length||0})\n`;
      if(d.checkboxResults?.length) {
        md += `| # | ID | Label | Toggles? |\n|---|-----|-------|----------|\n`;
        for(const c of d.checkboxResults) md += `| ${c.idx} | ${c.id||'(anon)'} | ${c.label||'(none)'} | ${c.toggled?'✅':'❌'} |\n`;
      } else md += `- None\n`;
      md += `\n`;

      if(d.catalog.tabs?.length) { md += `### Tabs\n`; for(const t of d.catalog.tabs) md += `- "${t.text}"\n`; md += `\n`; }

      md += `### Issues Found\n`;
      const issues = [];
      for(const b of d.buttonResults) {
        if(b.working==='⚠️') issues.push(`Button "${b.text}" — no visible result`);
        if(b.working==='❌') issues.push(`Button "${b.text}" — ${b.result}`);
      }
      for(const inp of d.inputResults) if(!inp.acceptsInput&&!inp.disabled) issues.push(`Input "${inp.placeholder||inp.id}" doesn't accept input`);
      if(!issues.length) md += `- None ✅\n`; else for(const i of issues) md += `- ⚠️ ${i}\n`;
      md += `\n---\n\n`;
    }
  }

  md += `## Consistency Summary\n\n| Page | P1 Btns | P2 Btns | P3 Btns | P1 Inp | P2 Inp | P3 Inp | Consistent? |\n|------|---------|---------|---------|--------|--------|--------|-------------|\n`;
  for(const pi of PAGES) {
    const b = passes.map(p => p?.[pi.name]?.buttonResults?.length??'-');
    const inp = passes.map(p => p?.[pi.name]?.inputResults?.length??'-');
    const ok = b[0]===b[1]&&b[1]===b[2]&&inp[0]===inp[1]&&inp[1]===inp[2];
    md += `| ${pi.name} | ${b[0]} | ${b[1]} | ${b[2]} | ${inp[0]} | ${inp[1]} | ${inp[2]} | ${ok?'✅':'⚠️'} |\n`;
  }
  return md;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const passes = [];
  for (let p = 1; p <= 3; p++) {
    console.log(`\n=== PASS ${p}/3 ===`);
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page);
    const report = {};
    for (const pi of PAGES) {
      console.log(`  ${pi.name}...`);
      try {
        report[pi.name] = await testPage(page, pi);
        const r = report[pi.name];
        console.log(`    Done: ${r.buttonResults.length}btn ${r.inputResults.length}inp ${r.selectResults.length}sel ${r.checkboxResults.length}chk`);
      } catch (err) {
        console.log(`    ERROR: ${err.message.substring(0,80)}`);
        report[pi.name] = null;
      }
    }
    passes.push(report);
    await ctx.close();
  }
  await browser.close();
  const md = fmtReport(passes);
  const dir = '/Users/mauichinery/Projects/debt-consolidation-dashboard/qa-reports';
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(dir+'/qa-opus-2-management.md', md);
  console.log(`\nDone! ${md.length} chars`);
})();
