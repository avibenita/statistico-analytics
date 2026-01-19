# 🚀 Office.js Deployment Summary

**Your add-in is now configured for Office.js with Dialog API + GitHub Pages!**

---

## ✅ What Was Added

### 1. **Office.js Support**
- ✅ `manifest.xml` - Office add-in definition
- ✅ `base-analytics-office.js` - Office.js enhanced base class
- ✅ `taskpane/hub.html` - Narrow taskpane hub (320px+)
- ✅ `dialogs/results-template.html` - Full-screen results dialog

### 2. **GitHub Pages Deployment**
- ✅ `.github/workflows/deploy-gh-pages.yml` - Auto-deploy workflow
- ✅ `docs/OFFICE-JS-SETUP.md` - Complete setup guide

### 3. **Architecture**

```
Excel Add-in Architecture:
┌──────────────────────────────────────┐
│          Excel Desktop               │
│  ┌────────────────────────────────┐  │
│  │      Taskpane (320px+)         │  │
│  │  - Hub (module selection)      │  │
│  │  - Input panel                 │  │
│  │  - Configuration               │  │
│  │  - Run Analysis button         │  │
│  └────────────┬───────────────────┘  │
│               │                      │
│               │ Opens Dialog API     │
│               ▼                      │
│  ┌────────────────────────────────┐  │
│  │   Results Dialog (Full Screen) │  │
│  │  - Complete results            │  │
│  │  - Export to Excel             │  │
│  │  - Visualizations              │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

All files served from:
https://avibenita.github.io/statistico-analytics/
```

---

## 📁 New File Structure

```
statistico-analytics/
├── manifest.xml                    ← Office add-in definition
│
├── taskpane/                       ← Taskpane files (narrow width)
│   ├── hub.html                    ← Taskpane hub (module selector)
│   └── [modules]/                  ← Module taskpanes (to be created)
│       └── [module].html
│
├── dialogs/                        ← Full-screen result dialogs
│   ├── results-template.html       ← Dialog template
│   └── [module]-results.html       ← Module-specific dialogs (to be created)
│
├── src/shared/js/analytics/
│   ├── base-analytics.js           ← Original (for web)
│   └── base-analytics-office.js    ← NEW: Office.js version with Dialog API
│
├── .github/workflows/
│   ├── build-and-deploy.yml        ← CI/CD (existing)
│   └── deploy-gh-pages.yml         ← NEW: GitHub Pages deployment
│
└── docs/
    └── OFFICE-JS-SETUP.md          ← NEW: Complete setup guide
```

---

## 🎯 Next Steps (In Order)

### Step 1: Create GitHub Repository (5 min)

```bash
cd C:\OfficeAddins\statistico-analytics

# Initialize git (if not done)
git init
git add .
git commit -m "feat: Office.js add-in with Dialog API"

# Create repo on GitHub, then:
git remote add origin https://github.com/avibenita/statistico-analytics.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages (2 min)

1. Go to your GitHub repository
2. **Settings** → **Pages**
3. Source: **main** branch, **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes

Your site: `https://avibenita.github.io/statistico-analytics/`

### Step 3: Update manifest.xml (5 min)

1. Open `manifest.xml`
2. **Replace** `avibenita` with your GitHub username (3 places)
3. **Generate new GUID** for `<Id>` element:
   ```powershell
   [guid]::NewGuid()
   ```
4. **Save and push**:
   ```bash
   git add manifest.xml
   git commit -m "fix: configure manifest for GitHub Pages"
   git push
   ```

### Step 4: Create Icons (5 min)

Create simple PNG icons in `assets/` folder:
- `icon-16.png` (16x16 pixels)
- `icon-32.png` (32x32 pixels)
- `icon-64.png` (64x64 pixels)
- `icon-80.png` (80x80 pixels)

**Quick way**: Use any image, resize with Paint or online tool.

```bash
git add assets/
git commit -m "feat: add add-in icons"
git push
```

### Step 5: Sideload Add-in in Excel (10 min)

**Windows:**
1. Create network share folder
2. Copy `manifest.xml` to share
3. Excel → **Options** → **Trust Center** → **Trusted Add-in Catalogs**
4. Add share path
5. Restart Excel
6. **Insert** → **My Add-ins** → **Shared Folder**

**Mac:**
1. Copy `manifest.xml` to:
   ```
   ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef
   ```
2. Restart Excel

**Excel Online:**
1. **Insert** → **Add-ins** → **Upload My Add-in**
2. Upload `manifest.xml`

**Detailed instructions**: See `docs/OFFICE-JS-SETUP.md`

### Step 6: Test! (5 min)

1. Open Excel
2. Click **Analytics Hub** button in ribbon
3. See taskpane with module cards
4. Click a module
5. (Module pages need to be created - next step)

---

## 🛠️ Creating Your First Module

### Quick Start: Univariate Analysis

1. **Create taskpane file**:

`taskpane/univariate/univariate.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Univariate Analysis</title>
  <script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>
  <link rel="stylesheet" href="../../src/shared/css/main.css" />
  <link rel="stylesheet" href="../../src/shared/css/input-panel.css" />
</head>
<body style="padding: 16px;">
  <h2 style="color: var(--accent-1); margin-top: 0;">Univariate Analysis</h2>
  
  <div id="inputPanel"></div>
  
  <button class="btn btn-primary" id="runAnalysis" style="width: 100%; margin-top: 16px;">
    <i class="fa fa-play"></i>
    Run Analysis
  </button>
  
  <script type="module">
    import { BaseAnalyticsOffice } from '../../src/shared/js/analytics/base-analytics-office.js';
    
    class UnivariateAnalysis extends BaseAnalyticsOffice {
      constructor() {
        super('Univariate Analysis', {
          dialogUrl: 'https://avibenita.github.io/statistico-analytics/dialogs/univariate-results.html'
        });
      }
      
      validateInputs() {
        const vars = this.inputPanel.getSelectedVariables();
        return {
          valid: vars.length > 0,
          errors: vars.length === 0 ? ['Select at least 1 variable'] : []
        };
      }
      
      async performAnalysis() {
        const vars = this.inputPanel.getSelectedVariables();
        // Load data from Excel
        const excelData = await this.loadDataFromExcel();
        
        // Your analysis logic here
        return {
          variables: vars,
          data: excelData,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    Office.onReady(() => {
      const module = new UnivariateAnalysis();
      module.initialize();
      window.analysisModule = module;
    });
  </script>
</body>
</html>
```

2. **Create dialog file**:

`dialogs/univariate-results.html`:
```html
<!-- Copy from dialogs/results-template.html -->
<!-- Customize the buildMainResults() function -->
```

3. **Update hub**: Add to `taskpane/hub.html`:
```javascript
// Already there! Just uncomment or verify
navigateToModule('univariate'); // Should work
```

4. **Push to GitHub**:
```bash
git add taskpane/univariate/ dialogs/univariate-results.html
git commit -m "feat: add univariate analysis module"
git push
```

5. **Test in Excel**: Reload add-in, click Univariate Analysis

---

## 📚 Documentation

### Complete Guides

1. **Office.js Setup** (`docs/OFFICE-JS-SETUP.md`)
   - Complete step-by-step guide
   - Troubleshooting
   - Best practices

2. **Module Creation** (`docs/module-creation.md`)
   - Creating new modules
   - Existing guide still applies with Office.js modifications

3. **Development Guide** (`docs/development-guide.md`)
   - Architecture overview
   - Development workflow

### Key Differences: Web vs Office.js

| Feature | Web Version | Office.js Version |
|---------|-------------|-------------------|
| Base Class | `BaseAnalyticsModule` | `BaseAnalyticsOffice` |
| Results Display | `ResultsPopup` (modal) | Dialog API (window) |
| Data Source | sessionStorage | Excel workbook |
| Width | Any | 320px+ (taskpane) |
| Deployment | Any server | GitHub Pages (HTTPS) |

---

## 🎨 Features

### What Works Out of the Box

✅ **Office Dialog API** - Full-screen results in browser window  
✅ **Taskpane Hub** - Narrow, optimized for 320px+  
✅ **Shared Components** - All existing components work  
✅ **Data Loading** - From Excel via `loadDataFromExcel()`  
✅ **Export to Excel** - Results back to worksheet  
✅ **GitHub Pages** - Auto-deploy on push  
✅ **HTTPS** - GitHub Pages provides SSL  

### What You Need to Add

⏳ Module taskpane pages (use template)  
⏳ Module result dialogs (use template)  
⏳ Analysis logic (port from existing modules)  
⏳ Excel integration (reading/writing data)  

---

## 💡 Pro Tips

### 1. Test in Browser First
Before testing in Excel, test dialog pages directly:
```
https://avibenita.github.io/statistico-analytics/dialogs/results-template.html
```

### 2. Use Browser DevTools
- Right-click in taskpane → **Inspect**
- View console, network, errors

### 3. Quick Refresh
Changes reflect immediately after GitHub Pages updates (1-2 min).
No need to reinstall add-in!

### 4. Debug with Console Logging
```javascript
console.log('✅ Success');
console.error('❌ Error');
console.warn('⚠️ Warning');
```

### 5. Cache Issues?
- Clear browser cache: Ctrl+Shift+Delete
- Or hard reload: Ctrl+Shift+R
- Or add `?v=1` to URLs and increment

---

## 🐛 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Add-in not showing | Check manifest path, restart Excel |
| Dialog not opening | Verify URL, check browser console |
| CORS errors | Ensure all URLs use GitHub Pages domain |
| GitHub Pages not updating | Wait 2-5 minutes, clear cache |
| Excel API errors | Wrap in try/catch, check Office.js loaded |

**Full troubleshooting**: See `docs/OFFICE-JS-SETUP.md`

---

## 📞 Quick Links

- **Setup Guide**: `docs/OFFICE-JS-SETUP.md`
- **Module Creation**: `docs/module-creation.md`
- **Office.js Docs**: https://docs.microsoft.com/office/dev/add-ins/
- **Dialog API Docs**: https://docs.microsoft.com/office/dev/add-ins/develop/dialog-api-in-office-add-ins
- **GitHub Pages**: https://pages.github.com/

---

## ✅ Checklist

- [ ] GitHub repository created
- [ ] GitHub Pages enabled
- [ ] manifest.xml updated with GitHub URL
- [ ] Icons created and added
- [ ] Changes pushed to GitHub
- [ ] Add-in sideloaded in Excel
- [ ] Taskpane opens successfully
- [ ] First module created
- [ ] Dialog opens and shows results
- [ ] Export to Excel works

---

## 🎉 Success!

Your **Statistico Analytics** add-in is now configured for:

✅ **Office.js** taskpane integration  
✅ **Dialog API** for full-screen results  
✅ **GitHub Pages** automatic deployment  
✅ **Modular architecture** for easy development  

**Next**: Create your first module and test it in Excel!

---

*Updated: January 19, 2026*  
*Architecture: Office.js + Dialog API + GitHub Pages*
