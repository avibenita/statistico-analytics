/* global Office */

let selectedData = null;
let selectedDataSource = null;

// Initialize Office.js
Office.onReady((info) => {
    if (info.host === Office.HostType.Excel) {
        console.log('Univariate Analysis module loaded in Excel');
    }
});

/**
 * Navigate back to hub
 */
function goBack() {
    window.location.href = '../hub.html';
}

/**
 * Select data source option
 */
function selectDataOption(option) {
    selectedDataSource = option;
    
    // Update radio buttons
    document.querySelectorAll('.data-option').forEach(el => el.classList.remove('selected'));
    document.querySelector(`#${option}Source`).closest('.data-option').classList.add('selected');
    document.querySelector(`#${option}Source`).checked = true;
    
    // Show/hide range selector
    const rangeSelector = document.getElementById('excelRangeSelector');
    if (option === 'excel') {
        rangeSelector.classList.add('active');
    } else {
        rangeSelector.classList.remove('active');
    }
    
    // Enable run button if data source is selected
    updateRunButton();
}

/**
 * Select range from Excel
 */
async function selectRange() {
    try {
        await Excel.run(async (context) => {
            const range = context.workbook.getSelectedRange();
            range.load('address, values');
            
            await context.sync();
            
            document.getElementById('rangeInput').value = range.address;
            selectedData = range.values.flat().filter(v => v !== '' && v !== null);
            
            showMessage(`Selected ${selectedData.length} values from ${range.address}`, 'success');
            updateRunButton();
        });
    } catch (error) {
        showError('Failed to select range: ' + error.message);
    }
}

/**
 * Update run button state
 */
function updateRunButton() {
    const runButton = document.getElementById('runButton');
    const hasDataSource = selectedDataSource !== null;
    const hasData = selectedDataSource === 'excel' ? (selectedData !== null && selectedData.length > 0) : true;
    
    runButton.disabled = !(hasDataSource && hasData);
}

/**
 * Run the analysis
 */
async function runAnalysis() {
    const runButton = document.getElementById('runButton');
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('errorMessage');
    
    // Hide previous errors
    errorMsg.classList.remove('show');
    
    // Get selected options
    const options = {
        descriptiveStats: document.getElementById('descriptiveStats').checked,
        normalityTests: document.getElementById('normalityTests').checked,
        histogram: document.getElementById('histogram').checked,
        boxplot: document.getElementById('boxplot').checked,
        qqplot: document.getElementById('qqplot').checked
    };
    
    // Validate
    if (!selectedDataSource) {
        showError('Please select a data source');
        return;
    }
    
    if (selectedDataSource === 'excel' && (!selectedData || selectedData.length === 0)) {
        showError('Please select a data range from Excel');
        return;
    }
    
    // Show loading
    runButton.disabled = true;
    loading.classList.add('show');
    
    try {
        // Get data based on source
        let data = [];
        
        if (selectedDataSource === 'excel') {
            data = selectedData;
        } else if (selectedDataSource === 'manual') {
            showError('Manual entry not yet implemented');
            return;
        } else if (selectedDataSource === 'file') {
            showError('File upload not yet implemented');
            return;
        }
        
        // Validate data
        const numericData = data.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));
        
        if (numericData.length === 0) {
            showError('No valid numeric data found');
            return;
        }
        
        // Calculate statistics
        const results = calculateStatistics(numericData, options);
        
        // Open results in dialog
        openResultsDialog(results);
        
    } catch (error) {
        showError('Analysis failed: ' + error.message);
    } finally {
        runButton.disabled = false;
        loading.classList.remove('show');
    }
}

/**
 * Calculate descriptive statistics
 */
function calculateStatistics(data, options) {
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
        dataSource: selectedDataSource,
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
                showError('Failed to open results dialog: ' + asyncResult.error.message);
            } else {
                console.log('Results dialog opened successfully');
            }
        }
    );
}

/**
 * Show error message
 */
function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
    
    setTimeout(() => {
        errorMsg.classList.remove('show');
    }, 5000);
}

/**
 * Show success message
 */
function showMessage(message, type) {
    console.log(`${type}: ${message}`);
}
