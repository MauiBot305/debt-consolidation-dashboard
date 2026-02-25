#!/usr/bin/env python3
"""Fix IIFE structure: Move the closing })(); to the very end of the script, after all exports."""
import re, os, glob

pages_dir = os.path.expanduser("~/Projects/debt-consolidation-dashboard/public/pages")

for filepath in sorted(glob.glob(os.path.join(pages_dir, "*.html"))):
    page = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find the script block
    script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if not script_match:
        continue
    
    script = script_match.group(1)
    
    # Count opening and closing
    opens = script.count('(function()')
    closes = script.count('})();')
    
    if opens != 1 or closes < 1:
        continue
    
    # Remove the first/early })(); but keep the last one
    # Strategy: remove ALL })(); and add ONE at the very end
    script_no_closes = script.replace('})();', '', 1)  # Remove first occurrence
    if '})();' in script_no_closes:
        script_no_closes = script_no_closes.replace('})();', '', script_no_closes.count('})();'))
    
    # Ensure it ends with })();
    script_clean = script_no_closes.rstrip()
    if not script_clean.endswith('})();'):
        script_clean = script_clean + '\n})();\n'
    
    new_content = content[:script_match.start()] + '<script>' + script_clean + '</script>' + content[script_match.end():]
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"FIXED: {page}")

print("\nDone!")
