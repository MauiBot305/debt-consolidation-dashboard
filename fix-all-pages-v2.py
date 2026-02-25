#!/usr/bin/env python3
"""
Fix all page HTML files by wrapping scripts in IIFEs and exposing onclick functions
"""

import os
import re
from pathlib import Path

# Define the onclick functions for each page that need to be exposed
ONCLICK_FUNCTIONS = {
    'AICoach.html': ['switchTab', 'sendChatMessage'],
    'Analytics.html': ['setDateRange', 'exportDashboard', 'sortLeaderboard'],
    'Automation.html': ['openCreateModal', 'closeCreateModal', 'createAutomation', 'useTemplate', 'toggleAutomation', 'testAutomation', 'deleteAutomation'],
    'CRMLeads.html': ['importCSV', 'exportCSV', 'openAddLeadModal', 'bulkAssign', 'bulkChangeStatus', 'bulkExport', 'bulkDelete', 'previousPage', 'nextPage', 'goToPage', 'closeAddLeadModal', 'addLead', 'showLeadDetail', 'closeDetailPanel'],
    'CallHistory.html': ['exportCalls', 'sortTable', 'prevPage', 'nextPage', 'closeDetailPanel', 'showCallDetail'],
    'CaseManagement.html': ['openAddCaseModal', 'selectFilter', 'closeAddCaseModal', 'removeCreditorRow', 'addCreditorRow', 'addCase', 'showCaseDetail', 'closeCaseDetailPanel'],
    'ClientPortal.html': ['uploadDocument', 'sendMessage', 'selectClient', 'acceptOffer', 'rejectOffer'],
    'Compliance.html': ['generateReport', 'addTCPAConsent', 'addDNC', 'importDNC', 'closeLicenseModal', 'saveLicense', 'openLicenseModal', 'toggleChecklistItem', 'removeDNC'],
    'DataImport.html': ['useTemplate', 'goToStep', 'resetImport', 'uploadFile', 'validateData', 'importData'],
    'DealPipeline.html': ['openAddDealModal', 'closeAddDealModal', 'removeDealCreditorRow', 'addDealCreditorRow', 'closeDealDetailPanel', 'openDealDetailPanel', 'callDealClient', 'addDeal'],
    'Financial.html': ['resetDateFilter', 'openAddPaymentModal', 'exportCommissionReport', 'saveFeeSchedule', 'closeAddPaymentModal', 'addPayment', 'filterPayments'],
    'Gamification.html': ['closeAgentProfile', 'viewAgentProfile', 'redeemReward'],
    'Marketing.html': ['openCampaignModal', 'filterCampaigns', 'closeCampaignModal', 'createCampaign', 'toggleCampaignStatus'],
    'PowerDialer.html': ['dialDigit', 'makeCall', 'hangupCall', 'toggleMute', 'toggleHold', 'toggleRecord', 'transferCall', 'loadNextLead', 'skipLead', 'saveDisposition'],
    'Settings.html': ['switchTab', 'saveProfile', 'saveCompany', 'saveNotifications', 'saveIntegrations', 'saveSecurity', 'saveData', 'saveBilling', 'saveCompliance'],
    'TeamManagement.html': ['openAddAgentModal', 'closeAddAgentModal', 'addAgent', 'editAgent', 'removeAgent'],
}

def fix_page(filepath):
    """Fix a single page HTML file"""
    print(f"Processing {filepath.name}...")
    
    # Read the file
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already wrapped
    if re.search(r'\(function\(\)\s*\{', content):
        print(f"  ✓ Already wrapped")
        return
    
    # Find the script tag (flexible spacing)
    script_match = re.search(r'<script>\n', content)
    if not script_match:
        print(f"  ⚠ No <script> tag found")
        return
    
    # Find the closing script tag
    closing_match = re.search(r'</script>', content)
    if not closing_match:
        print(f"  ⚠ No </script> tag found")
        return
    
    # Extract script content
    script_start = script_match.end()
    script_end = closing_match.start()
    script_content = content[script_start:script_end]
    
    # Remove trailing whitespace/newlines from script content
    script_content = script_content.rstrip() + '\n'
    
    # Get onclick functions for this page
    onclick_funcs = ONCLICK_FUNCTIONS.get(filepath.name, [])
    
    # Create exposed functions code
    expose_code = '\n  // Expose functions to window for onclick handlers\n'
    for func in onclick_funcs:
        expose_code += f'  window.{func} = {func};\n'
    
    # Wrap script in IIFE
    wrapped_script = f'  (function() {{\n{script_content}{expose_code}  }})();\n'
    
    # Replace the script content
    new_content = content[:script_start] + wrapped_script + content[script_end:]
    
    # Write back
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"  ✓ Done ({len(onclick_funcs)} functions exposed)")

def main():
    pages_dir = Path.home() / 'Projects' / 'debt-consolidation-dashboard' / 'public' / 'pages'
    
    # Pages already fixed
    already_fixed = {'AgentDashboard.html', 'ManagerDashboard.html', 'OwnerDashboard.html', 'Analytics.html', 'Compliance.html'}
    
    # Process all HTML files
    for html_file in sorted(pages_dir.glob('*.html')):
        if html_file.name not in already_fixed:
            try:
                fix_page(html_file)
            except Exception as e:
                print(f"  ✗ Error: {e}")
                import traceback
                traceback.print_exc()
    
    print("\n✓ All pages processed!")

if __name__ == '__main__':
    main()
