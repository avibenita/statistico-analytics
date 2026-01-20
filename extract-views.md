# JavaScript Extraction Plan

## Current Status
- univariate-results.html: ~3175 lines total
- Lines 1-1261: CSS (✅ EXTRACTED to shared/css/results-dialog.css)
- Lines 1262-1366: HTML structure
- Lines 1367-3175: JavaScript (⏳ TO EXTRACT)

## Extraction Map

### 1. Histogram View (lines ~1369-1840)
**Functions to extract:**
- `displayHistogramView()`
- `createHistogram(animate)`  
- `updateHistogram()`
- `updateDecimals()`
- `calculateBinsSturges/Scott/FD/Sqrt/Rice()`
- `updateBinningMethod()`
- `initializeRangeSliders()`
- `updateTruncationControls()`
- `resetRangeSliders()`
- `percentToValue()`

**Dependencies:**
- `resultsData` (global)
- `currentDecimals` (global)
- `histogramChart` (global)

### 2. Box Plot View (lines ~1842-2120)
**Functions to extract:**
- `displayBoxPlotView()`
- `calculateBoxPlotData()`
- `buildStatLabelSeries()`
- `createBoxPlotCharts()`

**Dependencies:**
- `resultsData` (global)

### 3. QQ/PP Plot View (lines ~2122-2480)
**Functions to extract:**
- `displayQQPlotView()`
- `switchPlotType()`
- `switchDistribution()`
- `createQQPPPlots()`

**Dependencies:**
- `resultsData` (global)
- `currentPlotType` (global)
- `currentDistribution` (global)

### 4. Normality Tests View (lines ~2482-2850)
**Functions to extract:**
- `displayNormalityView()`
- `calculateNormalityTests()`
- `calculateShapiroWilk()`
- `calculateJarqueBera()`
- `calculateKSTest()`
- `calculateAndersonDarling()`
- `calculateNormalityScore()`
- `createNormalityGauge()`

**Dependencies:**
- `resultsData` (global)

### 5. Kernel Density View (lines ~2852-3050)
**Functions to extract:**
- `displayKernelView()`
- `initializeKernelDensity()`
- `updateKernelChart()`
- `calculateKDE()`

**Dependencies:**
- `resultsData` (global)
- `kernelChart` (global)
- `kernelData` (global)

## Shared Functions (Keep in main HTML)
- `showView()` - View switcher
- `toggleDropdown()` - Dropdown handler
- `closeDialog()` - Dialog close handler
- `loadResults()` - Initial data loading

## Module Template

Each module should follow this pattern:

```javascript
/**
 * [View Name] - Shared Analysis View
 * Can be used by: Univariate, Regression, Correlation, etc.
 * 
 * Requirements:
 * - Global: resultsData { rawData, descriptive, column, n }
 * - Highcharts library loaded
 * - jStat library loaded (if needed)
 * 
 * Exports:
 * - display[ViewName]View()
 */

// Global variables (if needed)
let viewSpecificVar = null;

// Main display function
function display[ViewName]View() {
  // Implementation
}

// Helper functions
function helperFunction1() {
  // Implementation
}

function helperFunction2() {
  // Implementation
}
```

## Next Steps

1. ✅ Create extraction script (THIS FILE)
2. ⏳ Create each module file
3. ⏳ Update univariate-results.html
4. ⏳ Test all views
5. ⏳ Commit & deploy
