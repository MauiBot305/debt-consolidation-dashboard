#!/usr/bin/env python3
"""Fix double-IIFE: merge the first (exports-only) IIFE into the second (code) IIFE."""
import re, os

pages_dir = os.path.expanduser("~/Projects/debt-consolidation-dashboard/public/pages")

files_to_fix = [
    "Marketing.html", "Gamification.html", "AICoach.html", "Automation.html",
    "TeamManagement.html", "Settings.html", "ClientPortal.html", "DataImport.html",
    "CallHistory.html"  # Check this one too
]

for filename in files_to_fix:
    filepath = os.path.join(pages_dir, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find all IIFE positions
    iife_opens = [(m.start(), m.end()) for m in re.finditer(r'\(function\(\)\s*\{', content)]
    iife_closes = [(m.start(), m.end()) for m in re.finditer(r'\}\)\(\);', content)]
    
    if len(iife_opens) != 2 or len(iife_closes) != 2:
        print(f"SKIP: {filename} — has {len(iife_opens)} opens, {len(iife_closes)} closes")
        continue
    
    # Extract the first IIFE content (just window exports)
    first_iife_content = content[iife_opens[0][1]:iife_closes[0][0]].strip()
    
    # Extract window.X = X lines from first IIFE
    exports = re.findall(r'window\.\w+\s*=\s*\w+;', first_iife_content)
    
    # Remove the entire first IIFE block (from open to close, inclusive)
    first_block_start = content.rfind('\n', 0, iife_opens[0][0]) + 1
    first_block_end = iife_closes[0][1]
    # Also remove any trailing newlines
    while first_block_end < len(content) and content[first_block_end] in '\n\r':
        first_block_end += 1
    
    new_content = content[:first_block_start] + content[first_block_end:]
    
    # Now find the second IIFE's closing })(); in the new content
    last_close = new_content.rfind('})();')
    if last_close == -1:
        print(f"ERROR: {filename} — can't find closing IIFE")
        continue
    
    # Insert exports right before the closing })();
    exports_block = "\n// Window exports for onclick handlers\n" + "\n".join(exports) + "\n"
    new_content = new_content[:last_close] + exports_block + new_content[last_close:]
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"FIXED: {filename} — merged {len(exports)} exports into main IIFE")

# Also fix CRMLeads closeDetailPanel issue
crm_path = os.path.join(pages_dir, "CRMLeads.html")
with open(crm_path, 'r') as f:
    crm = f.read()

# Check if closeDetailPanel is exported
if 'window.closeDetailPanel' not in crm and 'function closeDetailPanel' in crm:
    # Add it before the last })();
    last_close = crm.rfind('})();')
    crm = crm[:last_close] + "window.closeDetailPanel = closeDetailPanel;\n" + crm[last_close:]
    with open(crm_path, 'w') as f:
        f.write(crm)
    print("FIXED: CRMLeads.html — added closeDetailPanel export")

print("\nDone!")
