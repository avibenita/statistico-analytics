/*
  ================================================================
  CORRELATION INPUT PANEL LOGIC (TASKPANE)
  ================================================================
  Handles data loading and opens configuration dialog
  ================================================================
*/

/* global Office */

// Store current range data
let correlationRangeData = null;
let correlationDialog = null;

/**
 * Called when range data is loaded from DataInputPanel
 * This function is automatically triggered by the shared component
 */
function onRangeDataLoaded(values, address) {
  console.log('Correlation: Range data received', values.length, 'rows');
  
  if (!values || values.length < 2) {
    showError('Please select a range with at least a header row and one data row');
    return;
  }
  
  // Store data for the dialog
  correlationRangeData = { values, address };
  
  // Store in sessionStorage for dialog to pick up
  sessionStorage.setItem('correlationRawData', JSON.stringify({ values, address }));
  
  // Update UI
  const headers = values[0];
  const dataRows = values.slice(1);
  
  document.getElementById('corrRange').textContent = address;
  document.getElementById('corrRows').textContent = dataRows.length;
  document.getElementById('corrCols').textContent = headers.length;
  
  // Enable button
  const btn = document.getElementById('openCorrelationConfig');
  if (btn) {
    btn.disabled = false;
  }
}

/**
 * Show correlation panel
 */
function showCorrelationPanel() {
  // Panel is always visible, just for compatibility
}

/**
 * Hide correlation panel
 */
function hideCorrelationPanel() {
  // Panel is always visible, just for compatibility
}

/**
 * Show error message
 */
function showError(message) {
  console.error(message);
  // Could add visual error display here
}

/**
 * Get dialogs base URL (local or production)
 */
function getDialogsBaseUrl() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('127.0.0.1') || currentUrl.includes('localhost')) {
    return 'http://127.0.0.1:8080/dialogs/views/';
  }
  return 'https://www.statistico.live/statistico-analytics/dialogs/views/';
}

/**
 * Open correlation configuration dialog
 */
function openCorrelationConfig() {
  if (!correlationRangeData) {
    alert('No data loaded. Please select a range first.');
    return;
  }
  
  const dialogUrl = `${getDialogsBaseUrl()}correlations/correlation-config.html`;
  
  console.log('Opening correlation config dialog:', dialogUrl);
  
  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 75, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open dialog:', asyncResult.error);
        alert('Failed to open Configuration: ' + asyncResult.error.message);
      } else {
        correlationDialog = asyncResult.value;
        console.log('✅ Correlation configuration dialog opened successfully');
        
        // Handle messages from dialog
        correlationDialog.addEventHandler(
          Office.EventType.DialogMessageReceived,
          (arg) => {
            try {
              const message = JSON.parse(arg.message);
              console.log('Message from correlation dialog:', message);
              
              if (message.action === 'ready') {
                // Dialog is ready, send data
                correlationDialog.messageChild(JSON.stringify({
                  type: 'CORRELATION_DATA',
                  payload: correlationRangeData
                }));
              } else if (message.action === 'runAnalysis') {
                // Dialog wants to run analysis
                handleRunAnalysis(message.data);
              }
            } catch (e) {
              console.error('Error parsing dialog message:', e);
            }
          }
        );
        
        // Handle dialog closed
        correlationDialog.addEventHandler(
          Office.EventType.DialogEventReceived,
          (arg) => {
            console.log('Dialog event:', arg);
            correlationDialog = null;
          }
        );
      }
    }
  );
}

/**
 * Handle run analysis request from dialog
 */
function handleRunAnalysis(data) {
  console.log('Running correlation analysis with:', data);
  
  // Close the config dialog
  if (correlationDialog) {
    correlationDialog.close();
    correlationDialog = null;
  }
  
  // Prepare data for matrix dialog
  const matrixData = {
    data: data.data.values,
    headers: data.data.values[0],
    selectedVariables: data.variables,
    method: data.method || 'pearson'
  };
  
  console.log('Prepared matrix data:', matrixData);
  
  // Store for matrix dialog
  sessionStorage.setItem('correlationMatrixData', JSON.stringify(matrixData));
  
  // Open the matrix dialog
  openCorrelationResultDialog('matrix', matrixData);
}

/**
 * Open correlation result dialog
 */
function openCorrelationResultDialog(viewType, matrixData) {
  const dialogFile = 'correlation-matrix.html';
  const dialogUrl = `${getDialogsBaseUrl()}correlations/${dialogFile}`;
  
  console.log('Opening matrix dialog:', dialogUrl);
  
  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 95, width: 95, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open matrix dialog:', asyncResult.error);
        alert('Failed to open Correlation Matrix: ' + asyncResult.error.message);
      } else {
        const resultDialog = asyncResult.value;
        console.log('✅ Matrix dialog opened successfully');
        
        // Send data to matrix dialog
        resultDialog.addEventHandler(
          Office.EventType.DialogMessageReceived,
          (arg) => {
            try {
              const message = JSON.parse(arg.message);
              console.log('Message from matrix dialog:', message);
              
              if (message.action === 'ready') {
                console.log('Sending data to matrix dialog:', matrixData);
                resultDialog.messageChild(JSON.stringify({
                  type: 'CORRELATION_DATA',
                  payload: {
                    data: matrixData.data,
                    headers: matrixData.headers,
                    selectedVariables: matrixData.selectedVariables,
                    method: matrixData.method
                  }
                }));
              }
            } catch (e) {
              console.error('Error in matrix dialog communication:', e);
            }
          }
        );
      }
    }
  );
}
