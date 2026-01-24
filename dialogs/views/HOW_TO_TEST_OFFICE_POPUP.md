# HOW TO TEST AS OFFICE.JS POPUP

## 🎯 The New Standalone Histogram

**File Location:**
```
C:\OfficeAddins\statistico-analytics\dialogs\views\histogram-standalone.html
```

This is a **complete, self-contained** histogram view that:
- ✅ Matches the EXACT content/structure of original `0HistogramPlus.html`
- ✅ Includes Office.js integration
- ✅ Works as a real Office Add-in popup
- ✅ Also works standalone in browser for testing

---

## 📋 Testing Methods

### Method 1: Browser Testing (Quick)

1. Navigate to:
   ```
   C:\OfficeAddins\statistico-analytics\dialogs\views\histogram-standalone.html
   ```

2. **Double-click** to open in browser

3. You should see:
   - ✅ Statistics tables with sample Horsepower data (n=369)
   - ✅ Interactive histogram chart
   - ✅ All controls working (bins, normal curve, range sliders)
   - ✅ EXACT layout as original histogram

4. **Test all controls:**
   - Change bins slider
   - Toggle normal curve
   - Drag range sliders
   - Change binning method
   - Change decimals
   - Click Reset button

---

### Method 2: Office.js Popup Testing (Real Integration)

#### Step 1: Update Your Main Add-in Code

In your main add-in file (e.g., `taskpane.html` or wherever you open dialogs), update the dialog URL:

```javascript
// OLD:
Office.context.ui.displayDialogAsync(
  'https://localhost:3000/dialogs/univariate-results.html',
  ...
);

// NEW:
Office.context.ui.displayDialogAsync(
  'https://localhost:3000/dialogs/views/histogram-standalone.html',
  {height: 90, width: 80, displayInIframe: false},
  function(asyncResult) {
    dialog = asyncResult.value;
    
    // Send data to dialog
    dialog.addEventHandler(Office.EventType.DialogMessageReceived, function(arg) {
      console.log('Dialog message:', arg);
    });
    
    // After dialog loads, send data
    setTimeout(() => {
      const data = {
        action: 'loadData',
        data: {
          values: yourDataArray,
          descriptive: yourStatsObject,
          column: 'YourVariableName',
          n: yourDataArray.length
        }
      };
      dialog.messageChild(JSON.stringify(data));
    }, 1000);
  }
);
```

#### Step 2: Data Format

The histogram expects this data format:

```javascript
{
  action: 'loadData',
  data: {
    values: [201.5, 185.3, 195.7, ...],  // Raw data array
    descriptive: {
      n: 369,
      mean: 201.17,
      stdDev: 60.64,
      variance: 3677.17,
      kurtosis: 1.19,
      skewness: 0.77,
      range: 404.00,
      min: 73.00,
      q1: 160.00,
      median: 200.00,
      q3: 230.00,
      max: 477.00
    },
    column: 'Horsepower',  // Variable name
    n: 369
  }
}
```

#### Step 3: Run Your Add-in

1. Start your dev server:
   ```bash
   cd C:\OfficeAddins\statistico-analytics
   npm start
   ```

2. Open Word/Excel

3. Load your add-in (Home → Add-ins → Your Add-in)

4. Trigger the histogram dialog

5. The dialog should:
   - ✅ Open in a popup window
   - ✅ Show your real data
   - ✅ Display statistics
   - ✅ Render histogram chart
   - ✅ All controls functional

---

## 🔍 Verification Checklist

### Visual Layout
- [ ] Statistics tables display correctly (2 rows, matching original)
- [ ] Histogram chart renders with data
- [ ] Controls are visible and aligned horizontally
- [ ] Range sliders work smoothly
- [ ] Color scheme matches original (dark theme, cyan/orange accents)

### Functionality
- [ ] Bins slider updates chart
- [ ] Binning method dropdown works (Manual, Sturges, Scott, FD)
- [ ] Normal curve toggle shows/hides orange curve
- [ ] Range sliders filter data
- [ ] Reset button restores full range
- [ ] Decimals dropdown reformats statistics
- [ ] "n=XX" shows filtered count

### Office.js Integration
- [ ] Dialog opens without errors
- [ ] Console shows "Office.js initialized"
- [ ] Data loads from parent window
- [ ] Variable name displays in titles
- [ ] Close button works (sends message to parent)
- [ ] Header updates with variable name

---

## 🐛 Troubleshooting

### Issue: Office.js Not Loading in Browser

**This is NORMAL!** When opening directly in browser:
- Office.js will fail to load (expected)
- Sample data will load automatically instead
- Everything else works normally

**Solution:** This is fine for quick testing. For full Office.js testing, use Method 2.

### Issue: Chart Not Showing

**Check:**
1. Browser console for errors (F12)
2. Internet connection (Highcharts loads from CDN)
3. Try hard refresh (Ctrl+F5)

### Issue: DropdownMenu Header Not Showing

**This is OK!** The DropdownMenu component is optional. The histogram works fine without it.

### Issue: Data Not Loading in Office Dialog

**Check:**
1. Dialog URL is correct in your code
2. `messageChild()` is called after dialog loads
3. Data format matches expected structure
4. Console logs in both parent and dialog

---

## 📊 Compare to Original

Open both files side-by-side:

**Original:**
```
C:\Users\benit\OneDrive\Word\0HistogramPlusPlus\HTMLtemplates\0HistogramPlus.html
```

**New Standalone:**
```
C:\OfficeAddins\statistico-analytics\dialogs\views\histogram-standalone.html
```

They should look **IDENTICAL** in terms of:
- Statistics table layout
- Histogram chart appearance
- Control placement
- Colors and styling
- Functionality

---

## ✅ Success Criteria

The histogram is ready when:

1. **Browser Test:** Opens and works with sample data
2. **Layout Match:** Looks identical to original HTML
3. **All Controls Work:** Every button, slider, dropdown functional
4. **Office.js Integration:** Opens as dialog and receives data
5. **Close Button:** Successfully closes dialog
6. **No Console Errors:** Clean console in both environments

---

## 🚀 Next Steps

Once this histogram works perfectly:

1. Create similar standalone files for other views:
   - `boxplot-standalone.html`
   - `confidence-interval-standalone.html`
   - `hypothesis-testing-standalone.html`
   - etc.

2. Extract shared CSS to `shared/css/statistico-base.css`

3. Extract shared JS to `shared/js/statistico-utils.js`

4. Update all views to use shared resources

---

**Test it now!** Open the file in your browser and verify everything works. 🎉
