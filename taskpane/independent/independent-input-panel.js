/* global Office */

let independentRangeData = null;
let independentRangeAddress = "";
let independentDialog = null;

function onRangeDataLoaded(values, address) {
  if (!values || values.length < 2) return showPanel(false);
  independentRangeData = values;
  independentRangeAddress = address || "";
  const headers = values[0] || [];
  const rows = values.slice(1);
  const r = document.getElementById("indRange");
  const n = document.getElementById("indRows");
  const c = document.getElementById("indCols");
  if (r) r.textContent = independentRangeAddress || "Selection";
  if (n) n.textContent = rows.length;
  if (c) c.textContent = headers.length;
  showPanel(true);
  updateButtonState();
}

function showPanel(show) {
  const panel = document.getElementById("indPanel");
  const btn = document.getElementById("openIndependentBuilder");
  if (panel) panel.style.display = show ? "block" : "none";
  if (btn) btn.disabled = !show;
}

function getDialogsBaseUrl() {
  const href = window.location.href;
  if (href.includes("/taskpane/")) return `${href.split("/taskpane/")[0]}/dialogs/views/`;
  return `${window.location.origin}/statistico-analytics/dialogs/views/`;
}

function openIndependentBuilder() {
  if (!independentRangeData || independentRangeData.length < 2) return;
  Office.context.ui.displayDialogAsync(
    `${getDialogsBaseUrl()}independent/independent-input.html?v=${Date.now()}`,
    { height: 90, width: 30, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) return;
      independentDialog = asyncResult.value;
      setTimeout(sendDialogData, 550);
      independentDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
        try {
          const message = JSON.parse(arg.message || "{}");
          if (message.action === "ready" || message.action === "requestData") sendDialogData();
          else if (message.action === "independentModel") {
            sessionStorage.setItem("independentModelSpec", JSON.stringify(message.data || message.payload || {}));
            independentDialog.close();
            independentDialog = null;
            updateButtonState();
            setTimeout(openIndependentResultsDialog, 380);
          } else if (message.action === "close") {
            independentDialog.close();
            independentDialog = null;
          }
        } catch (_e) {}
      });
    }
  );
}

function sendDialogData() {
  if (!independentDialog || !independentRangeData) return;
  const headers = independentRangeData[0] || [];
  const rows = independentRangeData.slice(1);
  const savedModelSpec = JSON.parse(sessionStorage.getItem("independentModelSpec") || "null");
  independentDialog.messageChild(JSON.stringify({
    type: "INDEPENDENT_DATA",
    payload: { headers, rows, address: independentRangeAddress, savedModelSpec }
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
function quantile(a, q) {
  const s = a.slice().sort((x, y) => x - y);
  if (!s.length) return NaN;
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  if (lo === hi) return s[lo];
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax));
  return sign * y;
}
function normalCdf(z) { return 0.5 * (1 + erf(z / Math.sqrt(2))); }

function computeWelch(x, y, alt) {
  const n1 = x.length, n2 = y.length;
  const m1 = mean(x), m2 = mean(y);
  const v1 = variance(x), v2 = variance(y);
  const se = Math.sqrt((v1 / n1) + (v2 / n2));
  const t = se > 0 ? (m1 - m2) / se : 0;
  const num = Math.pow((v1 / n1) + (v2 / n2), 2);
  const den = (Math.pow(v1 / n1, 2) / Math.max(1, n1 - 1)) + (Math.pow(v2 / n2, 2) / Math.max(1, n2 - 1));
  const df = den > 0 ? num / den : Math.max(1, n1 + n2 - 2);
  const z = Math.abs(t);
  let p = 2 * (1 - normalCdf(z));
  if (alt === "greater") p = 1 - normalCdf(t);
  if (alt === "less") p = normalCdf(t);
  const zcrit = 1.959964;
  return { t, df, p: Math.max(0, Math.min(1, p)), diff: m1 - m2, ciLow: (m1 - m2) - zcrit * se, ciHigh: (m1 - m2) + zcrit * se };
}

function computeMannWhitney(x, y, alt) {
  const all = [];
  x.forEach(v => all.push({ v, g: 1 }));
  y.forEach(v => all.push({ v, g: 2 }));
  all.sort((a, b) => a.v - b.v);
  let i = 0;
  while (i < all.length) {
    let j = i + 1;
    while (j < all.length && all[j].v === all[i].v) j++;
    const r = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) all[k].rank = r;
    i = j;
  }
  const r1 = all.filter(d => d.g === 1).reduce((s, d) => s + d.rank, 0);
  const n1 = x.length, n2 = y.length;
  const u1 = r1 - (n1 * (n1 + 1)) / 2;
  const mu = n1 * n2 / 2;
  const sigma = Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
  const z = sigma > 0 ? (u1 - mu) / sigma : 0;
  let p = 2 * (1 - normalCdf(Math.abs(z)));
  if (alt === "greater") p = 1 - normalCdf(z);
  if (alt === "less") p = normalCdf(z);
  return { u: u1, z, p: Math.max(0, Math.min(1, p)) };
}

function cliffsDelta(x, y) {
  let gt = 0, lt = 0;
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < y.length; j++) {
      if (x[i] > y[j]) gt++;
      else if (x[i] < y[j]) lt++;
    }
  }
  return (gt - lt) / Math.max(1, x.length * y.length);
}

function buildIndependentBundle(headers, rows, spec) {
  const mode = spec.mode || "two-column";
  let g1 = [], g2 = [];
  if (mode === "two-column") {
    const aIdx = headers.indexOf(spec.groupA || headers[0]);
    const bIdx = headers.indexOf(spec.groupB || headers[1] || headers[0]);
    rows.forEach(r => {
      const a = parseNum(r[aIdx]);
      const b = parseNum(r[bIdx]);
      if (isFinite(a)) g1.push(a);
      if (isFinite(b)) g2.push(b);
    });
  } else {
    const vIdx = headers.indexOf(spec.valueColumn || headers[0]);
    const grpIdx = headers.indexOf(spec.groupColumn || headers[1] || headers[0]);
    const lvlA = spec.levelA;
    const lvlB = spec.levelB;
    rows.forEach(r => {
      const grp = String(r[grpIdx] == null ? "" : r[grpIdx]);
      const v = parseNum(r[vIdx]);
      if (!isFinite(v)) return;
      if (grp === String(lvlA)) g1.push(v);
      else if (grp === String(lvlB)) g2.push(v);
    });
  }
  const alt = spec.hypothesis || "two-sided";
  const welch = computeWelch(g1, g2, alt);
  const mw = computeMannWhitney(g1, g2, alt);
  const n1 = g1.length, n2 = g2.length;
  const sp = Math.sqrt((((Math.max(0, n1 - 1)) * variance(g1)) + ((Math.max(0, n2 - 1)) * variance(g2))) / Math.max(1, n1 + n2 - 2));
  const d = sp > 0 ? (mean(g1) - mean(g2)) / sp : 0;
  const g = d * (1 - (3 / Math.max(1, (4 * (n1 + n2) - 9))));
  const delta = cliffsDelta(g1, g2);
  const rrb = 2 * (mw.u / Math.max(1, n1 * n2)) - 1;
  const ps = (delta + 1) / 2;
  return {
    setup: {
      mode,
      hypothesis: alt,
      confidence: Number(spec.confidence || 0.95),
      groupALabel: spec.groupALabel || "Group A",
      groupBLabel: spec.groupBLabel || "Group B"
    },
    explore: {
      n1, n2, mean1: mean(g1), mean2: mean(g2), med1: median(g1), med2: median(g2),
      sd1: sd(g1), sd2: sd(g2), iqr1: quantile(g1, 0.75) - quantile(g1, 0.25), iqr2: quantile(g2, 0.75) - quantile(g2, 0.25)
    },
    assumptions: {
      normalityA: n1 >= 8 ? "Check QQ / Shapiro in Python service" : "Sample too small",
      normalityB: n2 >= 8 ? "Check QQ / Shapiro in Python service" : "Sample too small",
      equalVariance: Math.abs((sd(g1) || 0) - (sd(g2) || 0)) < 0.25 * Math.max(sd(g1) || 1, sd(g2) || 1) ? "Likely similar" : "Likely different",
      recommendation: "Welch t-test primary; Mann-Whitney as robustness check."
    },
    results: {
      primary: "Welch t-test",
      welchT: welch.t, welchDf: welch.df, welchP: welch.p,
      meanDiff: welch.diff, ciLow: welch.ciLow, ciHigh: welch.ciHigh,
      u: mw.u, mwP: mw.p
    },
    effects: {
      hedgesG: g, cliffsDelta: delta, rankBiserial: rrb, probabilitySuperiority: ps
    },
    power: {
      note: "Python-backed power endpoint can be attached to this panel.",
      suggestedEndpoint: "POST /power/two-sample",
      placeholderPower: Math.min(0.99, Math.max(0.05, 0.5 + Math.abs(g) * 0.3))
    },
    report: {
      apaWelch: `Welch's t-test showed ${welch.p < 0.05 ? "a significant" : "no significant"} difference, t(${welch.df.toFixed(2)})=${welch.t.toFixed(2)}, p=${welch.p.toFixed(4)}.`,
      apaMW: `Mann-Whitney U indicated ${mw.p < 0.05 ? "a significant" : "no significant"} shift, U=${mw.u.toFixed(2)}, p=${mw.p.toFixed(4)}.`,
      consistency: (welch.p < 0.05) === (mw.p < 0.05) ? "Parametric and nonparametric conclusions agree." : "Tests disagree; inspect distributions and outliers."
    }
  };
}

function openIndependentResultsDialog() {
  Office.context.ui.displayDialogAsync(
    `${getDialogsBaseUrl()}independent/independent-results.html?v=${Date.now()}`,
    { height: 90, width: 70, displayInIframe: false },
    (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) return;
      independentDialog = asyncResult.value;
      independentDialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
        try {
          const message = JSON.parse(arg.message || "{}");
          if (message.action === "ready" || message.action === "HOST_EVENT") sendIndependentBundle();
          else if (message.action === "close") { independentDialog.close(); independentDialog = null; }
        } catch (_e) {}
      });
      setTimeout(sendIndependentBundle, 1100);
    }
  );
}

function sendIndependentBundle() {
  if (!independentDialog || !independentRangeData) return;
  const headers = independentRangeData[0] || [];
  const rows = independentRangeData.slice(1);
  const modelSpec = JSON.parse(sessionStorage.getItem("independentModelSpec") || "{}");
  const bundle = buildIndependentBundle(headers, rows, modelSpec);
  independentDialog.messageChild(JSON.stringify({ type: "INDEPENDENT_BUNDLE", payload: bundle }));
}

function resetIndependentModel() {
  sessionStorage.removeItem("independentModelSpec");
  updateButtonState();
}

function updateButtonState() {
  const has = !!sessionStorage.getItem("independentModelSpec");
  const openBtn = document.getElementById("openIndependentBuilder");
  const resetBtn = document.getElementById("resetIndependentModelBtn");
  if (openBtn) {
    openBtn.innerHTML = has ? '<i class="fa-solid fa-chart-column"></i> Open Results Dashboard' : '<i class="fa-solid fa-up-right-from-square"></i> Open Model Builder';
    openBtn.onclick = has ? openIndependentResultsDialog : openIndependentBuilder;
  }
  if (resetBtn) resetBtn.style.display = has ? "inline-block" : "none";
}

window.openIndependentBuilder = openIndependentBuilder;
window.openIndependentResultsDialog = openIndependentResultsDialog;
window.resetIndependentModel = resetIndependentModel;
