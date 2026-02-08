/*
  ================================================================
  REGRESSION INPUT PANEL LOGIC (TASKPANE)
  ================================================================
  Uses shared DataInputPanel for range selection.
  Opens a full-screen model builder dialog for assignment.
  ================================================================
*/

/* global Office */

let regressionRangeData = null;
let regressionRangeAddress = '';
let resultsDialog = null;

function onRangeDataLoaded(values, address) {
  console.log('Regression: Range data received', values.length, 'rows');

  if (!values || values.length < 2) {
    showPanel(false);
    return;
  }

  regressionRangeData = values;
  regressionRangeAddress = address || '';

  const headers = values[0] || [];
  const dataRows = values.slice(1);

  updateSummary(regressionRangeAddress, dataRows.length, headers.length);
  showPanel(true);
}

function showPanel(show) {
  const panel = document.getElementById('regressionPanel');
  if (panel) panel.style.display = show ? 'block' : 'none';
  const btn = document.getElementById('openModelBuilder');
  if (btn) btn.disabled = !show;
}

function updateSummary(address, rows, cols) {
  const rangeEl = document.getElementById('regRange');
  const rowsEl = document.getElementById('regRows');
  const colsEl = document.getElementById('regCols');
  if (rangeEl) rangeEl.textContent = address || 'Selection';
  if (rowsEl) rowsEl.textContent = rows || 0;
  if (colsEl) colsEl.textContent = cols || 0;
}

function openModelBuilder() {
  console.log('🪟 Open Model Builder clicked');
  if (!regressionRangeData || regressionRangeData.length < 2) {
    console.warn('No range data available for model builder');
    return;
  }

  const dialogUrl = `${getDialogsBaseUrl()}regression/regression-input.html`;

  if (!Office || !Office.context || !Office.context.ui) {
    console.error('Office dialog API not available');
    alert('Dialog API not available. Please reopen the add-in.');
    return;
  }

  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 30, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open dialog:', asyncResult.error);
        alert(`Failed to open dialog: ${asyncResult.error.message || asyncResult.error}`);
      } else {
        resultsDialog = asyncResult.value;
        console.log('✅ Regression dialog opened');

        setTimeout(() => {
          sendDialogData();
        }, 600);

        resultsDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
          try {
            const message = JSON.parse(arg.message);

            if (message.action === 'ready' || message.action === 'requestData') {
              sendDialogData();
            } else if (message.action === 'regressionModel') {
              const modelSpec = message.payload || message.data || {};
              console.log('📊 Received model spec:', modelSpec);
              sessionStorage.setItem('regressionModelSpec', JSON.stringify(modelSpec));
              // Close the model builder dialog
              resultsDialog.close();
              resultsDialog = null;
              // Wait for dialog to fully close before opening the next one
              // Office.js doesn't allow multiple dialogs open simultaneously
              setTimeout(() => {
                openRegressionCoefficientsDialog();
              }, 500);
            } else if (message.action === 'close') {
              resultsDialog.close();
              resultsDialog = null;
            }
          } catch (e) {
            console.error('Error handling dialog message:', e);
          }
        });

        resultsDialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          resultsDialog = null;
        });
      }
    }
  );
}

function openRegressionCoefficientsDialog() {
  console.log('🪟 Opening Regression Coefficients dialog');
  
  const dialogUrl = `${getDialogsBaseUrl()}regression/regression-coefficients.html`;

  if (!Office || !Office.context || !Office.context.ui) {
    console.error('Office dialog API not available');
    alert('Dialog API not available. Please reopen the add-in.');
    return;
  }

  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 70, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open coefficients dialog:', asyncResult.error);
        alert(`Failed to open dialog: ${asyncResult.error.message || asyncResult.error}`);
      } else {
        resultsDialog = asyncResult.value;
        console.log('✅ Regression coefficients dialog opened');

        resultsDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
          try {
            const message = JSON.parse(arg.message);

            if (message.action === 'ready' || message.action === 'requestData') {
              console.log('📨 Dialog is ready, sending regression results');
              sendRegressionResults();
            } else if (message.action === 'close') {
              resultsDialog.close();
              resultsDialog = null;
            }
          } catch (e) {
            console.error('Error handling dialog message:', e);
          }
        });

        resultsDialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          resultsDialog = null;
        });
        
        // Also send data after a delay as fallback
        setTimeout(() => {
          console.log('⏰ Timeout reached, sending data as fallback');
          sendRegressionResults();
        }, 1200);
      }
    }
  );
}

function sendDialogData() {
  if (!resultsDialog || !regressionRangeData) return;

  const headers = regressionRangeData[0] || [];
  const rows = regressionRangeData.slice(1);

  resultsDialog.messageChild(JSON.stringify({
    type: 'REGRESSION_DATA',
    payload: {
      headers,
      rows,
      address: regressionRangeAddress
    }
  }));
}

function sendRegressionResults() {
  if (!resultsDialog) {
    console.warn('⚠️ No dialog available to send results to');
    return;
  }
  
  if (!regressionRangeData) {
    console.warn('⚠️ No regression data available to send');
    return;
  }

  const headers = regressionRangeData[0] || [];
  const rows = regressionRangeData.slice(1);
  const modelSpec = JSON.parse(sessionStorage.getItem('regressionModelSpec') || '{}');

  console.log('📤 Sending regression results to dialog:', {
    headers: headers.length,
    rows: rows.length,
    modelSpec
  });

  resultsDialog.messageChild(JSON.stringify({
    type: 'REGRESSION_RESULTS',
    payload: {
      headers,
      rows,
      address: regressionRangeAddress,
      modelSpec
    }
  }));
  
  console.log('✅ Sent regression results to coefficients dialog');
}

function getDialogsBaseUrl() {
  const href = window.location.href;
  if (href.includes('/taskpane/')) {
    return `${href.split('/taskpane/')[0]}/dialogs/views/`;
  }
  return `${window.location.origin}/statistico-analytics/dialogs/views/`;
}

function hookUI() {
  const btn = document.getElementById('openModelBuilder');
  if (btn) {
    btn.addEventListener('click', openModelBuilder);
  }
}

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    hookUI();
  }
});

window.openModelBuilder = openModelBuilder;
