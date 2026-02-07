/*
  ================================================================
  REGRESSION INPUT PANEL LOGIC
  ================================================================
  Analyzes selected range and displays column statistics:
  - Column names (from first row)
  - n numeric values
  - n missing values
  - Dependent (single) + Independent (multi) selection
  ================================================================
*/

/* global Excel, Office */

let columnData = [];
let totalRowCount = 0;
let selectedDependentIndex = null;

function onRangeDataLoaded(values, address) {
  console.log('Regression: Range data received', values.length, 'rows');
  
  if (!values || values.length < 2) {
    hideColumnPreview();
    showError('Please select a range with at least a header row and one data row');
    return;
  }
  
  analyzeColumns(values);
  displayColumnTable();
  showColumnPreview();
  updateRunButton();
}

function analyzeColumns(values) {
  columnData = [];
  
  const headers = values[0];
  const dataRows = values.slice(1);
  totalRowCount = dataRows.length;
  
  headers.forEach((header, colIndex) => {
    const columnName = header || `Column ${colIndex + 1}`;
    
    let nNumeric = 0;
    let nMissing = 0;
    
    dataRows.forEach(row => {
      const value = row[colIndex];
      
      if (value === null || value === undefined || value === '') {
        nMissing++;
      } else if (typeof value === 'number' && !isNaN(value)) {
        nNumeric++;
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        const num = parseFloat(trimmed);
        if (!isNaN(num) && trimmed !== '') {
          nNumeric++;
        }
      }
    });
    
    columnData.push({
      index: colIndex,
      name: columnName,
      nNumeric,
      nMissing,
      isNumeric: false,
      included: false
    });
  });
  
  columnData.forEach(col => {
    col.isNumeric = isColumnNumeric(col);
    col.included = col.isNumeric;
  });
  
  const firstNumeric = columnData.find(col => col.isNumeric);
  selectedDependentIndex = firstNumeric ? firstNumeric.index : null;
}

function isColumnNumeric(col) {
  const nonMissing = totalRowCount - col.nMissing;
  return nonMissing > 0 && (col.nNumeric / nonMissing) > 0.5;
}

function displayColumnTable() {
  const tbody = document.getElementById('columnTableBody');
  tbody.innerHTML = '';
  
  columnData.forEach((col) => {
    const row = document.createElement('tr');
    row.className = col.included ? '' : 'excluded';
    row.id = `col-row-${col.index}`;
    
    const depCell = document.createElement('td');
    depCell.className = 'col-radio';
    const depRadio = document.createElement('input');
    depRadio.type = 'radio';
    depRadio.name = 'dependentVar';
    depRadio.className = 'custom-radio';
    depRadio.disabled = !col.isNumeric;
    depRadio.checked = selectedDependentIndex === col.index;
    depRadio.onchange = () => setDependent(col.index);
    depCell.appendChild(depRadio);
    row.appendChild(depCell);
    
    const indepCell = document.createElement('td');
    indepCell.className = 'col-checkbox';
    const indepCheckbox = document.createElement('input');
    indepCheckbox.type = 'checkbox';
    indepCheckbox.className = 'custom-checkbox';
    indepCheckbox.checked = col.included && selectedDependentIndex !== col.index;
    indepCheckbox.disabled = !col.isNumeric || selectedDependentIndex === col.index;
    indepCheckbox.onchange = () => toggleIndependent(col.index, indepCheckbox.checked);
    indepCell.appendChild(indepCheckbox);
    row.appendChild(indepCell);
    
    const nameCell = document.createElement('td');
    nameCell.className = 'col-name';
    nameCell.textContent = col.name;
    row.appendChild(nameCell);
    
    const numericCell = document.createElement('td');
    numericCell.className = 'col-stat';
    numericCell.innerHTML = formatStatValue(col.nNumeric, totalRowCount, 'numeric');
    row.appendChild(numericCell);
    
    const missingCell = document.createElement('td');
    missingCell.className = 'col-stat';
    missingCell.innerHTML = formatStatValue(col.nMissing, totalRowCount, 'missing');
    row.appendChild(missingCell);
    
    tbody.appendChild(row);
  });
  
  updateSummaryStats();
  setTimeout(setupScrollSync, 100);
}

function formatStatValue(value, total, type) {
  if (value === 0) {
    return `<span class="stat-zero">${value}</span>`;
  }
  
  let badgeClass = '';
  if (type === 'numeric') badgeClass = 'stat-numeric';
  else if (type === 'missing') badgeClass = 'stat-missing';
  
  return `<span class="stat-badge ${badgeClass}">${value}</span>`;
}

function setDependent(index) {
  const target = columnData.find(col => col.index === index);
  if (!target || !target.isNumeric) {
    return;
  }
  
  selectedDependentIndex = index;
  displayColumnTable();
  updateRunButton();
}

function toggleIndependent(index, included) {
  const col = columnData.find(c => c.index === index);
  if (!col) return;
  
  col.included = included;
  displayColumnTable();
  updateRunButton();
}

function selectAllIndependents() {
  columnData.forEach(col => {
    if (col.isNumeric && col.index !== selectedDependentIndex) {
      col.included = true;
    }
  });
  displayColumnTable();
  updateRunButton();
}

function selectNoneIndependents() {
  columnData.forEach(col => {
    if (col.index !== selectedDependentIndex) {
      col.included = false;
    }
  });
  displayColumnTable();
  updateRunButton();
}

function selectOnlyNumeric() {
  let hasNonNumeric = false;
  columnData.forEach(col => {
    if (col.index === selectedDependentIndex) {
      col.included = false;
      return;
    }
    if (col.isNumeric) {
      col.included = true;
    } else {
      col.included = false;
      hasNonNumeric = true;
    }
  });
  
  const warning = document.getElementById('numericWarning');
  if (warning) {
    warning.style.display = hasNonNumeric ? 'flex' : 'none';
  }
  
  displayColumnTable();
  updateRunButton();
}

function updateSummaryStats() {
  const totalCols = columnData.length;
  const dependent = columnData.find(col => col.index === selectedDependentIndex);
  const indepCount = columnData.filter(col => col.included && col.index !== selectedDependentIndex).length;
  
  document.getElementById('totalColumns').textContent = totalCols;
  document.getElementById('selectedColumns').textContent = indepCount;
  document.getElementById('totalRows').textContent = totalRowCount;
  document.getElementById('dependentColumn').textContent = dependent ? dependent.name : '—';
}

function showColumnPreview() {
  const section = document.getElementById('regressionPreviewSection');
  const runContainer = document.getElementById('runButtonContainer');
  
  if (section) section.style.display = 'block';
  if (runContainer) runContainer.style.display = 'block';
}

function hideColumnPreview() {
  const section = document.getElementById('regressionPreviewSection');
  const runContainer = document.getElementById('runButtonContainer');
  
  if (section) section.style.display = 'none';
  if (runContainer) runContainer.style.display = 'none';
}

function updateRunButton() {
  const runBtn = document.getElementById('runAnalysisBtn');
  if (!runBtn) return;
  
  const hasDependent = selectedDependentIndex !== null;
  const indepCount = columnData.filter(col => col.included && col.index !== selectedDependentIndex).length;
  
  runBtn.disabled = !(hasDependent && indepCount >= 1);
}

function getSelectedModel() {
  const dependent = columnData.find(col => col.index === selectedDependentIndex);
  const independents = columnData.filter(col => col.included && col.index !== selectedDependentIndex);
  
  return {
    dependent,
    independents
  };
}

function runRegressionAnalysis() {
  const { dependent, independents } = getSelectedModel();
  
  if (!dependent || independents.length < 1) {
    showStatus('Please select one dependent and at least one independent variable.', true);
    return;
  }
  
  const rangeData = getCurrentRangeData();
  if (!rangeData || !rangeData.values || rangeData.values.length < 2) {
    showStatus('No data available. Please select a range first.', true);
    return;
  }
  
  const regressionData = prepareRegressionData(rangeData.values, dependent, independents);
  sessionStorage.setItem('regressionModelData', JSON.stringify(regressionData));
  
  showStatus(`Model ready: Y = ${dependent.name}, X = ${independents.map(x => x.name).join(', ')}`, false);
  console.log('Regression model prepared:', regressionData);
}

function prepareRegressionData(values, dependent, independents) {
  const allHeaders = values[0];
  const dataRows = values.slice(1);
  
  const selectedHeaders = [dependent.name, ...independents.map(col => col.name)];
  
  const data = dataRows.map(row => {
    const rowData = {};
    selectedHeaders.forEach((header) => {
      const colIndex = allHeaders.indexOf(header);
      if (colIndex !== -1) {
        rowData[header] = row[colIndex];
      }
    });
    return rowData;
  });
  
  return {
    data,
    headers: selectedHeaders,
    dependent: dependent.name,
    independents: independents.map(col => col.name)
  };
}

function showStatus(message, isError) {
  const status = document.getElementById('regressionStatus');
  if (!status) return;
  
  status.textContent = message;
  status.className = `status-message ${isError ? 'status-error' : 'status-success'}`;
}

function showError(message) {
  console.error(message);
  showStatus(message, true);
}

function setupScrollSync() {
  const topScroll = document.getElementById('topScroll');
  const tableContainer = document.getElementById('tableContainer');
  const topScrollContent = document.getElementById('topScrollContent');
  const table = document.querySelector('.column-table');
  
  if (!topScroll || !tableContainer || !topScrollContent || !table) {
    return;
  }
  
  topScrollContent.style.width = table.scrollWidth + 'px';
  
  topScroll.addEventListener('scroll', function() {
    tableContainer.scrollLeft = topScroll.scrollLeft;
  });
  
  tableContainer.addEventListener('scroll', function() {
    topScroll.scrollLeft = tableContainer.scrollLeft;
  });
}

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    console.log('Regression Input Panel ready');
  }
});
