/* global Office, Excel, initDataInputPanel, getCurrentRangeData */

/**
 * ================================================================
 * UNIVARIATE ANALYSIS MODULE
 * ================================================================
 * Uses shared Data Input Panel component
 * ================================================================
 */

// Initialize when Office is ready
Office.onReady(async (info) => {
    if (info.host === Office.HostType.Excel) {
        console.log('Univariate Analysis module loaded');
        await loadDataInputPanel();
        await initDataInputPanel();
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
 * Navigate back to hub
 */
function goBack() {
    window.location.href = '../hub.html';
}

/**
 * Handle data loading from the shared component
 * This function is called automatically by DataInputPanel.js
 */
function onRangeDataLoaded(values, address) {
    console.log('Data loaded:', { 
        rows: values.length, 
        cols: values[0]?.length || 0,
        address: address 
    });
    
    showStatus('success', `Data loaded from ${address}`);
}

/**
 * Run the univariate analysis
 */
async function runAnalysis() {
    const runButton = document.getElementById('runButton');
    const statusMsg = document.getElementById('statusMessage');
    
    // Hide previous messages
    statusMsg.classList.remove('show');
    
    // Get selected options
    const options = {
        descriptiveStats: document.getElementById('descriptiveStats').checked,
        normalityTests: document.getElementById('normalityTests').checked,
        histogram: document.getElementById('histogram').checked,
        boxplot: document.getElementById('boxplot').checked,
        qqplot: document.getElementById('qqplot').checked
    };
    
    // Get data from shared component
    const { values, address } = getCurrentRangeData();
    
    // Validate
    if (!values || values.length === 0) {
        showStatus('error', 'Please select data first using one of the three options above');
        return;
    }
    
    // Disable button
    runButton.disabled = true;
    runButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Running...</span>';
    
    try {
        // Flatten and filter numeric values
        const flatData = values.flat();
        const numericData = flatData
            .filter(v => v !== '' && v !== null && !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));
        
        if (numericData.length === 0) {
            showStatus('error', 'No valid numeric data found in the selected range');
            return;
        }
        
        // Calculate statistics
        const results = calculateStatistics(numericData, options, address);
        
        // Open results in Office Dialog
        openResultsDialog(results);
        
        showStatus('success', 'Analysis complete! Results opened in new window.');
        
    } catch (error) {
        showStatus('error', 'Analysis failed: ' + error.message);
    } finally {
        runButton.disabled = false;
        runButton.innerHTML = '<i class="fa-solid fa-play"></i><span>Run Analysis</span>';
    }
}

/**
 * Calculate descriptive statistics
 */
function calculateStatistics(data, options, address) {
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    
    // Basic stats
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    // Quartiles
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    
    // Skewness and Kurtosis
    const skewness = calculateSkewness(data, mean, stdDev);
    const kurtosis = calculateKurtosis(data, mean, stdDev);
    
    const results = {
        dataSource: address,
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
        },
        normality: options.normalityTests ? {
            shapiroWilk: 'Not computed (requires statistical library)',
            andersonDarling: 'Not computed (requires statistical library)',
            note: 'Full normality tests will be implemented in next version'
        } : null,
        options: options
    };
    
    return results;
}

/**
 * Calculate quantile
 */
function quantile(sortedData, q) {
    const pos = (sortedData.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sortedData[base + 1] !== undefined) {
        return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
    } else {
        return sortedData[base];
    }
}

/**
 * Calculate skewness
 */
function calculateSkewness(data, mean, stdDev) {
    const n = data.length;
    const m3 = data.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
    return m3 / Math.pow(stdDev, 3);
}

/**
 * Calculate kurtosis
 */
function calculateKurtosis(data, mean, stdDev) {
    const n = data.length;
    const m4 = data.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0) / n;
    return (m4 / Math.pow(stdDev, 4)) - 3;
}

/**
 * Open results in Office Dialog
 */
function openResultsDialog(results) {
    const dialogUrl = `https://www.statistico.live/statistico-analytics/dialogs/univariate-results.html?data=${encodeURIComponent(JSON.stringify(results))}`;
    
    Office.context.ui.displayDialogAsync(
        dialogUrl,
        { height: 80, width: 60, displayInIframe: false },
        (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                showStatus('error', 'Failed to open results dialog: ' + asyncResult.error.message);
            } else {
                console.log('Results dialog opened successfully');
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
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusMsg.classList.remove('show');
    }, 5000);
}

/**
 * Alternative: Use showError function if called from shared component
 */
function showError(message) {
    showStatus('error', message);
}
