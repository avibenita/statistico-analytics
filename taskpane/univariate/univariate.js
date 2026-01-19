/* global Office, Excel, initDataInputPanel, getCurrentRangeData */

/**
 * ================================================================
 * UNIVARIATE ANALYSIS MODULE
 * ================================================================
 * Uses shared Data Input Panel component
 * Includes variable selection, trim, transform, and live stats
 * ================================================================
 */

// Global state
let rawData = null;  // Original 2D array from Excel
let currentColumn = null;  // Currently selected column index
let currentData = [];  // Current numeric data (after column selection)
let trimMin = 0;
let trimMax = 100;
let currentTransform = 'none';

// Initialize when Office is ready
Office.onReady(async (info) => {
    if (info.host === Office.HostType.Excel) {
        console.log('Univariate Analysis module loaded');
        await loadDataInputPanel();
        await initDataInputPanel();
        initializeUI();
    }
});

/**
 * Load the shared data input panel HTML
 */
async function loadDataInputPanel() {
    try {
        const container = document.getElementById('dataInputContainer');
        const response = await fetch('../../src/shared/components/data-input-panel.html');
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        showStatus('error', 'Failed to load data input panel: ' + error.message);
    }
}

/**
 * Initialize UI event listeners
 */
function initializeUI() {
    // Variable selection
    document.getElementById('ddlVariable').addEventListener('change', onVariableChange);
    
    // Trim sliders
    document.getElementById('slMin').addEventListener('input', onTrimChange);
    document.getElementById('slMax').addEventListener('input', onTrimChange);
    
    // Transform options
    document.querySelectorAll('input[name="transform"]').forEach(radio => {
        radio.addEventListener('change', onTransformChange);
    });
    
    // Radio button visual selection
    document.querySelectorAll('.radgrid .opt').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.radgrid .opt').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

/**
 * Navigate back to hub
 */
function goBack() {
    window.location.href = '../hub.html';
}

/**
 * Handle data loading from the shared component
 */
function onRangeDataLoaded(values, address) {
    rawData = values;
    
    console.log('Data loaded:', { 
        rows: values.length, 
        cols: values[0]?.length || 0,
        address: address 
    });
    
    // Populate variable dropdown
    populateVariableDropdown(values);
    
    showStatus('success', `Data loaded from ${address}. Select a column to analyze.`);
}

/**
 * Populate the variable dropdown with column headers
 */
function populateVariableDropdown(data) {
    const dropdown = document.getElementById('ddlVariable');
    dropdown.innerHTML = '<option value="">Select Column</option>';
    
    if (!data || data.length === 0) return;
    
    const numCols = data[0].length;
    const headers = data[0];  // First row as headers
    
    for (let i = 0; i < numCols; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = headers[i] || `Column ${i + 1}`;
        dropdown.appendChild(option);
    }
}

/**
 * Handle variable selection change
 */
function onVariableChange() {
    const dropdown = document.getElementById('ddlVariable');
    const colIndex = parseInt(dropdown.value);
    
    if (isNaN(colIndex) || !rawData) {
        currentColumn = null;
        currentData = [];
        updateStats();
        return;
    }
    
    currentColumn = colIndex;
    
    // Extract column data (skip header row)
    const columnValues = rawData.slice(1).map(row => row[colIndex]);
    
    // Filter numeric values
    currentData = columnValues
        .filter(v => v !== '' && v !== null && !isNaN(parseFloat(v)))
        .map(v => parseFloat(v));
    
    if (currentData.length === 0) {
        showStatus('error', 'No valid numeric data in selected column');
        return;
    }
    
    // Enable tabs
    document.getElementById('tab-trim').classList.remove('disabled');
    document.getElementById('tab-transform').classList.remove('disabled');
    
    // Reset trim and transform
    resetTrim();
    currentTransform = 'none';
    document.querySelector('input[value="none"]').checked = true;
    document.querySelectorAll('.radgrid .opt').forEach(o => o.classList.remove('selected'));
    document.querySelector('input[value="none"]').closest('.opt').classList.add('selected');
    
    // Update stats
    updateStats();
    updateSummary();
}

/**
 * Switch tabs
 */
function switchTab(tabName) {
    // Check if tab is disabled
    if (document.getElementById(`tab-${tabName}`).classList.contains('disabled')) {
        return;
    }
    
    // Update tab buttons
    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Update panels
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`panel-${tabName}`).classList.add('active');
}

/**
 * Handle trim slider changes
 */
function onTrimChange() {
    trimMin = parseInt(document.getElementById('slMin').value);
    trimMax = parseInt(document.getElementById('slMax').value);
    
    if (currentData.length === 0) return;
    
    const sorted = [...currentData].sort((a, b) => a - b);
    const minVal = sorted[Math.floor((sorted.length - 1) * trimMin / 100)];
    const maxVal = sorted[Math.floor((sorted.length - 1) * trimMax / 100)];
    
    document.getElementById('lblMin').textContent = minVal.toFixed(2);
    document.getElementById('lblMax').textContent = maxVal.toFixed(2);
    
    updateStats();
}

/**
 * Reset trim sliders
 */
function resetTrim() {
    trimMin = 0;
    trimMax = 100;
    document.getElementById('slMin').value = 0;
    document.getElementById('slMax').value = 100;
    document.getElementById('lblMin').textContent = '—';
    document.getElementById('lblMax').textContent = '—';
    updateStats();
}

/**
 * Handle transform selection change
 */
function onTransformChange(e) {
    currentTransform = e.target.value;
    updateStats();
}

/**
 * Update basic stats display
 */
function updateStats() {
    if (currentData.length === 0) {
        document.getElementById('stat-n').textContent = '—';
        document.getElementById('stat-mean').textContent = '—';
        document.getElementById('stat-median').textContent = '—';
        document.getElementById('stat-std').textContent = '—';
        document.getElementById('stat-min').textContent = '—';
        document.getElementById('stat-max').textContent = '—';
        return;
    }
    
    // Apply trim
    const sorted = [...currentData].sort((a, b) => a - b);
    const minIdx = Math.floor((sorted.length - 1) * trimMin / 100);
    const maxIdx = Math.floor((sorted.length - 1) * trimMax / 100);
    const trimmedData = sorted.slice(minIdx, maxIdx + 1);
    
    // Calculate stats (without transform for display)
    const n = trimmedData.length;
    const sum = trimmedData.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    const variance = trimmedData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    const median = quantile(trimmedData, 0.5);
    const min = Math.min(...trimmedData);
    const max = Math.max(...trimmedData);
    
    // Update display
    document.getElementById('stat-n').textContent = n;
    document.getElementById('stat-mean').textContent = mean.toFixed(2);
    document.getElementById('stat-median').textContent = median.toFixed(2);
    document.getElementById('stat-std').textContent = stdDev.toFixed(2);
    document.getElementById('stat-min').textContent = min.toFixed(2);
    document.getElementById('stat-max').textContent = max.toFixed(2);
}

/**
 * Update dataset summary tab
 */
function updateSummary() {
    if (currentData.length === 0) return;
    
    const sorted = [...currentData].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    const summaryHTML = `
        <div style="font-size: 11px; line-height: 1.6;">
            <strong style="color: var(--accent-1);">Column selected</strong><br/>
            <span style="color: var(--text-secondary);">
                ✓ ${n} valid numeric values<br/>
                ✓ Range: ${sorted[0].toFixed(2)} to ${sorted[n-1].toFixed(2)}<br/>
                ✓ Mean: ${mean.toFixed(2)}<br/>
            </span>
        </div>
    `;
    
    document.getElementById('summaryContent').innerHTML = summaryHTML;
}

/**
 * Run the full analysis
 */
async function runAnalysis() {
    const runButton = document.getElementById('runButton');
    
    // Get data
    const { values, address } = getCurrentRangeData();
    
    // Validate
    if (!values || values.length === 0) {
        showStatus('error', 'Please select data first using one of the three options above');
        return;
    }
    
    if (currentColumn === null || currentData.length === 0) {
        showStatus('error', 'Please select a column to analyze');
        return;
    }
    
    // Disable button
    runButton.disabled = true;
    runButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Running...</span>';
    
    try {
        // Apply trim
        const sorted = [...currentData].sort((a, b) => a - b);
        const minIdx = Math.floor((sorted.length - 1) * trimMin / 100);
        const maxIdx = Math.floor((sorted.length - 1) * trimMax / 100);
        let processedData = sorted.slice(minIdx, maxIdx + 1);
        
        // Apply transform
        processedData = applyTransform(processedData, currentTransform);
        
        // Calculate statistics
        const results = calculateStatistics(processedData, address, currentTransform);
        
        // Open results in Office Dialog
        openResultsDialog(results);
        
        showStatus('success', 'Analysis complete! Results opened in new window.');
        
    } catch (error) {
        showStatus('error', 'Analysis failed: ' + error.message);
    } finally {
        runButton.disabled = false;
        runButton.innerHTML = '<i class="fa-solid fa-play"></i><span>Run Full Analysis</span>';
    }
}

/**
 * Apply transformation to data
 */
function applyTransform(data, transform) {
    switch (transform) {
        case 'ln':
            return data.map(v => Math.log(v));
        case 'log10':
            return data.map(v => Math.log10(v));
        case 'sqrt':
            return data.map(v => Math.sqrt(v));
        case 'square':
            return data.map(v => v * v);
        case 'reciprocal':
            return data.map(v => 1 / v);
        case 'z':
            const mean = data.reduce((a, b) => a + b, 0) / data.length;
            const stdDev = Math.sqrt(data.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / data.length);
            return data.map(v => (v - mean) / stdDev);
        case 'minmax':
            const min = Math.min(...data);
            const max = Math.max(...data);
            return data.map(v => (v - min) / (max - min));
        default:
            return data;
    }
}

/**
 * Calculate descriptive statistics
 */
function calculateStatistics(data, address, transform) {
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    
    const skewness = calculateSkewness(data, mean, stdDev);
    const kurtosis = calculateKurtosis(data, mean, stdDev);
    
    return {
        dataSource: address,
        column: currentColumn,
        transform: transform,
        trim: { min: trimMin, max: trimMax },
        n: n,
        descriptive: {
            mean: mean.toFixed(4),
            median: median.toFixed(4),
            stdDev: stdDev.toFixed(4),
            variance: variance.toFixed(4),
            min: min.toFixed(4),
            max: max.toFixed(4),
            range: (max - min).toFixed(4),
            q1: q1.toFixed(4),
            q3: q3.toFixed(4),
            iqr: (q3 - q1).toFixed(4),
            skewness: skewness.toFixed(4),
            kurtosis: kurtosis.toFixed(4)
        }
    };
}

function quantile(sortedData, q) {
    const pos = (sortedData.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sortedData[base + 1] !== undefined 
        ? sortedData[base] + rest * (sortedData[base + 1] - sortedData[base])
        : sortedData[base];
}

function calculateSkewness(data, mean, stdDev) {
    const n = data.length;
    const m3 = data.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
    return m3 / Math.pow(stdDev, 3);
}

function calculateKurtosis(data, mean, stdDev) {
    const n = data.length;
    const m4 = data.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0) / n;
    return (m4 / Math.pow(stdDev, 4)) - 3;
}

/**
 * Open results in Office Dialog
 */
function openResultsDialog(results) {
    // Store results in localStorage for the dialog
    localStorage.setItem('univariateResults', JSON.stringify(results));
    
    const dialogUrl = `https://www.statistico.live/statistico-analytics/dialogs/univariate-results.html`;
    
    Office.context.ui.displayDialogAsync(
        dialogUrl,
        { height: 90, width: 95, displayInIframe: false },
        (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                showStatus('error', 'Failed to open results dialog: ' + asyncResult.error.message);
            } else {
                console.log('✅ Results dialog opened successfully');
            }
        }
    );
}

/**
 * Show status message
 */
function showStatus(type, message) {
    const statusMsg = document.getElementById('statusMessage');
    statusMsg.textContent = message;
    statusMsg.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusMsg.classList.remove('show');
    }, 5000);
}

function showError(message) {
    showStatus('error', message);
}
