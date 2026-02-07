/*
  ================================================================
  REGRESSION INPUT PANEL LOGIC (TASKPANE)
  ================================================================
  Uses shared DataInputPanel for range selection.
  Opens a full-screen model builder dialog for assignment.
  ================================================================
*/

/* global Office */

let currentRangeData = null;
let currentRangeAddress = '';
let resultsDialog = null;

function onRangeDataLoaded(values, address) {
  console.log('Regression: Range data received', values.length, 'rows');

  if (!values || values.length < 2) {
    showPanel(false);
    return;
  }

  currentRangeData = values;
  currentRangeAddress = address || '';

  const headers = values[0] || [];
  const dataRows = values.slice(1);

  updateSummary(currentRangeAddress, dataRows.length, headers.length);
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
  if (!currentRangeData || currentRangeData.length < 2) {
    return;
  }

  const dialogUrl = `${getDialogsBaseUrl()}regression/regression-input.html`;

  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 95, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open dialog:', asyncResult.error);
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
              sessionStorage.setItem('regressionModelSpec', JSON.stringify(message.payload || {}));
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

function sendDialogData() {
  if (!resultsDialog || !currentRangeData) return;

  const headers = currentRangeData[0] || [];
  const rows = currentRangeData.slice(1);

  resultsDialog.messageChild(JSON.stringify({
    type: 'REGRESSION_DATA',
    payload: {
      headers,
      rows,
      address: currentRangeAddress
    }
  }));
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
