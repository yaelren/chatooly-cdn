# Chatooly CDN v2.0 - Visual Testing Guide

Quick visual checklist for verifying the new design system works correctly with existing tools.

## Quick Test URLs

### Published Tools (Test After Merge)
```
chatooly.com/tools/bg-gradient-tool
chatooly.com/tools/dragon-generator
chatooly.com/tools/text-waves
chatooly.com/tools/fire-generator
chatooly.com/tools/type-shaper
```

## Visual Checklist

### ✅ Colors
- [ ] Buttons: Gray-green background (#6d736c)
- [ ] Button hover: Slightly lighter (#7d837c)
- [ ] Inputs: Green-beige background (#aeb7ac)
- [ ] Export button: Yellow (#F4E4A3)
- [ ] Background: Dark gray (#1a1a1a)
- [ ] Text: White (#ffffff)

### ✅ Typography
- [ ] Body text: TASA Orbiter font loads
- [ ] Section headers: VT323 monospace font
- [ ] Font fallback: System fonts if Google Fonts fails
- [ ] No text overflow or wrapping issues

### ✅ Components
- [ ] Buttons render correctly
- [ ] Inputs have proper padding and border-radius
- [ ] Range sliders styled with green thumb
- [ ] Checkboxes have green accent color
- [ ] Color pickers have border
- [ ] File inputs have styled button
- [ ] Selects/dropdowns render correctly
- [ ] Textareas have proper styling

### ✅ Interactions
- [ ] Button hover effects work
- [ ] Button click animation (scale 0.98)
- [ ] Input focus states show lighter background
- [ ] Disabled buttons show reduced opacity
- [ ] Export button click triggers export

### ✅ Layout
- [ ] No unexpected shifts or overflow
- [ ] Canvas area remains centered
- [ ] Controls panel scrolls if needed
- [ ] Responsive behavior intact (mobile/tablet)

## Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Console Errors

Check for:
- [ ] No CSS loading errors
- [ ] No font loading errors
- [ ] No JavaScript errors
- [ ] No 404s for CDN resources

## Before/After Screenshots

Take screenshots of:
1. bg-gradient-tool (main branch)
2. bg-gradient-tool (ui-update branch)
3. Compare colors, fonts, spacing

## Fallback Verification

### Test 1: Plain HTML Elements
```html
<!-- Create test page with plain elements -->
<div class="chatooly-app-container">
  <div class="chatooly-controls-panel">
    <button>Test Button</button>
    <input type="text" placeholder="Test Input">
    <select><option>Test Select</option></select>
  </div>
</div>
```

**Expected**: All elements should have Chatooly styling

### Test 2: Custom Styled Elements
```html
<div class="chatooly-app-container">
  <button class="custom-styled" style="background: red;">Custom</button>
</div>
```

**Expected**: Button keeps red background, no Chatooly styling

### Test 3: Opt-Out Container
```html
<div class="no-chatooly-fallback">
  <button>Outside</button>
</div>
```

**Expected**: Button has no Chatooly styling

## Regression Testing

Compare against main branch:
- [ ] Export functionality (PNG)
- [ ] Export functionality (Video/GIF)
- [ ] Canvas resize
- [ ] Canvas zoom
- [ ] Background controls
- [ ] Color pickers
- [ ] Range sliders
- [ ] File uploads

## Performance Testing

- [ ] Page load time < 2s
- [ ] CSS parsing time acceptable
- [ ] Font loading doesn't block render
- [ ] No visual flash (FOUT/FOIT)

## Sign-Off

**Tested By**: _____________
**Date**: _____________
**Status**: ⬜ Pass ⬜ Fail ⬜ Issues Found

**Issues Found**:
```
[List any issues here]
```

**Approver**: _____________
**Approved**: ⬜ Yes ⬜ No
**Date**: _____________
