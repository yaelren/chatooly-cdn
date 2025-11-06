# Legacy Compatibility Layer

## What is this?

`legacy-compat.css` is a universal fallback system that automatically applies Chatooly v2.0 design styles to plain HTML elements within Chatooly containers.

## Why does it exist?

Chatooly v2.0 introduced a new component-based design system with explicit classes (`.chatooly-btn`, `.chatooly-input`, etc.). However, all existing tools use plain HTML elements (`<button>`, `<input>`, etc.).

**Without this file**: Existing tools would break and show unstyled elements.
**With this file**: Plain elements automatically inherit the new design.

## How it works

### Magic Selectors

```css
.chatooly-app-container button:not([class*="chatooly-"]):not(.custom-styled) {
  /* Apply all .chatooly-btn styles automatically */
}
```

**Translation**:
- ✅ Must be inside `.chatooly-app-container`
- ✅ Must NOT have any `chatooly-*` class already
- ✅ Must NOT have `.custom-styled` opt-out class
- → Result: Gets Chatooly button styles automatically

### Supported Elements

| Element | Auto-Applied Class | Scoped Containers |
|---------|-------------------|-------------------|
| `<button>` | `.chatooly-btn` | `.chatooly-app-container`, `.chatooly-controls-panel`, `.chatooly-control-group` |
| `<input type="text/number/email/etc">` | `.chatooly-input` | Same as above |
| `<select>` | `.chatooly-select` | Same as above |
| `<textarea>` | `.chatooly-textarea` | Same as above |
| `<input type="range">` | Custom slider styles | Same as above |
| `<input type="checkbox">` | Accent color | Same as above |
| `<input type="color">` | Border styles | Same as above |
| `<input type="file">` | Button styles | Same as above |
| `<label>` | Typography styles | Same as above |

## Usage Examples

### Example 1: Zero Changes (Automatic)

**Your existing HTML** (no changes needed):
```html
<div class="chatooly-app-container">
  <div class="chatooly-controls-panel">
    <button>Export PNG</button>
    <input type="text" placeholder="Name">
    <input type="number" value="1000">
    <select>
      <option>PNG</option>
      <option>JPG</option>
    </select>
  </div>
</div>
```

**Result**: All elements automatically get Chatooly v2.0 styling ✨

### Example 2: Explicit Classes (Future-Proof)

**Migrate to explicit classes** (optional, recommended for new tools):
```html
<div class="chatooly-app-container">
  <div class="chatooly-controls-panel">
    <button class="chatooly-btn">Export PNG</button>
    <input type="text" class="chatooly-input" placeholder="Name">
    <input type="number" class="chatooly-input" value="1000">
    <select class="chatooly-select">
      <option>PNG</option>
      <option>JPG</option>
    </select>
  </div>
</div>
```

**Result**: Explicit styling, no fallback needed, better performance.

### Example 3: Custom Styling (Opt-Out)

**Need custom styling? Opt out per-element**:
```html
<div class="chatooly-app-container">
  <button class="custom-styled my-red-button">Custom Button</button>
  <button>Normal Chatooly Button</button>
</div>
```

**Result**:
- First button: NO Chatooly styles, uses your `.my-red-button` CSS
- Second button: Gets Chatooly styles automatically

### Example 4: Container Opt-Out

**Opt out an entire section**:
```html
<div class="chatooly-app-container">
  <div class="chatooly-controls-panel">
    <button>Chatooly Styled</button>
  </div>

  <div class="no-chatooly-fallback my-custom-controls">
    <button>Custom Styled</button>
    <input type="text">
  </div>
</div>
```

**Result**:
- First section: Chatooly styles applied
- Second section: NO Chatooly styles, fully custom

## Scope & Isolation

### ✅ Only affects these containers:
- `.chatooly-app-container`
- `.chatooly-controls-panel`
- `.chatooly-control-group`
- `.chatooly-controls-content`

### ❌ Does NOT affect:
- Elements outside Chatooly containers
- Elements already using `.chatooly-*` classes
- Elements with `.custom-styled` class
- Elements in `.no-chatooly-fallback` containers

**No global CSS pollution** - your other page elements are safe!

## Performance

### Selector Specificity
- **Complexity**: Moderate (`:not([class*="chatooly-"])`)
- **Performance**: Negligible impact on modern browsers
- **Caching**: Applies once on page load

### File Size
- **Unminified**: ~8KB
- **Minified**: ~6KB
- **Impact**: 14% increase to unified.css (acceptable for backward compat)

## Maintenance

### When to keep it?
- ✅ While tools still use plain HTML elements
- ✅ During transition period to explicit classes
- ✅ As long as backward compatibility is valued

### When to remove it?
- ❌ When all published tools migrate to explicit `.chatooly-*` classes
- ❌ In a future breaking version (v3.0+)
- ❌ If file size becomes critical concern

### Migration Timeline (Proposed)
```
v2.0 (Now)     → Include legacy-compat.css, full backward compat
v2.1-2.9       → Deprecation warnings in console for plain elements
v3.0 (Future)  → Remove legacy-compat.css, breaking change
```

## Debugging

### Issue: Element not getting Chatooly styles

**Check 1**: Is it in a Chatooly container?
```html
<!-- ❌ Won't work -->
<button>Outside</button>

<!-- ✅ Will work -->
<div class="chatooly-app-container">
  <button>Inside</button>
</div>
```

**Check 2**: Does it already have a class?
```html
<!-- ❌ Won't auto-apply (already has chatooly class) -->
<button class="chatooly-btn-custom">Won't auto-style</button>

<!-- ✅ Will auto-apply -->
<button>Will auto-style</button>
```

**Check 3**: Is it opted out?
```html
<!-- ❌ Won't apply (opted out) -->
<button class="custom-styled">No auto-style</button>
<div class="no-chatooly-fallback">
  <button>No auto-style</button>
</div>
```

### Issue: Custom styles being overridden

**Solution**: Add `.custom-styled` class
```html
<button class="custom-styled" style="background: red;">
  Keeps red background
</button>
```

Or increase specificity:
```css
/* Your custom CSS */
.my-tool .special-button {
  background: red !important;
}
```

## Testing

### Quick Test HTML
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.min.css">
</head>
<body>
  <div class="chatooly-app-container">
    <div class="chatooly-controls-panel" style="padding: 20px;">
      <h3>Legacy Compat Test</h3>

      <button>Plain Button (should be styled)</button>
      <button class="chatooly-btn">Explicit Class Button</button>
      <button class="custom-styled">Custom Button (no style)</button>

      <br><br>

      <input type="text" placeholder="Plain input">
      <input type="text" class="chatooly-input" placeholder="Explicit class input">

      <br><br>

      <select>
        <option>Plain select</option>
      </select>
      <select class="chatooly-select">
        <option>Explicit class select</option>
      </select>
    </div>
  </div>
</body>
</html>
```

**Expected Results**:
- ✅ Plain button: Gray-green background
- ✅ Explicit class button: Gray-green background
- ❌ Custom button: No Chatooly styling
- ✅ All inputs/selects: Green-beige background

## FAQ

**Q: Will this affect my non-Chatooly page elements?**
A: No, fallback is scoped to `.chatooly-*` containers only.

**Q: Can I opt out specific elements?**
A: Yes, add `.custom-styled` class to any element.

**Q: Does this slow down my page?**
A: No, CSS parsing impact is negligible on modern browsers.

**Q: Should I migrate to explicit classes?**
A: Optional but recommended for new tools. Existing tools work fine as-is.

**Q: When will this be removed?**
A: Not before v3.0, which is months/years away. You have plenty of time.

**Q: What if I want to use old design?**
A: Reference the old CDN version URL or override variables locally.

---

**File**: `css/legacy-compat.css`
**Added**: Chatooly CDN v2.0
**Status**: Active, production-ready
**Maintained by**: Chatooly Core Team
