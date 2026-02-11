/* global Office */

let logisticRangeData = null;
let logisticRangeAddress = "";
let logisticDialog = null;

function onRangeDataLoaded(values, address) {
  if (!values || values.length < 2) {
    showLogisticPanel(false);
    return;
  }

  logisticRangeData = values;
  logisticRangeAddress = address || "";

  const headers = values[0] || [];
  const dataRows = values.slice(1);

  const rangeEl = document.getElementById("logRange");
  const rowsEl = document.getElementById("logRows");
  const colsEl = document.getElementById("logCols");
  if (rangeEl) rangeEl.textContent = logisticRangeAddress || "Selection";
  if (rowsEl) rowsEl.textContent = dataRows.length;
  if (colsEl) colsEl.textContent = headers.length;

  showLogisticPanel(true);
  updateButtonState();
}

function showLogisticPanel(show) {
  const panel = document.getElementById("logisticPanel");
  const btn = document.getElementById("openLogisticModelBuilder");
  if (panel) panel.style.display = show ? "block" : "none";
  if (btn) btn.disabled = !show;
}

function getDialogsBaseUrl() {
  const href = window.location.href;
  if (href.includes("/taskpane/")) {
    return `${href.split("/taskpane/")[0]}/dialogs/views/`;
  }
  return `${window.location.origin}/statistico-analytics/dialogs/views/`;
}

function openLogisticModelBuilder() {
  if (!logisticRangeData || logisticRangeData.length < 2) return;

  const dialogUrl = `${getDialogsBaseUrl()}logistic/logistic-input.html`;

  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 30, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error("Failed to open model builder:", asyncResult.error);
      } else {
        logisticDialog = asyncResult.value;

        setTimeout(() => sendDialogData(), 600);

        logisticDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
          try {
            const message = JSON.parse(arg.message);
            if (message.action === "ready" || message.action === "requestData") {
              sendDialogData();
            } else if (message.action === "logisticModel" || message.action === "regressionModel") {
              // Reuse existing model builder output and store under logistic spec key.
              const modelSpec = message.payload || message.data || {};
              modelSpec.analysisMode = "logistic";
              sessionStorage.setItem("logisticModelSpec", JSON.stringify(modelSpec));
              logisticDialog.close();
              logisticDialog = null;
              updateButtonState();
              setTimeout(() => openLogisticResultsDialog(), 450);
            } else if (message.action === "close") {
              logisticDialog.close();
              logisticDialog = null;
            }
          } catch (e) {
            console.error("Error handling logistic model builder message:", e);
          }
        });

        logisticDialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          logisticDialog = null;
        });
      }
    }
  );
}

function sendDialogData() {
  if (!logisticDialog || !logisticRangeData) return;
  const headers = logisticRangeData[0] || [];
  const rows = logisticRangeData.slice(1);
  const savedModelSpec = sessionStorage.getItem("logisticModelSpec");
  const modelSpec = savedModelSpec ? JSON.parse(savedModelSpec) : null;

  logisticDialog.messageChild(JSON.stringify({
    type: "LOGISTIC_DATA",
    payload: {
      headers,
      rows,
      address: logisticRangeAddress,
      analysisMode: "logistic",
      savedModelSpec: modelSpec
    }
  }));
}

function openLogisticResultsDialog() {
  const dialogUrl = `${getDialogsBaseUrl()}logistic/logistic-results.html`;

  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 90, width: 70, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error("Failed to open logistic dialog:", asyncResult.error);
      } else {
        logisticDialog = asyncResult.value;

        logisticDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
          try {
            const message = JSON.parse(arg.message);
            if (message.action === "ready") {
              sendLogisticBundle();
            } else if (message.action === "HOST_EVENT") {
              // Hook point for backend/host events if needed.
              console.log("Logistic host event:", message.cmd, message.data);
            } else if (message.action === "close") {
              logisticDialog.close();
              logisticDialog = null;
            }
          } catch (e) {
            console.error("Error handling logistic dialog message:", e);
          }
        });

        logisticDialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          logisticDialog = null;
        });

        // Fallback if ready signal is missed.
        setTimeout(() => sendLogisticBundle(), 1100);
      }
    }
  );
}

function sendLogisticBundle() {
  if (!logisticDialog || !logisticRangeData) return;

  const headers = logisticRangeData[0] || [];
  const rows = logisticRangeData.slice(1);
  const modelSpec = JSON.parse(sessionStorage.getItem("logisticModelSpec") || "{}");
  const yName = modelSpec.y || headers[0] || "Y";
  const yIdx = headers.indexOf(yName);
  const validIdx = yIdx >= 0 ? yIdx : 0;
  const yVals = rows.map(r => r[validIdx]);

  const eventCount = yVals.filter(v => String(v) === "1").length;
  const nonEventCount = Math.max(yVals.length - eventCount, 0);
  const predictors = [...(modelSpec.xn || []), ...(modelSpec.xc || [])];

  logisticDialog.messageChild(JSON.stringify({
    type: "LOGISTIC_BUNDLE",
    payload: {
      results: {
        observations: yVals.length,
        events: eventCount,
        nonEvents: nonEventCount,
        predictors: predictors.length,
        includeIntercept: modelSpec.intercept !== false,
        link: "Logit"
      },
      coefficients: predictors.map(name => ({
        Variable: name,
        Beta: "—",
        SE: "—",
        WaldZ: "—",
        PValue: "—",
        OR: "—",
        OR_CI_Lower: "—",
        OR_CI_Upper: "—",
        Reference: "—"
      })),
      descriptives: {
        separationRisk: "Pending compute",
        sparseCells: "Pending compute",
        missingPattern: "Pending compute",
        rows: []
      }
    }
  }));
}

function resetLogisticModel() {
  sessionStorage.removeItem("logisticModelSpec");
  updateButtonState();
}

function updateButtonState() {
  const hasModel = !!sessionStorage.getItem("logisticModelSpec");
  const openBtn = document.getElementById("openLogisticModelBuilder");
  const resetBtn = document.getElementById("resetLogisticModelBtn");
  if (openBtn) {
    const icon = '<i class="fa-solid fa-up-right-from-square"></i>';
    openBtn.innerHTML = hasModel ? `${icon} Edit Model & Open Results` : `${icon} Open Model Builder`;
  }
  if (resetBtn) resetBtn.style.display = hasModel ? "inline-block" : "none";
}

window.openLogisticModelBuilder = openLogisticModelBuilder;
window.openLogisticResultsDialog = openLogisticResultsDialog;
window.resetLogisticModel = resetLogisticModel;
