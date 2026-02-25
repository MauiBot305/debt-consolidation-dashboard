#!/usr/bin/env python3
"""Fix IIFE wrapping on all page HTML files.
Moves the IIFE to wrap the ENTIRE script content, with window exports at the end."""

import re
import os
import glob

pages_dir = os.path.expanduser("~/Projects/debt-consolidation-dashboard/public/pages")

for filepath in sorted(glob.glob(os.path.join(pages_dir, "*.html"))):
    page = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find the script block
    script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if not script_match:
        print(f"SKIP: {page} — no script block")
        continue
    
    script_content = script_match.group(1)
    
    # Remove existing IIFE wrapper and window exports
    # Strip existing (function() { ... })(); wrapper
    cleaned = script_content
    
    # Remove the small IIFE block (the broken one that just wraps exports)
    # Pattern: (function() {\n  window.X = X;\n  ...  })();
    cleaned = re.sub(r'\s*\(function\(\)\s*\{[^}]*window\.[^}]*\}\)\(\);\s*', '\n', cleaned)
    
    # Also remove standalone window.X = X lines that might be outside the IIFE
    window_exports = re.findall(r'window\.(\w+)\s*=\s*(\w+);', cleaned)
    for wname, wval in window_exports:
        cleaned = re.sub(rf'\s*window\.{re.escape(wname)}\s*=\s*{re.escape(wval)};\s*', '\n', cleaned)
    
    # Collect all onclick function names from the HTML portion
    html_portion = content[:script_match.start()]
    onclick_fns = set(re.findall(r'onclick="(\w+)\(', html_portion))
    
    # Also check for onclick in dynamically generated HTML (template literals in JS)
    onclick_in_js = set(re.findall(r'onclick=(?:\\"|")(\w+)\(', cleaned))
    onclick_fns.update(onclick_in_js)
    # Also from backtick templates: onclick="${...}" or onclick="funcName(..."
    onclick_in_templates = set(re.findall(r"onclick=[\"'](\w+)\(", cleaned))
    onclick_fns.update(onclick_in_templates)
    
    # Find all function definitions in the script
    func_defs = set(re.findall(r'function\s+(\w+)\s*\(', cleaned))
    # Also arrow functions assigned to const/let: const X = (...) =>
    arrow_fns = set(re.findall(r'(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>', cleaned))
    all_fns = func_defs | arrow_fns
    
    # Build window exports for onclick functions that exist as definitions
    exports = []
    for fn in sorted(onclick_fns):
        if fn in all_fns:
            exports.append(f"  window.{fn} = {fn};")
        elif fn == 'showToast':
            # showToast might be defined as a utility - export it
            exports.append(f"  window.{fn} = {fn};")
    
    # Also re-add any window exports for functions called from other dynamically generated code
    # Check for event listeners that reference functions
    event_fns = set(re.findall(r"addEventListener\(['\"]click['\"],\s*(\w+)", cleaned))
    for fn in sorted(event_fns):
        if fn in all_fns and f"  window.{fn} = {fn};" not in exports:
            exports.append(f"  window.{fn} = {fn};")
    
    exports_block = "\n".join(exports)
    
    # Build the new script content
    new_script = f"""
(function() {{
  'use strict';
{cleaned}
  // Expose onclick functions to window
{exports_block}
}})();
"""
    
    # Replace in the original content
    new_content = content[:script_match.start()] + f"<script>{new_script}</script>" + content[script_match.end():]
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"FIXED: {page} — {len(onclick_fns)} onclick fns, {len(exports)} exports, {len(all_fns)} function defs")

print("\nDone! All pages re-wrapped.")
