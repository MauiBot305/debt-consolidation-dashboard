#!/usr/bin/env python3
"""
Fix nested IIFE issue - simpler approach.
Extract script content, remove ALL IIFE wrappers, collect window exports, rebuild cleanly.
"""

import re
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
    
    original_script = script_match.group(1).strip()
    
    # Extract all lines
    lines = original_script.split('\n')
    
    # Track what to keep
    core_lines = []
    window_exports = set()
    
    skip_next = False
    in_nested_iife = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Skip opening IIFEs
        if stripped in ['(function() {', "(function() {'use strict';", "'use strict';"]:
            if i < 5:  # Only skip if at the beginning
                in_nested_iife += 1
                continue
        
        # Skip closing })(); that are structural (not inside code)
        if stripped == '})();':
            # Check if this is a closing IIFE (not part of actual code logic)
            if in_nested_iife > 0 or i > len(lines) - 20:  # Near end or matching opening
                in_nested_iife = max(0, in_nested_iife - 1)
                continue
        
        # Collect window exports
        if stripped.startswith('window.') and '=' in stripped:
            # Extract: window.funcName = funcName;
            match = re.match(r'window\.(\w+)\s*=\s*(\w+);', stripped)
            if match and match.group(1) == match.group(2):
                window_exports.add(stripped)
                continue
        
        # Skip comment-only lines that are just markers
        if stripped in ['// Expose functions to window for onclick handlers', '// ---- Window Exports ----']:
            continue
        
        # Keep everything else
        core_lines.append(line)
    
    # Build the clean script
    clean_script = "(function() {\n'use strict';\n\n"
    
    # Add core logic
    core_content = '\n'.join(core_lines).strip()
    clean_script += core_content
    
    # Add window exports at the end (sorted for consistency)
    if window_exports:
        clean_script += "\n\n  // Expose functions to window for onclick handlers\n"
        for export in sorted(window_exports):
            clean_script += f"  {export}\n"
    
    clean_script += "})();"
    
    # Replace in original content
    before_script = content[:script_match.start()]
    after_script = content[script_match.end():]
    
    new_content = before_script + f"<script>\n{clean_script}\n</script>" + after_script
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✅ Fixed {filepath.name} ({len(window_exports)} exports)")
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
        try:
            if fix_iife_in_file(filepath):
                success_count += 1
        except Exception as e:
            print(f"  ❌ Error processing {filepath.name}: {e}")
    
    print(f"\n✅ Successfully processed {success_count}/{len(html_files)} files")

if __name__ == "__main__":
    main()
