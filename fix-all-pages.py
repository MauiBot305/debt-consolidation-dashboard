#!/usr/bin/env python3
"""
Nuclear option: For each page HTML file, extract the script block,
remove ALL existing IIFE wrappers, then wrap the ENTIRE thing in one clean IIFE.
Also find ALL onclick function references and ensure they're on window.
"""
import re, os, glob

pages_dir = os.path.expanduser("~/Projects/debt-consolidation-dashboard/public/pages")

for filepath in sorted(glob.glob(os.path.join(pages_dir, "*.html"))):
    page = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Split into HTML and script parts
    # Find the LAST <script>...</script> block (the main one)
    parts = re.split(r'(<script>)(.*?)(</script>)', content, flags=re.DOTALL)
    if len(parts) < 5:
        print(f"SKIP: {page} — no script block found")
        continue
    
    # Reconstruct: parts[0]=html before, parts[1]=<script>, parts[2]=script content, parts[3]=</script>, parts[4]=after
    # Find the main (last) script block
    script_idx = None
    for i in range(len(parts)-1, -1, -1):
        if parts[i] == '<script>':
            script_idx = i
            break
    
    if script_idx is None:
        print(f"SKIP: {page}")
        continue
    
    html_before = ''.join(parts[:script_idx])
    script_raw = parts[script_idx + 1]
    html_after = ''.join(parts[script_idx + 3:])
    
    # Strip ALL existing IIFE wrappers and window exports
    script = script_raw
    
    # Remove any (function() { 'use strict'; at the top
    script = re.sub(r'^\s*\(function\(\)\s*\{\s*(?:\'use strict\';\s*)?', '', script)
    
    # Remove any })(); at the end (but be careful not to remove ones inside the code)
    # Find the last })(); and remove it
    last_iife_close = script.rfind('})();')
    if last_iife_close != -1:
        # Check if there's meaningful code after it
        after = script[last_iife_close + 5:].strip()
        if not after or after == '':
            script = script[:last_iife_close]
    
    # Remove all window.X = X; lines
    script = re.sub(r'\n\s*window\.\w+\s*=\s*\w+;\s*', '\n', script)
    # Remove "// Expose onclick functions to window" comments
    script = re.sub(r'\n\s*//\s*Expose onclick.*\n', '\n', script)
    
    # Find ALL onclick function names in the ENTIRE file (HTML + JS template literals)
    full_content = html_before + script
    onclick_fns = set(re.findall(r'onclick=["\'](\w+)\(', full_content))
    # Also from template literals with escaped quotes
    onclick_fns.update(re.findall(r'onclick=\\["\'](\w+)\(', full_content))
    
    # Find ALL function definitions
    func_defs = set(re.findall(r'\bfunction\s+(\w+)\s*\(', script))
    
    # Build exports
    exports = []
    for fn in sorted(onclick_fns):
        if fn in func_defs:
            exports.append(f"  window.{fn} = {fn};")
    
    # Also export any init functions
    for fn in func_defs:
        if fn.startswith('init') and f"  window.{fn} = {fn};" not in exports:
            exports.append(f"  window.{fn} = {fn};")
    
    exports_str = "\n".join(exports) if exports else "  // No exports needed"
    
    # Build clean IIFE-wrapped script
    new_script = f"""
(function() {{
'use strict';
{script.strip()}

// ---- Window Exports ----
{exports_str}
}})();
"""
    
    new_content = html_before + "<script>" + new_script + "</script>" + html_after
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"FIXED: {page} — {len(func_defs)} functions, {len(onclick_fns)} onclick refs, {len(exports)} exports")

print("\nDone!")
