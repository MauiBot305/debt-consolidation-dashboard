#!/usr/bin/env python3
"""
Fix nested IIFE issue in all dashboard HTML files.
Removes nested IIFEs and creates ONE clean IIFE with window exports at the end.
"""

import re
import os
from pathlib import Path

def fix_iife_in_file(filepath):
    """Fix IIFE structure in a single HTML file."""
    print(f"Processing {filepath.name}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the script block
    script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if not script_match:
        print(f"  ⚠️  No script block found")
        return False
    
    script_content = script_match.group(1)
    
    # Remove the outer IIFE wrapper if it exists
    # Pattern: (function() { 'use strict'; (function() { ... })(); ... })();
    
    # Step 1: Remove opening nested IIFEs
    # Remove: (function() {\n'use strict';\n(function() {
    script_content = re.sub(
        r"^\s*\(function\(\)\s*\{\s*['\"]use strict['\"];\s*\(function\(\)\s*\{",
        "",
        script_content,
        flags=re.MULTILINE
    )
    
    # Also try without 'use strict'
    script_content = re.sub(
        r"^\s*\(function\(\)\s*\{\s*\(function\(\)\s*\{",
        "",
        script_content,
        flags=re.MULTILINE
    )
    
    # Step 2: Find all window exports (they might be scattered)
    window_exports = []
    for match in re.finditer(r'window\.(\w+)\s*=\s*\1;', script_content):
        window_exports.append(match.group(0))
    
    # Remove duplicate window exports from middle of file
    # Keep only the last occurrence
    lines = script_content.split('\n')
    cleaned_lines = []
    window_export_section_started = False
    
    for i, line in enumerate(lines):
        # Skip closing })(); that are followed by window exports
        if line.strip() == '})();' and i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if next_line.startswith('window.'):
                continue
        
        # Skip duplicate window exports in the middle
        if line.strip().startswith('window.') and '=' in line:
            # Check if this is part of the final export section
            if not window_export_section_started:
                continue
        
        # Detect start of final export section (usually has a comment)
        if '// ---- Window Exports ----' in line or '// Expose functions' in line:
            window_export_section_started = True
        
        cleaned_lines.append(line)
    
    script_content = '\n'.join(cleaned_lines)
    
    # Step 3: Remove trailing })(); closures
    script_content = re.sub(r'\s*\}\)\(\);\s*$', '', script_content, flags=re.MULTILINE)
    
    # Step 4: Build clean IIFE structure
    clean_script = "(function() {\n'use strict';\n\n"
    clean_script += script_content.strip()
    clean_script += "\n\n})();"
    
    # Step 5: Replace in original content
    new_content = content[:script_match.start()] + f"<script>\n{clean_script}\n</script>" + content[script_match.end():]
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✅ Fixed {filepath.name}")
    return True

def main():
    pages_dir = Path.home() / "Projects/debt-consolidation-dashboard/public/pages"
    
    if not pages_dir.exists():
        print(f"❌ Directory not found: {pages_dir}")
        return
    
    html_files = sorted(pages_dir.glob("*.html"))
    
    if not html_files:
        print(f"❌ No HTML files found in {pages_dir}")
        return
    
    print(f"Found {len(html_files)} HTML files to process\n")
    
    success_count = 0
    for filepath in html_files:
        if fix_iife_in_file(filepath):
            success_count += 1
    
    print(f"\n✅ Successfully processed {success_count}/{len(html_files)} files")

if __name__ == "__main__":
    main()
