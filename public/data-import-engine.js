// v2026-02-25
/**
 * Data Import Engine - Enterprise-Grade Parser & Validator
 * Handles CSV, XLSX, XLS, JSON, XML, VCF, TSV with ZERO data loss
 */

class DataImportEngine {
  constructor() {
    this.importId = null;
    this.originalData = [];
    this.parsedData = [];
    this.validationResults = [];
    this.importHistory = [];
    this.mappingTemplates = this.loadMappingTemplates();
    
    // Field schema for validation
    this.schema = {
      // Required fields
      name: { required: true, type: 'string', aliases: ['full name', 'client name', 'customer name', 'contact name', 'lead name'] },
      phone: { required: true, type: 'phone', aliases: ['phone number', 'mobile', 'cell', 'telephone', 'contact number', 'primary phone'] },
      
      // Optional but common fields
      email: { required: false, type: 'email', aliases: ['email address', 'e-mail', 'mail'] },
      totalDebt: { required: false, type: 'currency', aliases: ['debt amount', 'total debt', 'debt', 'amount owed', 'balance'] },
      monthlyIncome: { required: false, type: 'currency', aliases: ['monthly income', 'income', 'gross income', 'salary'] },
      stage: { required: false, type: 'string', aliases: ['pipeline stage', 'status', 'lead stage', 'current stage'] },
      creditors: { required: false, type: 'array', aliases: ['creditor list', 'lenders', 'credit cards'] },
      assignedAgent: { required: false, type: 'string', aliases: ['agent', 'assigned to', 'owner', 'representative'] },
      priority: { required: false, type: 'string', aliases: ['priority level', 'importance'] },
      address: { required: false, type: 'string', aliases: ['street address', 'mailing address', 'home address'] },
      city: { required: false, type: 'string', aliases: [] },
      state: { required: false, type: 'state', aliases: ['st', 'province'] },
      zip: { required: false, type: 'string', aliases: ['zipcode', 'zip code', 'postal code'] },
      ssn: { required: false, type: 'string', aliases: ['social security', 'social security number', 'ssn last 4'] },
      dob: { required: false, type: 'date', aliases: ['date of birth', 'birth date', 'birthday'] },
      notes: { required: false, type: 'string', aliases: ['comments', 'description', 'memo'] }
    };
    
    // US States for validation
    this.usStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ];
  }

  /**
   * Auto-detect file format from extension and content
   */
  autoDetect(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const typeMap = {
      'csv': 'csv',
      'xlsx': 'xlsx',
      'xls': 'xls',
      'json': 'json',
      'xml': 'xml',
      'vcf': 'vcf',
      'tsv': 'tsv',
      'txt': 'csv' // Assume CSV for txt
    };
    
    return typeMap[ext] || 'unknown';
  }

  /**
   * Parse CSV with robust handling of edge cases
   */
  async parseCSV(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let content = e.target.result;
          
          // Remove BOM if present
          if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
          }
          
          // Auto-detect delimiter
          const delimiter = this.detectDelimiter(content);
          
          // Parse CSV (handle quotes, embedded newlines, etc.)
          const rows = this.parseCSVContent(content, delimiter);
          
          if (rows.length === 0) {
            reject(new Error('File is empty or contains no valid data'));
            return;
          }
          
          // First row as headers (or prompt user if no headers)
          const headers = rows[0];
          const data = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = row[i] || '';
            });
            return obj;
          }).filter(row => {
            // Filter out completely empty rows
            return Object.values(row).some(val => val.trim() !== '');
          });
          
          resolve({ headers, data, totalRows: data.length });
        } catch (err) {
          reject(new Error(`CSV parsing failed: ${err.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Detect CSV delimiter (comma, semicolon, tab, pipe)
   */
  detectDelimiter(content) {
    const firstLine = content.split(/\r?\n/)[0];
    const delimiters = [',', ';', '\t', '|'];
    
    let maxCount = 0;
    let bestDelimiter = ',';
    
    delimiters.forEach(delim => {
      const count = (firstLine.match(new RegExp(`\\${delim}`, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delim;
      }
    });
    
    return bestDelimiter;
  }

  /**
   * Parse CSV content handling quotes and embedded newlines
   */
  parseCSVContent(content, delimiter = ',') {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field boundary
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        // Row boundary
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.some(f => f !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        }
        // Skip \r\n
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentField += char;
      }
    }
    
    // Push last row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f !== '')) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  }

  /**
   * Parse Excel files (XLSX/XLS) using SheetJS
   */
  async parseXLSX(file) {
    return new Promise((resolve, reject) => {
      if (typeof XLSX === 'undefined') {
        reject(new Error('SheetJS library not loaded'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Use first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }
          
          const headers = Object.keys(jsonData[0]);
          
          resolve({
            headers,
            data: jsonData,
            totalRows: jsonData.length,
            sheetName
          });
        } catch (err) {
          reject(new Error(`Excel parsing failed: ${err.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse JSON files (handle arrays, nested objects)
   */
  async parseJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          
          let data = Array.isArray(json) ? json : [json];
          
          // Flatten nested objects
          data = data.map(item => this.flattenObject(item));
          
          if (data.length === 0) {
            reject(new Error('JSON file contains no data'));
            return;
          }
          
          const headers = Object.keys(data[0]);
          
          resolve({ headers, data, totalRows: data.length });
        } catch (err) {
          reject(new Error(`JSON parsing failed: ${err.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read JSON file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Flatten nested objects for easier mapping
   */
  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else if (Array.isArray(obj[key])) {
          flattened[newKey] = obj[key].join(', ');
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  /**
   * Parse XML files
   */
  async parseXML(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');
          
          // Check for parsing errors
          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            reject(new Error('Invalid XML format'));
            return;
          }
          
          // Extract data (assume records are direct children of root)
          const root = xmlDoc.documentElement;
          const records = Array.from(root.children);
          
          const data = records.map(record => {
            const obj = {};
            Array.from(record.children).forEach(child => {
              obj[child.tagName] = child.textContent;
            });
            return obj;
          });
          
          if (data.length === 0) {
            reject(new Error('XML file contains no records'));
            return;
          }
          
          const headers = Object.keys(data[0]);
          
          resolve({ headers, data, totalRows: data.length });
        } catch (err) {
          reject(new Error(`XML parsing failed: ${err.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read XML file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Parse VCF/vCard files (contacts)
   */
  async parseVCF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const vcards = content.split('BEGIN:VCARD');
          
          const data = vcards.slice(1).map(vcard => {
            const lines = vcard.split(/\r?\n/);
            const contact = {};
            
            lines.forEach(line => {
              if (line.startsWith('FN:')) contact.name = line.substring(3).trim();
              if (line.startsWith('TEL')) contact.phone = line.split(':')[1]?.trim();
              if (line.startsWith('EMAIL')) contact.email = line.split(':')[1]?.trim();
              if (line.startsWith('ADR')) {
                const parts = line.split(':')[1]?.split(';');
                if (parts) {
                  contact.address = parts[2]?.trim();
                  contact.city = parts[3]?.trim();
                  contact.state = parts[4]?.trim();
                  contact.zip = parts[5]?.trim();
                }
              }
            });
            
            return contact;
          }).filter(c => c.name || c.phone);
          
          if (data.length === 0) {
            reject(new Error('VCF file contains no contacts'));
            return;
          }
          
          const headers = Object.keys(data[0]);
          
          resolve({ headers, data, totalRows: data.length });
        } catch (err) {
          reject(new Error(`VCF parsing failed: ${err.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read VCF file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Parse TSV (tab-separated values)
   */
  async parseTSV(file) {
    return this.parseCSV(file, { delimiter: '\t' });
  }

  /**
   * Auto-map fields using fuzzy matching
   */
  autoMapFields(headers) {
    const mapping = {};
    
    headers.forEach(header => {
      const normalized = header.toLowerCase().trim();
      
      // Try exact match first
      for (let field in this.schema) {
        if (normalized === field.toLowerCase()) {
          mapping[header] = field;
          return;
        }
        
        // Try aliases
        const aliases = this.schema[field].aliases || [];
        for (let alias of aliases) {
          if (normalized === alias.toLowerCase() || normalized.includes(alias.toLowerCase())) {
            mapping[header] = field;
            return;
          }
        }
      }
      
      // No match found - suggest custom field
      mapping[header] = null;
    });
    
    return mapping;
  }

  /**
   * Validate a single row
   */
  validateRow(row, mapping) {
    const errors = [];
    const warnings = [];
    const mappedRow = {};
    
    // Map fields
    for (let sourceField in mapping) {
      const targetField = mapping[sourceField];
      if (targetField) {
        mappedRow[targetField] = row[sourceField];
      }
    }
    
    // Validate required fields
    for (let field in this.schema) {
      const config = this.schema[field];
      
      if (config.required && !mappedRow[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate phone
    if (mappedRow.phone) {
      const validatedPhone = this.validatePhone(mappedRow.phone);
      if (validatedPhone.valid) {
        mappedRow.phone = validatedPhone.formatted;
      } else {
        errors.push(`Invalid phone number: ${mappedRow.phone}`);
      }
    }
    
    // Validate email
    if (mappedRow.email) {
      if (!this.validateEmail(mappedRow.email)) {
        errors.push(`Invalid email: ${mappedRow.email}`);
      }
    }
    
    // Validate state
    if (mappedRow.state) {
      const validatedState = this.validateState(mappedRow.state);
      if (validatedState) {
        mappedRow.state = validatedState;
      } else {
        warnings.push(`Invalid state abbreviation: ${mappedRow.state}`);
      }
    }
    
    // Validate debt amount
    if (mappedRow.totalDebt) {
      const debt = this.parseCurrency(mappedRow.totalDebt);
      if (debt === null) {
        errors.push(`Invalid debt amount: ${mappedRow.totalDebt}`);
      } else if (debt < 0) {
        errors.push(`Negative debt amount: ${debt}`);
      } else if (debt > 1000000) {
        warnings.push(`Unusually high debt amount: $${debt.toLocaleString()}`);
      }
      mappedRow.totalDebt = debt;
    }
    
    // Validate monthly income
    if (mappedRow.monthlyIncome) {
      const income = this.parseCurrency(mappedRow.monthlyIncome);
      if (income === null) {
        errors.push(`Invalid income amount: ${mappedRow.monthlyIncome}`);
      } else if (income < 0) {
        errors.push(`Negative income amount: ${income}`);
      }
      mappedRow.monthlyIncome = income;
    }
    
    // Validate date
    if (mappedRow.dob) {
      const date = this.parseDate(mappedRow.dob);
      if (date) {
        mappedRow.dob = date;
      } else {
        warnings.push(`Invalid date format: ${mappedRow.dob}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: mappedRow,
      original: row
    };
  }

  /**
   * Validate and format phone number to E.164
   */
  validatePhone(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    let formatted = '';
    
    if (digits.length === 10) {
      // US number without country code
      formatted = `+1${digits}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      // US number with country code
      formatted = `+${digits}`;
    } else if (digits.length > 10) {
      // International
      formatted = `+${digits}`;
    } else {
      return { valid: false, formatted: phone };
    }
    
    return { valid: true, formatted };
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate and normalize US state abbreviation
   */
  validateState(state) {
    const normalized = state.toUpperCase().trim();
    
    if (this.usStates.includes(normalized)) {
      return normalized;
    }
    
    // Try to match full state names (add mapping if needed)
    const stateNames = {
      'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
      'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
      'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
      'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
      'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
      'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
      'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
      'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
      'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
      'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
      'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
      'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
      'WISCONSIN': 'WI', 'WYOMING': 'WY'
    };
    
    return stateNames[normalized.toUpperCase()] || null;
  }

  /**
   * Parse currency (handle $, €, £, commas)
   */
  parseCurrency(value) {
    if (typeof value === 'number') return value;
    
    const cleaned = String(value).replace(/[$€£,\s]/g, '');
    const num = parseFloat(cleaned);
    
    return isNaN(num) ? null : num;
  }

  /**
   * Parse date (auto-detect format)
   */
  parseDate(value) {
    // Try common formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY or MM-DD-YYYY
    ];
    
    for (let format of formats) {
      const match = String(value).match(format);
      if (match) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return null;
  }

  /**
   * Find duplicates in uploaded data vs existing DB
   */
  findDuplicates(newData, existingData) {
    const duplicates = [];
    
    newData.forEach((newRow, index) => {
      existingData.forEach(existingRow => {
        // Match by phone (strongest match)
        if (newRow.phone && existingRow.phone && 
            this.normalizePhone(newRow.phone) === this.normalizePhone(existingRow.phone)) {
          duplicates.push({
            index,
            newRow,
            existingRow,
            matchType: 'phone',
            confidence: 'high'
          });
        }
        // Match by email
        else if (newRow.email && existingRow.email && 
                 newRow.email.toLowerCase() === existingRow.email.toLowerCase()) {
          duplicates.push({
            index,
            newRow,
            existingRow,
            matchType: 'email',
            confidence: 'medium'
          });
        }
        // Match by name + DOB
        else if (newRow.name && existingRow.name && newRow.dob && existingRow.dob &&
                 newRow.name.toLowerCase() === existingRow.name.toLowerCase() &&
                 newRow.dob === existingRow.dob) {
          duplicates.push({
            index,
            newRow,
            existingRow,
            matchType: 'name+dob',
            confidence: 'medium'
          });
        }
      });
    });
    
    return duplicates;
  }

  /**
   * Normalize phone for comparison
   */
  normalizePhone(phone) {
    return phone.replace(/\D/g, '');
  }

  /**
   * Import data in batches
   */
  async importBatch(rows, batchSize = 100, onProgress) {
    const results = {
      imported: 0,
      skipped: 0,
      merged: 0,
      failed: 0,
      errors: []
    };
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (let row of batch) {
        try {
          // Import logic here (would connect to actual DB)
          // For now, simulate
          await new Promise(resolve => setTimeout(resolve, 10));
          results.imported++;
        } catch (err) {
          results.failed++;
          results.errors.push({ row, error: err.message });
        }
      }
      
      // Progress callback
      if (onProgress) {
        onProgress({
          processed: Math.min(i + batchSize, rows.length),
          total: rows.length,
          percentage: Math.round((Math.min(i + batchSize, rows.length) / rows.length) * 100)
        });
      }
    }
    
    return results;
  }

  /**
   * Load mapping templates
   */
  loadMappingTemplates() {
    const saved = localStorage.getItem('importMappingTemplates');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default templates for common CRMs
    return {
      'Salesforce': {
        'First Name': 'name',
        'Phone': 'phone',
        'Email': 'email',
        'Total Debt': 'totalDebt',
        'Status': 'stage'
      },
      'HubSpot': {
        'Full Name': 'name',
        'Phone Number': 'phone',
        'Email': 'email',
        'Debt Amount': 'totalDebt',
        'Lifecycle Stage': 'stage'
      },
      'StratusBK': {
        'Client Name': 'name',
        'Contact Phone': 'phone',
        'Email Address': 'email',
        'Total Debt': 'totalDebt',
        'Case Status': 'stage'
      },
      'Generic': {}
    };
  }

  /**
   * Save mapping template
   */
  saveMappingTemplate(name, mapping) {
    this.mappingTemplates[name] = mapping;
    localStorage.setItem('importMappingTemplates', JSON.stringify(this.mappingTemplates));
  }

  /**
   * Get import history
   */
  getImportHistory() {
    const saved = localStorage.getItem('importHistory');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Save import record
   */
  saveImportRecord(record) {
    const history = this.getImportHistory();
    history.unshift(record);
    
    // Keep last 50 imports
    if (history.length > 50) {
      history.pop();
    }
    
    localStorage.setItem('importHistory', JSON.stringify(history));
  }
}

// Export for use in DataImport page
window.DataImportEngine = DataImportEngine;
