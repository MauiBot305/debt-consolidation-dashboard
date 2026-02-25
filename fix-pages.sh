#!/bin/bash

# Script to wrap all page scripts in IIFEs
# Pages already fixed: AgentDashboard.html, ManagerDashboard.html

cd ~/Projects/debt-consolidation-dashboard/public/pages

echo "Fixing remaining pages..."

# Function to add IIFE wrapper to a page
fix_page() {
    local file=$1
    echo "Processing $file..."
    
    # Check if already wrapped
    if grep -q "(function()" "$file"; then
        echo "  ✓ Already wrapped"
        return
    fi
    
    # Find the line number of <script>
    local script_line=$(grep -n "<script>" "$file" | cut -d: -f1)
    
    if [ -z "$script_line" ]; then
        echo "  ⚠ No <script> tag found"
        return
    fi
    
    echo "  Adding IIFE wrapper..."
    
    # Create temporary file with IIFE opening
    awk -v line=$script_line 'NR==line+1 {print "    (function() {"} {print}' "$file" > "$file.tmp"
    
    # Add IIFE closing before </script>
    awk '
        /<\/script>/ && !done {
            print "    })();"
            done=1
        }
        {print}
    ' "$file.tmp" > "$file"
    
    rm "$file.tmp"
    echo "  ✓ Done"
}

# Fix each page
for page in OwnerDashboard.html PowerDialer.html CallHistory.html CRMLeads.html \
            DealPipeline.html CaseManagement.html Compliance.html Financial.html \
            Marketing.html Analytics.html Gamification.html AICoach.html \
            Automation.html TeamManagement.html Settings.html ClientPortal.html \
            DataImport.html; do
    fix_page "$page"
done

echo "✓ All pages processed!"
