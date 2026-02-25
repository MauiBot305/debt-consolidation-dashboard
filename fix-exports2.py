#!/usr/bin/env python3
"""Add missing window exports for onclick functions in all page HTML files."""
import re, os, glob

pages_dir = os.path.expanduser("~/Projects/debt-consolidation-dashboard/public/pages")

for filepath in sorted(glob.glob(os.path.join(pages_dir, "*.html"))):
    page = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find ALL onclick function names (in HTML and in JS template literals)
    onclick_fns = set(re.findall(r'onclick="(\w+)\(', content))
    
    # Find ALL function definitions (any indentation)
    func_defs = set(re.findall(r'\bfunction\s+(\w+)\s*\(', content))
    
    # Find existing window exports
    existing_exports = set(re.findall(r'window\.(\w+)\s*=\s*\w+;', content))
    
    # Find missing exports
    missing = []
    for fn in sorted(onclick_fns):
        if fn in func_defs and fn not in existing_exports:
            missing.append(fn)
    
    if not missing:
        continue
    
    # Find the })(); line (IIFE close) to insert exports before it
    iife_close = content.rfind('})();')
    if iife_close == -1:
        print(f"SKIP: {page} — no IIFE close found")
        continue
    
    exports = "\n".join(f"  window.{fn} = {fn};" for fn in missing)
    insert = f"\n  // Expose onclick functions to window\n{exports}\n"
    
    new_content = content[:iife_close] + insert + content[iife_close:]
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"FIXED: {page} — added {len(missing)} exports: {', '.join(missing)}")

print("\nDone!")
