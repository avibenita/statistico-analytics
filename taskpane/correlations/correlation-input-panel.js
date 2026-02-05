/*
  ================================================================
  CORRELATION INPUT PANEL LOGIC
  ================================================================
  Analyzes selected range and displays column statistics:
  - Column names (from first row)
  - n numeric values
  - n categorical values  
  - n missing values
  - Checkbox for inclusion in analysis
  ================================================================
*/

/* global Excel, Office */

// Store column analysis data
let columnData = [];
let totalRowCount = 0;

/**
 * Called when range data is loaded from DataInputPanel
 * This function is automatically triggered by the shared component
 */
function onRangeDataLoaded(values, address) {
  console.log('Correlation: Range data received', values.length, 'rows');
  
  if (!values || values.length < 2) {
    hideColumnPreview();
    showError('Please select a range with at least a header row and one data row');
    return;
  }
  
  // Analyze the columns
  analyzeColumns(values);
  
  // Display the column table
  displayColumnTable();
  
  // Show the preview section
  showColumnPreview();
  
  // Update run button state
  updateRunButton();
}

/**
 * Analyze columns from the range data
 */
function analyzeColumns(values) {
  columnData = [];
  
  // First row is headers
  const headers = values[0];
  const dataRows = values.slice(1);
  totalRowCount = dataRows.length;
  
  // Analyze each column
  headers.forEach((header, colIndex) => {
    const columnName = header || `Column ${colIndex + 1}`;
    
    let nNumeric = 0;
    let nCategorical = 0;
    let nMissing = 0;
    
    dataRows.forEach(row => {
      const value = row[colIndex];
      
      // Check if missing
      if (value === null || value === undefined || value === '') {
        nMissing++;
      }
      // Check if numeric
      else if (typeof value === 'number' && !isNaN(value)) {
        nNumeric++;
      }
      // Check if can be converted to number
      else if (typeof value === 'string') {
        const trimmed = value.trim();
        const num = parseFloat(trimmed);
        if (!isNaN(num) && trimmed !== '') {
          nNumeric++;
        } else {
          nCategorical++;
        }
      }
      else {
        nCategorical++;
      }
    });
    
    columnData.push({
      index: colIndex,
      name: columnName,
      nNumeric: nNumeric,
      nCategorical: nCategorical,
      nMissing: nMissing,
      included: true  // Default: include all columns
    });
  });
  
  console.log('Column analysis complete:', columnData);
}

/**
 * Display the column table
 */
function displayColumnTable() {
  const tbody = document.getElementById('columnTableBody');
  tbody.innerHTML = '';
  
  columnData.forEach((col, index) => {
    const row = document.createElement('tr');
    row.className = col.included ? '' : 'excluded';
    row.id = `col-row-${index}`;
    
    // Checkbox cell
    const checkboxCell = document.createElement('td');
    checkboxCell.className = 'col-checkbox';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'custom-checkbox';
    checkbox.checked = col.included;
    checkbox.onchange = () => toggleColumn(index, checkbox.checked);
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);
    
    // Column name cell
    const nameCell = document.createElement('td');
    nameCell.className = 'col-name';
    nameCell.textContent = col.name;
    row.appendChild(nameCell);
    
    // Arrow cell
    const arrowCell = document.createElement('td');
    arrowCell.className = 'col-arrow';
    arrowCell.textContent = '→';
    row.appendChild(arrowCell);
    
    // n Numeric cell
    const numericCell = document.createElement('td');
    numericCell.className = 'col-stat';
    numericCell.innerHTML = formatStatValue(col.nNumeric, totalRowCount, 'numeric');
    row.appendChild(numericCell);
    
    // n Categorical cell
    const categCell = document.createElement('td');
    categCell.className = 'col-stat';
    categCell.innerHTML = formatStatValue(col.nCategorical, totalRowCount, 'categorical');
    row.appendChild(categCell);
    
    // n Missing cell
    const missingCell = document.createElement('td');
    missingCell.className = 'col-stat';
    missingCell.innerHTML = formatStatValue(col.nMissing, totalRowCount, 'missing');
    row.appendChild(missingCell);
    
    tbody.appendChild(row);
  });
  
  updateSummaryStats();
  
  // Setup scroll sync after table is rendered
  setTimeout(setupScrollSync, 100);
}

/**
 * Format stat value with optional badge
 */
function formatStatValue(value, total, type) {
  if (value === 0) {
    return `<span class="stat-zero">${value}</span>`;
  }
  
  const percentage = Math.round((value / total) * 100);
  let badgeClass = '';
  
  if (type === 'numeric') badgeClass = 'stat-numeric';
  else if (type === 'categorical') badgeClass = 'stat-categorical';
  else if (type === 'missing') badgeClass = 'stat-missing';
  
  return `<span class="stat-badge ${badgeClass}">${value}</span>`;
}

/**
 * Toggle a specific column's inclusion
 */
function toggleColumn(index, included) {
  columnData[index].included = included;
  
  // Update row appearance
  const row = document.getElementById(`col-row-${index}`);
  if (row) {
    row.className = included ? '' : 'excluded';
  }
  
  updateSummaryStats();
  updateRunButton();
}

/**
 * Toggle all columns
 */
function toggleAllColumns(checked) {
  columnData.forEach((col, index) => {
    col.included = checked;
    const checkbox = document.querySelector(`#col-row-${index} input[type="checkbox"]`);
    if (checkbox) checkbox.checked = checked;
    
    const row = document.getElementById(`col-row-${index}`);
    if (row) row.className = checked ? '' : 'excluded';
  });
  
  updateSummaryStats();
  updateRunButton();
}

/**
 * Select all columns
 */
function selectAllColumns() {
  document.getElementById('selectAllCheckbox').checked = true;
  toggleAllColumns(true);
}

/**
 * Select no columns
 */
function selectNoneColumns() {
  document.getElementById('selectAllCheckbox').checked = false;
  toggleAllColumns(false);
}

/**
 * Select only numeric columns (those with majority numeric data)
 */
function selectOnlyNumeric() {
  let hasNonNumeric = false;
  
  columnData.forEach((col, index) => {
    // Consider a column numeric if >50% of non-missing values are numeric
    const nonMissing = totalRowCount - col.nMissing;
    const isNumeric = nonMissing > 0 && (col.nNumeric / nonMissing) > 0.5;
    
    col.included = isNumeric;
    
    const checkbox = document.querySelector(`#col-row-${index} input[type="checkbox"]`);
    if (checkbox) checkbox.checked = isNumeric;
    
    const row = document.getElementById(`col-row-${index}`);
    if (row) row.className = isNumeric ? '' : 'excluded';
    
    if (!isNumeric) hasNonNumeric = true;
  });
  
  // Update select all checkbox state
  const allSelected = columnData.every(col => col.included);
  document.getElementById('selectAllCheckbox').checked = allSelected;
  
  // Show warning if non-numeric columns exist
  const warning = document.getElementById('numericWarning');
  if (warning) {
    warning.style.display = hasNonNumeric ? 'flex' : 'none';
  }
  
  updateSummaryStats();
  updateRunButton();
}

/**
 * Update summary statistics
 */
function updateSummaryStats() {
  const totalCols = columnData.length;
  const selectedCols = columnData.filter(col => col.included).length;
  
  document.getElementById('totalColumns').textContent = totalCols;
  document.getElementById('selectedColumns').textContent = selectedCols;
  document.getElementById('totalRows').textContent = totalRowCount;
}

/**
 * Show column preview section
 */
function showColumnPreview() {
  const section = document.getElementById('columnPreviewSection');
  const runContainer = document.getElementById('runButtonContainer');
  
  if (section) section.style.display = 'block';
  if (runContainer) runContainer.style.display = 'block';
}

/**
 * Hide column preview section
 */
function hideColumnPreview() {
  const section = document.getElementById('columnPreviewSection');
  const runContainer = document.getElementById('runButtonContainer');
  
  if (section) section.style.display = 'none';
  if (runContainer) runContainer.style.display = 'none';
}

/**
 * Update run button state
 */
function updateRunButton() {
  const runBtn = document.getElementById('runAnalysisBtn');
  if (!runBtn) return;
  
  const selectedCount = columnData.filter(col => col.included).length;
  
  // Need at least 2 columns for correlation
  if (selectedCount >= 2) {
    runBtn.disabled = false;
  } else {
    runBtn.disabled = true;
  }
}

/**
 * Get selected columns data for analysis
 */
function getSelectedColumnsData() {
  return columnData.filter(col => col.included);
}

// Store results dialog reference
let resultsDialog = null;
let isSwitchingDialog = false;

/**
 * Run correlation analysis
 * This function should be implemented by the main module
 */
function runCorrelationAnalysis() {
  const selectedColumns = getSelectedColumnsData();
  
  if (selectedColumns.length < 2) {
    showError('Please select at least 2 columns for correlation analysis');
    return;
  }
  
  console.log('Running correlation analysis on columns:', selectedColumns);
  
  // Get the current range data
  const rangeData = getCurrentRangeData();
  if (!rangeData || !rangeData.values || rangeData.values.length < 2) {
    showError('No data available. Please select a range first.');
    return;
  }
  
  // Prepare data for correlation analysis
  const data = prepareCorrelationData(rangeData.values, selectedColumns);
  
  // Open results dialog
  openCorrelationResults(data);
}

/**
 * Prepare data for correlation analysis
 */
function prepareCorrelationData(values, selectedColumns) {
  // Extract headers (first row)
  const allHeaders = values[0];
  const dataRows = values.slice(1);
  
  // Filter to only selected columns
  const selectedHeaders = selectedColumns.map(col => col.name);
  
  // Build data array with only selected columns
  const correlationData = dataRows.map(row => {
    const rowData = {};
    selectedHeaders.forEach((header, idx) => {
      const colIndex = allHeaders.indexOf(header);
      if (colIndex !== -1) {
        rowData[header] = row[colIndex];
      }
    });
    return rowData;
  });
  
  return {
    data: correlationData,
    headers: selectedHeaders
  };
}

/**
 * Helper function to open any correlation dialog with data
 */
function openDialogWithData(dialogUrl, correlationData) {
  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 90, displayInIframe: true },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open dialog:', asyncResult.error);
        showError('Failed to open dialog: ' + asyncResult.error.message);
      } else {
        resultsDialog = asyncResult.value;
        console.log('✅ Dialog opened successfully');
        
        // Wait for dialog to be ready, then send data
        setTimeout(() => {
          if (resultsDialog) {
            console.log('📤 Sending data to dialog...');
            resultsDialog.messageChild(JSON.stringify({
              type: 'CORRELATION_DATA',
              payload: correlationData
            }));
          }
        }, 1000);
        
        // Handle messages from dialog
        resultsDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
          try {
            const message = JSON.parse(arg.message);
            console.log('📩 Message from dialog:', message);
            
            if (message.action === 'ready') {
              // Dialog is ready, send data
              console.log('Dialog ready, sending data...');
              resultsDialog.messageChild(JSON.stringify({
                type: 'CORRELATION_DATA',
                payload: correlationData
              }));
            } else if (message.action === 'close') {
              resultsDialog.close();
              resultsDialog = null;
            } else if (message.action === 'switchView') {
              // Prevent multiple simultaneous switches
              if (isSwitchingDialog) {
                console.log('⚠️ Already switching dialogs, ignoring request');
                return;
              }
              
              isSwitchingDialog = true;
              console.log('🔄 Switching to view:', message.view);
              
              // Store the new URL before closing
              const newDialogUrl = `https://www.statistico.live/statistico-analytics/dialogs/views/${message.view}`;
              
              // Close current dialog
              if (resultsDialog) {
                resultsDialog.close();
                resultsDialog = null;
              }
              
              // Wait longer for dialog to close before opening new one (Office limitation: one dialog at a time)
              setTimeout(() => {
                openDialogWithData(newDialogUrl, correlationData);
                isSwitchingDialog = false;
              }, 1000);
            }
          } catch (e) {
            console.error('Error handling dialog message:', e);
          }
        });
        
        // Handle dialog close event
        resultsDialog.addEventHandler(Office.EventType.DialogEventReceived, (arg) => {
          console.log('Dialog event:', arg.error);
          resultsDialog = null;
          isSwitchingDialog = false; // Reset flag when dialog closes
        });
      }
    }
  );
}

/**
 * Open correlation results in Office Dialog
 */
function openCorrelationResults(correlationData) {
  const dialogUrl = 'https://www.statistico.live/statistico-analytics/dialogs/views/correlations/correlation-results.html';
  openDialogWithData(dialogUrl, correlationData);
}

/**
 * Show error message
 */
function showError(message) {
  console.error(message);
  
  // Create or update error message element
  let errorDiv = document.getElementById('correlation-error-message');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'correlation-error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px 20px;
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      color: #991b1b;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(errorDiv);
  }
  
  errorDiv.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <i class="fa-solid fa-exclamation-triangle" style="color: #ef4444; font-size: 20px; margin-top: 2px;"></i>
      <div style="flex: 1;">
        <div style="font-weight: 700; margin-bottom: 4px;">Error</div>
        <div style="font-weight: 400;">${message}</div>
      </div>
      <button onclick="document.getElementById('correlation-error-message').remove()" 
              style="background: none; border: none; color: #991b1b; cursor: pointer; font-size: 20px; padding: 0; line-height: 1;">
        ×
      </button>
    </div>
  `;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => errorDiv.remove(), 300);
    }
  }, 5000);
}

// Add CSS animation for error message
if (!document.getElementById('correlation-error-styles')) {
  const style = document.createElement('style');
  style.id = 'correlation-error-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Setup scroll synchronization between top and bottom scrollbars
 */
function setupScrollSync() {
  const topScroll = document.getElementById('topScroll');
  const tableContainer = document.getElementById('tableContainer');
  const topScrollContent = document.getElementById('topScrollContent');
  const table = document.querySelector('.column-table');
  
  if (!topScroll || !tableContainer || !topScrollContent || !table) {
    return;
  }
  
  // Set the width of the top scroll content to match the table width
  topScrollContent.style.width = table.scrollWidth + 'px';
  
  // Sync top scroll to table scroll
  topScroll.addEventListener('scroll', function() {
    tableContainer.scrollLeft = topScroll.scrollLeft;
  });
  
  // Sync table scroll to top scroll
  tableContainer.addEventListener('scroll', function() {
    topScroll.scrollLeft = tableContainer.scrollLeft;
  });
}

// Initialize when Office is ready
Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    console.log('Correlation Input Panel ready');
  }
});
