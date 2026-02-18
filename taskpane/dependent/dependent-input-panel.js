/* global Office */

let dependentRangeData = null;
let dependentRangeAddress = "";
let dependentDialog = null;

function onRangeDataLoaded(values, address) {
  if (!values || values.length < 2) return showPanel(false);
  dependentRangeData = values;
  dependentRangeAddress = address || "";
  const headers = values[0] || [];
  const rows = values.slice(1);
  const r = document.getElementById("depRange");
  const n = document.getElementById("depRows");
  const c = document.getElementById("depCols");
  if (r) r.textContent = dependentRangeAddress || "Selection";
  if (n) n.textContent = rows.length;
  if (c) c.textContent = headers.length;
  showPanel(true);
  updateButtonState();
}

function showPanel(show) {
  const panel = document.getElementById("depPanel");
  const btn = document.getElementById("openDependentBuilder");
  if (panel) panel.style.display = show ? "block" : "none";
  if (btn) btn.disabled = !show;
}

function getDialogsBaseUrl() {
  const href = window.location.href;
  if (href.includes("/taskpane/")) return `${href.split("/taskpane/")[0]}/dialogs/views/`;
  return `${window.location.origin}/statistico-analytics/dialogs/views/`;
}

function openDependentBuilder() {
  console.log("=== openDependentBuilder CLICKED ===");
  console.log("dependentRangeData:", dependentRangeData);
  if (!dependentRangeData || dependentRangeData.length < 2) {
    console.log("openDependentBuilder: early exit, no data");
    return;
  }
  console.log("Opening configuration dialog...");
  Office.context.ui.displayDialogAsync(
    `${getDialogsBaseUrl()}dependent/dependent-input.html?v=${Date.now()}`,
    { height: 90, width: 30, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) return;
      dependentDialog = asyncResult.value;
      setTimeout(sendDialogData, 550);
      dependentDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
        try {
          const message = JSON.parse(arg.message || "{}");
          if (message.action === "ready" || message.action === "requestData") sendDialogData();
          else if (message.action === "dependentModel") {
            console.log("=== Received dependentModel from config dialog ===");
            console.log("message.data:", message.data);
            sessionStorage.setItem("dependentModelSpec", JSON.stringify(message.data || message.payload || {}));
            console.log("Saved to sessionStorage, closing config dialog...");
            dependentDialog.close();
            dependentDialog = null;
            updateButtonState();
            console.log("Calling openDependentResultsDialog in 380ms...");
            setTimeout(openDependentResultsDialog, 380);
          } else if (message.action === "close") {
            dependentDialog.close();
            dependentDialog = null;
          }
        } catch (_e) {}
      });
    }
  );
}

function sendDialogData() {
  if (!dependentDialog || !dependentRangeData) return;
  const headers = dependentRangeData[0] || [];
  const rows = dependentRangeData.slice(1);
  const savedModelSpec = JSON.parse(sessionStorage.getItem("dependentModelSpec") || "null");
  dependentDialog.messageChild(JSON.stringify({
    type: "DEPENDENT_DATA",
    payload: { headers, rows, address: dependentRangeAddress, savedModelSpec }
  }));
}

function parseNum(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return isFinite(n) ? n : NaN;
}

function mean(a) { return a.reduce((x, y) => x + y, 0) / Math.max(1, a.length); }
function variance(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
  return s / (a.length - 1);
}
function sd(a) { return Math.sqrt(Math.max(0, variance(a))); }
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  if (!s.length) return NaN;
  const k = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}

function computePairedT(a, b, alt) {
  // Compute paired t-test
  const diffs = [];
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    const d = a[i] - b[i];
    if (isFinite(d)) diffs.push(d);
  }
  const n = diffs.length;
  if (n < 2) return { t: NaN, df: 0, p: NaN, diff: NaN };
  const m = mean(diffs);
  const s = sd(diffs);
  const se = s / Math.sqrt(n);
  const t = se > 0 ? m / se : 0;
  const df = n - 1;
  // Simple z-approximation for p-value
  const z = Math.abs(t);
  const erf = (x) => {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * ax);
    const y = 1 - (((((1.061405429 * t + -1.453152027) * t + 1.421413741) * t + -0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax));
    return sign * y;
  };
  const normalCdf = (z) => 0.5 * (1 + erf(z / Math.sqrt(2)));
  let p = 2 * (1 - normalCdf(z));
  if (alt === "greater") p = 1 - normalCdf(t);
  if (alt === "less") p = normalCdf(t);
  return { t, df, p: Math.max(0, Math.min(1, p)), diff: m };
}

function computeWilcoxon(a, b, alt) {
  // Compute Wilcoxon signed-rank test
  const diffs = [];
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    const d = a[i] - b[i];
    if (isFinite(d) && d !== 0) diffs.push(d);
  }
  const n = diffs.length;
  if (n < 2) return { w: NaN, p: NaN };
  const ranked = diffs.map((d, i) => ({ d: Math.abs(d), sign: d > 0 ? 1 : -1, i }));
  ranked.sort((x, y) => x.d - y.d);
  let rank = 1;
  for (let i = 0; i < ranked.length; i++) {
    let j = i;
    while (j < ranked.length - 1 && ranked[j + 1].d === ranked[j].d) j++;
    const avgRank = (rank + (rank + (j - i))) / 2;
    for (let k = i; k <= j; k++) ranked[k].rank = avgRank;
    rank += (j - i + 1);
    i = j;
  }
  let wPlus = 0;
  ranked.forEach(r => { if (r.sign > 0) wPlus += r.rank; });
  const mu = n * (n + 1) / 4;
  const sigma = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24);
  const z = sigma > 0 ? (wPlus - mu) / sigma : 0;
  const erf = (x) => {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * ax);
    const y = 1 - (((((1.061405429 * t + -1.453152027) * t + 1.421413741) * t + -0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax));
    return sign * y;
  };
  const normalCdf = (z) => 0.5 * (1 + erf(z / Math.sqrt(2)));
  let p = 2 * (1 - normalCdf(Math.abs(z)));
  if (alt === "greater") p = 1 - normalCdf(z);
  if (alt === "less") p = normalCdf(z);
  return { w: wPlus, p: Math.max(0, Math.min(1, p)) };
}

function buildDependentBundle(headers, rows, spec) {
  console.log("=== buildDependentBundle START ===");
  console.log("spec:", spec);
  const compareMode = spec.compareMode || (spec.mode === "k-plus" ? "k-plus" : "two-vars");
  console.log("compareMode:", compareMode);
  const mode = compareMode === "k-plus" ? "k-plus" : "two-column";
  const primaryFramework = spec.primaryFramework || "parametric";
  
  let selectedColumns = Array.isArray(spec.selectedColumns) && spec.selectedColumns.length
    ? spec.selectedColumns.filter(name => headers.indexOf(name) >= 0)
    : headers.slice();
  console.log("selectedColumns:", selectedColumns);
  
  const selectedColumnStats = selectedColumns.map((name) => {
    const idx = headers.indexOf(name);
    const values = [];
    rows.forEach((r) => {
      const v = parseNum(r[idx]);
      if (isFinite(v)) values.push(v);
    });
    return {
      name,
      n: values.length,
      mean: values.length ? mean(values) : NaN,
      sd: values.length ? sd(values) : NaN,
      median: values.length ? median(values) : NaN
    };
  });
  
  let t1 = [], t2 = [];
  if (compareMode === "two-vars") {
    const aIdx = headers.indexOf(spec.groupA || selectedColumns[0] || headers[0]);
    const bIdx = headers.indexOf(spec.groupB || selectedColumns[1] || selectedColumns[0] || headers[1] || headers[0]);
    rows.forEach(r => {
      const a = parseNum(r[aIdx]);
      const b = parseNum(r[bIdx]);
      if (isFinite(a)) t1.push(a);
      if (isFinite(b)) t2.push(b);
    });
  }
  
  const alt = spec.hypothesis || "two-sided";
  const paired = computePairedT(t1, t2, alt);
  const wilcoxon = computeWilcoxon(t1, t2, alt);
  
  const n1 = t1.length, n2 = t2.length;
  const sp = Math.sqrt((((Math.max(0, n1 - 1)) * variance(t1)) + ((Math.max(0, n2 - 1)) * variance(t2))) / Math.max(1, n1 + n2 - 2));
  const d = sp > 0 ? (mean(t1) - mean(t2)) / sp : 0;
  const g = d * (1 - (3 / Math.max(1, (4 * (n1 + n2) - 9))));
  
  return {
    setup: {
      mode,
      compareMode,
      primaryFramework,
      hypothesis: alt,
      confidence: Number(spec.confidence || 0.95),
      selectedColumns: selectedColumns.slice(),
      groupA: spec.groupA || "",
      groupB: spec.groupB || "",
      groupALabel: spec.groupALabel || "Time 1",
      groupBLabel: spec.groupBLabel || "Time 2",
      headers: selectedColumns.slice()
    },
    explore: {
      n1, n2,
      mean1: mean(t1), mean2: mean(t2),
      med1: median(t1), med2: median(t2),
      sd1: sd(t1), sd2: sd(t2),
      selectedColumnStats
    },
    assumptions: {
      normalityA: n1 >= 8 ? "Check normality of differences" : "Sample too small",
      normalityB: n2 >= 8 ? "Check normality of differences" : "Sample too small",
      recommendation: "Paired t-test for parametric; Wilcoxon for non-parametric"
    },
    results: {
      primary: "Paired t-test",
      pairedT: paired.t,
      pairedDf: paired.df,
      pairedP: paired.p,
      meanDiff: paired.diff,
      wilcoxonW: wilcoxon.w,
      wilcoxonP: wilcoxon.p
    },
    effects: {
      hedgesG: g,
      rankBiserial: wilcoxon.w / Math.max(1, n1)
    },
    report: {
      apaPaired: `Paired t-test showed ${paired.p < 0.05 ? "a significant" : "no significant"} change, t(${paired.df})=${paired.t.toFixed(2)}, p=${paired.p.toFixed(4)}.`,
      apaWilcoxon: `Wilcoxon signed-rank test indicated ${wilcoxon.p < 0.05 ? "a significant" : "no significant"} shift, W=${wilcoxon.w.toFixed(2)}, p=${wilcoxon.p.toFixed(4)}.`
    }
  };
}

function openDependentResultsDialog() {
  const modelSpec = JSON.parse(sessionStorage.getItem("dependentModelSpec") || "{}");
  console.log("=== openDependentResultsDialog ===");
  console.log("modelSpec from sessionStorage:", modelSpec);
  const isKPlus = (modelSpec.compareMode || modelSpec.mode) === "k-plus";
  console.log("isKPlus:", isKPlus);
  const resultsPage = isKPlus ? "dependent-results-kplus.html" : "dependent-results.html";
  console.log("Opening results page:", resultsPage);
  Office.context.ui.displayDialogAsync(
    `${getDialogsBaseUrl()}dependent/${resultsPage}?v=${Date.now()}`,
    { height: 90, width: 70, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) return;
      dependentDialog = asyncResult.value;
      dependentDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
        try {
          const message = JSON.parse(arg.message || "{}");
          console.log("[Results dialog message]", message.action);
          if (message.action === "ready") sendDependentBundle();
          else if (message.action === "HOST_EVENT") {
            if (message.cmd === "dependentSettingsChanged" && message.data) {
              const current = JSON.parse(sessionStorage.getItem("dependentModelSpec") || "{}");
              const next = Object.assign({}, current, message.data);
              sessionStorage.setItem("dependentModelSpec", JSON.stringify(next));
            }
            sendDependentBundle();
          }
          else if (message.action === "close") { dependentDialog.close(); dependentDialog = null; }
        } catch (_e) { console.error("Results dialog message error:", _e); }
      });
      setTimeout(sendDependentBundle, 1100);
    }
  );
}

function sendDependentBundle() {
  console.log("=== sendDependentBundle called ===");
  if (!dependentDialog || !dependentRangeData) {
    console.log("sendDependentBundle: early exit", { dependentDialog: !!dependentDialog, dependentRangeData: !!dependentRangeData });
    return;
  }
  const headers = dependentRangeData[0] || [];
  const rows = dependentRangeData.slice(1);
  const modelSpec = JSON.parse(sessionStorage.getItem("dependentModelSpec") || "{}");
  console.log("sendDependentBundle: calling buildDependentBundle with modelSpec:", modelSpec);
  const bundle = buildDependentBundle(headers, rows, modelSpec);
  console.log("sendDependentBundle: bundle built, sending to dialog");
  dependentDialog.messageChild(JSON.stringify({ 
    type: "DEPENDENT_BUNDLE", 
    payload: bundle,
    rawData: dependentRangeData
  }));
}

function resetDependentModel() {
  sessionStorage.removeItem("dependentModelSpec");
  updateButtonState();
}

function updateButtonState() {
  const has = !!sessionStorage.getItem("dependentModelSpec");
  const openBtn = document.getElementById("openDependentBuilder");
  const resetBtn = document.getElementById("resetDependentModelBtn");
  if (openBtn) {
    openBtn.innerHTML = has
      ? '<i class="fa-solid fa-sliders"></i> Open Configuration'
      : '<i class="fa-solid fa-up-right-from-square"></i> Open Configuration';
    openBtn.onclick = openDependentBuilder;
    openBtn.disabled = !dependentRangeData || dependentRangeData.length < 2;
  }
  if (resetBtn) resetBtn.style.display = has ? "inline-block" : "none";
}

window.openDependentBuilder = openDependentBuilder;
window.openDependentResultsDialog = openDependentResultsDialog;
window.resetDependentModel = resetDependentModel;
