#!/usr/bin/env python3
"""Final cleanup: Remove ALL window.X = X lines that appear OUTSIDE the IIFE."""
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
    original_len = len(script)
    
    # Find the closing })();
    iife_close_pos = script.rfind('})();')
    if iife_close_pos == -1:
        continue
    
    # Split: inside IIFE (before close) and outside (after close)
    inside = script[:iife_close_pos + 5]  # Include the })();
    outside = script[iife_close_pos + 5:]
    
    # Remove ALL window.X = X lines from OUTSIDE
    outside_cleaned = re.sub(r'\n\s*window\.\w+\s*=\s*\w+;\s*', '\n', outside)
    outside_cleaned = re.sub(r'\n\s*//.*\n', '\n', outside_cleaned)  # Remove comments
    
    # Rebuild
    new_script = inside + outside_cleaned
    new_content = content[:script_match.start()] + '<script>' + new_script + '</script>' + content[script_match.end():]
    
    if len(new_script) < len(script):
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"CLEANED: {page} — removed {len(script) - len(new_script)} bytes of outside code")
    else:
        print(f"OK: {page}")

print("\nDone!")
