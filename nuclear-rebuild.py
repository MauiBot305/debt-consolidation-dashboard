#!/usr/bin/env python3
"""Nuclear rebuild: Extract HTML content, extract ONLY function definitions from scripts, rebuild clean IIFE."""
import re, os, glob

pages_dir = os.path.expanduser("~/Projects/debt-consolidation-dashboard/public/pages")

for filepath in sorted(glob.glob(os.path.join(pages_dir, "*.html"))):
    page = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # Find script block markers
    script_start = None
    script_end = None
    for i, line in enumerate(lines):
        if '<script>' in line and script_start is None:
            script_start = i
        if '</script>' in line and script_start is not None and script_end is None:
            script_end = i
    
    if script_start is None or script_end is None:
        continue
    
    # Extract HTML parts
    html_before = ''.join(lines[:script_start + 1])  # Include <script> tag
    script_raw = ''.join(lines[script_start + 1:script_end])
    html_after = ''.join(lines[script_end:])  # Include </script> tag
    
    # Strip HTML from html_before to just get the opening <script>
    html_before = re.sub(r'<script>.*', '<script>', html_before, flags=re.DOTALL)
    
    # Extract ALL function definitions from script_raw
    # Keep everything between "function" declarations, but remove nested IIFEs and old window exports
    
    # Remove existing IIFE wrappers
    script_cleaned = script_raw
    script_cleaned = re.sub(r'\(function\(\)\s*\{', '', script_cleaned)
    script_cleaned = re.sub(r'\}\)\(\);', '', script_cleaned)
    
    # Remove all "window.X = X;" lines
    script_cleaned = re.sub(r'^\s*window\.\w+\s*=\s*\w+;?\s*$', '', script_cleaned, flags=re.MULTILINE)
    
    # Remove // Expose... comments
    script_cleaned = re.sub(r'^\s*//\s*.*Expose.*$', '', script_cleaned, flags=re.MULTILINE)
    script_cleaned = re.sub(r'^\s*//\s*.*Window.*$', '', script_cleaned, flags=re.MULTILINE)
    
    # Remove ---- comment lines
    script_cleaned = re.sub(r'^\s*//\s*[-=]+.*$', '', script_cleaned, flags=re.MULTILINE)
    
    # Clean up "use strict"
    script_cleaned = re.sub(r"^\s*'use strict';\s*$", '', script_cleaned, flags=re.MULTILINE)
    script_cleaned = re.sub(r'^\s*"use strict";\s*$', '', script_cleaned, flags=re.MULTILINE)
    
    # Find ALL onclick function names used in the entire file
    onclick_fns = set(re.findall(r'onclick=["\'](\w+)\(', html_before + script_cleaned + html_after))
    
    # Find ALL function definitions
    func_defs = set(re.findall(r'\bfunction\s+(\w+)\s*\(', script_cleaned))
    
    # Build exports for onclick functions that exist
    exports = []
    for fn in sorted(onclick_fns):
        if fn in func_defs:
            exports.append(f"  window.{fn} = {fn};")
    
    exports_block = '\n'.join(exports) if exports else "  // No onclick functions to export"
    
    # Build the final script
    final_script = f"""(function() {{
'use strict';

{script_cleaned.strip()}

// Window exports for onclick handlers
{exports_block}
}})();
"""
    
    # Write back
    new_content = html_before + final_script + html_after
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"REBUILT: {page} — {len(func_defs)} functions, {len(exports)} exports")

print("\nDone!")
