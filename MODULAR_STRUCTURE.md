# Modular Structure - Univariate Analysis Results

## 📁 New Architecture

```
statistico-analytics/
├─ dialogs/
│  ├─ shared/              # ← SHARED ACROSS ALL MODULES
│  │  ├─ css/
│  │  │  └─ results-dialog.css (✅ Created - 1237 lines)
│  │  └─ views/
│  │     ├─ histogram-view.js (Histogram + controls)
│  │     ├─ boxplot-view.js (Box plots with/without outliers)
│  │     ├─ qqplot-view.js (QQ/PP plots + distributions)
│  │     ├─ normality-view.js (Normality tests + gauge)
│  │     └─ kernel-view.js (Kernel density estimation)
│  │
│  ├─ univariate-results.html (Main shell - loads shared views)
│  ├─ regression-results.html (Future - loads shared views)
│  └─ correlation-results.html (Future - loads shared views)
│
└─ src/
   └─ ... (taskpane files)
```

## 🔄 How Modules Are Shared

### Example: Univariate Module
```html
<!-- univariate-results.html -->
<link rel="stylesheet" href="shared/css/results-dialog.css">
<script src="shared/views/histogram-view.js"></script>
<script src="shared/views/boxplot-view.js"></script>
<script src="shared/views/qqplot-view.js"></script>
<script src="shared/views/normality-view.js"></script>
<script src="shared/views/kernel-view.js"></script>
```

### Example: Regression Module (Future)
```html
<!-- regression-results.html -->
<link rel="stylesheet" href="shared/css/results-dialog.css">
<script src="shared/views/histogram-view.js"></script>  ← Same file!
<script src="shared/views/qqplot-view.js"></script>      ← Same file!
<script src="shared/views/normality-view.js"></script>   ← Same file!
<!-- Regression-specific views -->
<script src="shared/views/residual-plot-view.js"></script>
<script src="shared/views/influence-view.js"></script>
```

## 📊 View Modules

### 1. histogram-view.js
**Exports:** `displayHistogramView()`
**Uses:** `resultsData` global
**Features:**
- Binning methods (Sturges, Scott, FD, etc.)
- Range cropping sliders
- Normal curve overlay
- Decimal precision control

### 2. boxplot-view.js
**Exports:** `displayBoxPlotView()`
**Uses:** `resultsData` global
**Features:**
- Box plot with outliers
- Box plot without outliers + scatter
- IQR-based outlier detection
- Statistical labels on charts

### 3. qqplot-view.js
**Exports:** `displayQQPlotView()`
**Uses:** `resultsData`, `currentPlotType`, `currentDistribution`
**Features:**
- QQ vs PP toggle
- 5 distributions (Normal, Exponential, Uniform, LogNormal, Gamma)
- Detrended versions
- Distribution-specific calculations

### 4. normality-view.js
**Exports:** `displayNormalityView()`
**Uses:** `resultsData` global
**Features:**
- 4 normality tests (Shapiro-Wilk, Jarque-Bera, KS, Anderson-Darling)
- Normality score gauge
- Pass/Fail indicators
- Summary statistics

### 5. kernel-view.js
**Exports:** `displayKernelView()`
**Uses:** `resultsData`, `kernelChart`, `kernelData`
**Features:**
- 4 kernel types (Gaussian, Epanechnikov, Triangular, Uniform)
- Bandwidth slider (Scott's rule multiplier)
- Real-time updates
- Smooth density curve

## ✅ Benefits

1. **Reusability:** Same view in multiple modules
2. **Maintainability:** Update once, all modules benefit
3. **Size:** Each module ~200-400 lines vs 3175 total
4. **Performance:** Parallel loading, browser caching
5. **Collaboration:** Work on views independently
6. **Testing:** Test each view in isolation

## 🚀 Next Steps

1. ✅ Extract CSS to shared file
2. ⏳ Extract JavaScript views to modules
3. ⏳ Update univariate-results.html to load modules
4. ⏳ Test all views work correctly
5. ✅ Future: Use same views in regression/correlation modules
