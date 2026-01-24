# HOW TO TEST THE MOCKUP

## 🚀 Quick Start

### Method 1: Direct File Open (Easiest)

1. Navigate to the file location:
   ```
   C:\OfficeAddins\statistico-analytics\dialogs\shared\views\ARCHITECTURE_MOCKUP.html
   ```

2. **Double-click** the file - it will open in your default browser

3. You should see:
   - ✅ Dark theme header with "Horsepower (n=369)"
   - ✅ Statistics tables with sample data
   - ✅ Interactive histogram chart
   - ✅ Working controls (bins, normal curve, etc.)
   - ✅ Scrollbar if you resize window to be shorter

### Method 2: Open in Specific Browser

**Chrome:**
```
Right-click ARCHITECTURE_MOCKUP.html → Open with → Google Chrome
```

**Edge:**
```
Right-click ARCHITECTURE_MOCKUP.html → Open with → Microsoft Edge
```

**Firefox:**
```
Right-click ARCHITECTURE_MOCKUP.html → Open with → Firefox
```

---

## ✅ What to Test

### 1. Visual Layout
- [ ] Header displays at top (dark background)
- [ ] Statistics tables show sample data
- [ ] Histogram chart renders correctly
- [ ] Controls are visible and aligned
- [ ] Footer with Close button at bottom

### 2. Scrolling Behavior
- [ ] Resize browser window to be SHORT (< 700px height)
- [ ] Scrollbar should appear on the right
- [ ] Scrollbar should be cyan/blue colored (12px wide)
- [ ] Content should scroll smoothly
- [ ] Charts should NOT be compressed

### 3. Interactive Controls
- [ ] Change "Bins" number → Chart updates
- [ ] Toggle "Show Normal Curve" → Orange curve appears/disappears
- [ ] Change "Binning Method" dropdown → Notice it works
- [ ] Click "Refresh Chart" button → Chart redraws
- [ ] Change "Decimals" dropdown → Alert appears
- [ ] Click "Close" button → Alert appears

### 4. Responsive Design
- [ ] Resize window width → Controls adapt
- [ ] On mobile size (< 768px), controls stack vertically
- [ ] Chart always stays readable (minimum 400px height)

---

## 🔍 Browser Console Testing

1. Open the mockup in your browser

2. Press **F12** or **Ctrl+Shift+I** to open Developer Tools

3. Go to **Console** tab

4. You should see:
   ```
   ✅ Mockup loaded successfully!
   ✅ Chart created with 10 bins
   ```

5. Test interactions - each should log messages:
   - Change bins → `🔄 Updating histogram...`
   - Chart updates → `✅ Chart created with X bins`

---

## 📐 Test Different Screen Sizes

### Desktop (Full Size)
1. Maximize browser window
2. Content should fit without scrolling
3. All elements visible

### Laptop 14" (Typical)
1. Resize to: 1366 x 768
2. Should fit nicely
3. Minimal or no scrolling

### Small Height (Test Scrolling)
1. Resize to: 1366 x 600
2. **Scrollbar SHOULD appear**
3. Chart should remain full-sized (not compressed)
4. Scroll to see all content

### Mobile (Responsive)
1. Resize to: 375 x 667
2. Controls should stack vertically
3. Tables should adapt
4. Chart stays readable

---

## 🎯 Expected Behavior

### ✅ GOOD - What You Should See:

1. **Dark Theme** - Black/dark blue background
2. **Cyan/Orange Accents** - Headers and buttons
3. **Working Chart** - Interactive Highcharts histogram
4. **Visible Scrollbar** - Cyan colored, 12px wide (when window is short)
5. **Smooth Scrolling** - Content scrolls, charts stay full size
6. **Responsive Layout** - Adapts to window size

### ❌ BAD - Problems to Report:

1. White background (CSS not loading)
2. No chart visible (JavaScript error)
3. Compressed chart (height issue)
4. No scrollbar when content overflows
5. Layout broken on resize

---

## 🐛 Troubleshooting

### Chart Not Showing
**Problem:** White box where chart should be

**Solution:**
1. Check browser console for errors (F12)
2. Ensure internet connection (loads Highcharts from CDN)
3. Try refreshing page (Ctrl+R)

### Scrollbar Not Visible
**Problem:** Can't scroll even when content is tall

**Solution:**
1. Make window SHORTER (< 700px height)
2. Check if content actually overflows
3. Try different browser (Chrome, Edge, Firefox)

### Styles Look Wrong
**Problem:** Layout is broken, wrong colors

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Open in incognito/private mode

---

## 📊 Test Checklist

Print this and check off as you test:

- [ ] File opens in browser
- [ ] Header displays correctly
- [ ] Statistics tables show data
- [ ] Histogram chart renders
- [ ] Controls are functional
- [ ] Bins slider works
- [ ] Normal curve toggle works
- [ ] Scrollbar appears (when window is short)
- [ ] Scrollbar is cyan colored
- [ ] Chart stays full-sized when scrolling
- [ ] Responsive at different widths
- [ ] Close button shows alert
- [ ] Console shows no errors
- [ ] Works in Chrome
- [ ] Works in Edge
- [ ] Works in Firefox

---

## 🎓 Understanding the Mockup

This mockup demonstrates:

1. **Proper HTML Structure** - Complete `<html>`, `<head>`, `<body>`
2. **Inline CSS** - All styles in `<style>` tag (will be split later)
3. **Inline JavaScript** - All logic in `<script>` tag (will be split later)
4. **Self-Contained** - Works independently, no external dependencies except Highcharts
5. **Production Preview** - Shows exactly how real view will look and behave

**Next Steps:**
- Once mockup looks good, split into separate CSS/JS files
- Create shared CSS for common styles
- Apply pattern to all 8 views

---

## 📞 Need Help?

If something doesn't work:

1. Check browser console (F12) for errors
2. Note which browser you're using
3. Note your screen resolution
4. Take screenshot of the problem
5. Report what you expected vs. what you see

**This mockup is your reference!** Once it looks perfect, we'll replicate this structure for all views.
