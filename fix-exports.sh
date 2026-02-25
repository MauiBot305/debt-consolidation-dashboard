#!/bin/bash
cd ~/Projects/debt-consolidation-dashboard/public/pages

# PowerDialer.html - fix bad exports
sed -i '' 's/window\.hangupCall = hangupCall;/window.hangup = hangup;/' PowerDialer.html
sed -i '' 's/window\.loadNextLead = loadNextLead;//' PowerDialer.html
sed -i '' 's/window\.skipLead = skipLead;//' PowerDialer.html

# CRMLeads.html - fix bad exports  
sed -i '' 's/window\.addLead = addLead;/window.addLead = submitLead;/' CRMLeads.html
sed -i '' 's/window\.showLeadDetail = showLeadDetail;/window.showLeadDetail = viewLeadDetail;/' CRMLeads.html

# CaseManagement.html - fix bad exports
sed -i '' 's/window\.addCase = addCase;/window.addCase = openAddCaseModal;/' CaseManagement.html
sed -i '' 's/window\.showCaseDetail = showCaseDetail;/window.showCaseDetail = selectCase;/' CaseManagement.html
sed -i '' 's/window\.closeCaseDetailPanel = closeCaseDetailPanel;//' CaseManagement.html

# DealPipeline.html - fix bad exports
sed -i '' 's/window\.addDeal = addDeal;/window.addDeal = submitAddDeal;/' DealPipeline.html

# Financial.html - fix bad exports
sed -i '' 's/window\.addPayment = addPayment;/window.addPayment = submitAddPayment;/' Financial.html
sed -i '' 's/window\.filterPayments = filterPayments;//' Financial.html

# DataImport.html - fix bad exports
sed -i '' 's/window\.uploadFile = uploadFile;//' DataImport.html
sed -i '' 's/window\.validateData = validateData;//' DataImport.html
sed -i '' 's/window\.importData = importData;//' DataImport.html

# Settings.html - fix bad exports
sed -i '' 's/window\.saveIntegrations = saveIntegrations;//' Settings.html
sed -i '' 's/window\.saveSecurity = saveSecurity;//' Settings.html
sed -i '' 's/window\.saveData = saveData;//' Settings.html
sed -i '' 's/window\.saveBilling = saveBilling;//' Settings.html
sed -i '' 's/window\.saveCompliance = saveCompliance;//' Settings.html

echo "Done fixing exports"
