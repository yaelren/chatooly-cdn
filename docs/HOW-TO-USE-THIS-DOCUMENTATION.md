# How to Use Chatooly Documentation - Complete Guide

> **Purpose**: Step-by-step instructions for using the Chatooly documentation to convert tools

---

## 🎯 What You Have

You now have **three main documentation files**:

1. **CHATOOLY-CONVERSION-GUIDE.md** - Comprehensive conversion guide (1,625 lines)
2. **AI-AGENT-QUICK-REFERENCE.md** - Fast reference for basic conversions
3. **DOCUMENTATION-GAPS.md** - Gap analysis (for your reference)

---

## 📋 Use Case 1: AI Agent Converting a Tool (Most Common)

### Scenario
You have a tool (e.g., a particle simulator) that's NOT built with Chatooly, and you want to convert it.

### Steps

#### Option A: Quick Conversion (Simple Tools)

**1. Open your AI chat (Claude, ChatGPT, etc.)**

**2. Drag and drop these files to the chat:**
```
📄 AI-AGENT-QUICK-REFERENCE.md
📁 Your tool files (HTML, JS, CSS)
```

**3. Give this prompt:**
```
Convert this tool to Chatooly format following the quick reference guide.

The tool is: [brief description]
It uses: [p5.js / Three.js / Canvas API / DOM-based]

Make sure to:
- Use the exact HTML structure from the guide
- Set canvas ID to "chatooly-canvas"
- Add the chatooly:canvas-resized event listener
- Add controls to the controls panel
```

**4. Review the output** and test:
- Does the tool load without errors?
- Does the export button appear (bottom-right)?
- Does PNG export work?
- Do controls update the visualization?

---

#### Option B: Complex Conversion (Advanced Tools)

**1. Open your AI chat**

**2. Drag and drop these files:**
```
📄 CHATOOLY-CONVERSION-GUIDE.md
📄 AI-AGENT-QUICK-REFERENCE.md (optional, for reference)
📁 Your tool files
```

**3. Give this detailed prompt:**
```
Convert this tool to Chatooly format using the comprehensive conversion guide.

Tool details:
- Name: [Your Tool Name]
- Type: [p5.js / Three.js / Canvas / DOM]
- Features needed:
  [ ] Background color controls
  [ ] Background transparency
  [ ] Background image upload
  [ ] Custom canvas size presets
  [ ] High-resolution export
  [ ] Animation/video export

Please follow:
1. The HTML structure from the guide
2. The appropriate canvas integration pattern
3. Add background controls if checked above
4. Add custom size presets if checked above
5. Implement all event listeners
6. Add complete error handling

Use the "Background Management" section if background features are needed.
Use the "Canvas Resizer API" section if custom sizes are needed.
Use the "Event System Reference" for proper event handling.
```

**4. Test thoroughly** using the checklist in the guide

---

## 📋 Use Case 2: Manual Conversion (You're Coding)

### Scenario
You're manually converting a tool and need reference documentation.

### Steps

**1. Open the documentation files in your IDE or browser:**
```
docs/CHATOOLY-CONVERSION-GUIDE.md      (main reference)
docs/AI-AGENT-QUICK-REFERENCE.md       (quick lookup)
```

**2. Follow this workflow:**

#### Step 1: HTML Structure
- Go to: **CHATOOLY-CONVERSION-GUIDE.md** → "Required HTML Structure"
- Copy the template structure
- Replace with your tool name and description

#### Step 2: Canvas Setup
- Go to: **CHATOOLY-CONVERSION-GUIDE.md** → "Canvas Integration Patterns"
- Choose your pattern:
  - p5.js → Use Pattern 1
  - Three.js → Use Pattern 2
  - Canvas API → Use Pattern 3
  - DOM-based → Use Pattern 4
- Copy and adapt the code

#### Step 3: Controls
- Go to: **CHATOOLY-CONVERSION-GUIDE.md** → "Control Panel Integration"
- Copy control HTML structure
- Add your specific controls
- Wire up event listeners

#### Step 4: Advanced Features (Optional)
- **Background controls?** → "Background Management (Advanced)" section
- **Custom sizes?** → "Canvas Resizing API (Advanced)" section
- **Event handling?** → "Event System Reference" section

#### Step 5: Testing
- Go to: **CHATOOLY-CONVERSION-GUIDE.md** → "Conversion Checklist"
- Check off each item
- Go to: **CHATOOLY-CONVERSION-GUIDE.md** → "Common Pitfalls & Solutions"
- Review common mistakes

---

## 📋 Use Case 3: Adding Features to Existing Chatooly Tool

### Scenario
You already have a Chatooly tool and want to add new features.

### Adding Background Controls

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Background Management (Advanced)"

**3. Copy this section's code:**
- HTML for background controls
- JavaScript for wiring up controls
- Integration pattern for your canvas type

**4. Add to your tool:**
```html
<!-- Add to your controls panel -->
<div class="chatooly-control-group">
    <label for="bg-color">Background Color</label>
    <input type="color" id="bg-color" value="#ffffff">
</div>
<!-- ... more controls from guide -->
```

```javascript
// Add to your JavaScript
function setupBackgroundControls() {
    const canvas = document.getElementById('chatooly-canvas');
    Chatooly.backgroundManager.init(canvas);
    // ... rest of setup from guide
}
```

**5. Test** background color, transparency, and image uploads

---

### Adding Custom Size Presets

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Canvas Resizing API (Advanced)"

**3. Copy:** "Pattern 1: Custom Size Controls"

**4. Add preset buttons:**
```html
<div class="chatooly-control-group">
    <label>Quick Sizes</label>
    <button class="size-preset" data-width="1080" data-height="1080">
        Square
    </button>
    <!-- ... more presets -->
</div>
```

**5. Wire up the buttons:**
```javascript
document.querySelectorAll('.size-preset').forEach(button => {
    button.addEventListener('click', (e) => {
        const width = parseInt(e.target.dataset.width);
        const height = parseInt(e.target.dataset.height);
        Chatooly.canvasResizer.setExportSize(width, height);
    });
});
```

---

## 📋 Use Case 4: Debugging Issues

### Problem: Export button doesn't appear

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Common Pitfalls & Solutions"

**3. Find:** "Export button doesn't appear" section

**4. Check:**
- Is CDN script loaded before `window.ChatoolyConfig`?
- Is `window.ChatoolyConfig` defined?
- Check browser console for errors

---

### Problem: Canvas not detected for export

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Common Pitfalls & Solutions"

**3. Find:** "Canvas not detected" section

**4. Verify:**
- Canvas has `id="chatooly-canvas"`
- Canvas is inside `id="chatooly-container"`
- Canvas is created before export attempt

---

### Problem: Canvas doesn't resize

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Event System Reference"

**3. Check:** Do you have the `chatooly:canvas-resized` event listener?

**4. Add if missing:**
```javascript
document.addEventListener('chatooly:canvas-resized', (event) => {
    const { width, height } = event.detail.canvas;
    // Update your canvas
    resizeCanvas(width, height);
});
```

---

## 📋 Use Case 5: Understanding Available APIs

### Question: What methods does Chatooly.backgroundManager have?

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Background Management (Advanced)" → "Background Manager API"

**3. Review all methods:**
- `init(canvas)`
- `setBackgroundColor(color)`
- `setTransparent(boolean)`
- `setBackgroundImage(file)`
- `setFit(mode)`
- `getBackgroundState()`
- `drawToCanvas(ctx, width, height)`
- `reset()`

---

### Question: What events does Chatooly fire?

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Event System Reference" → "Available Events"

**3. Review all events:**
- `chatooly:canvas-resized` - Canvas dimensions changed
- `chatooly:styles-loaded` - CSS loaded
- `chatooly:export-start` - Export begins
- `chatooly:export-complete` - Export finishes
- `chatooly:ready` - (Planned) CDN initialized
- `chatooly:error` - (Planned) Errors occurred

---

### Question: What canvas resizing methods are available?

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Navigate to:** "Canvas Resizing API (Advanced)" → "Canvas Resizer API"

**3. Review methods:**
- `setExportSize(width, height)`
- `exportWidth` (property)
- `exportHeight` (property)

---

## 📋 Use Case 6: Learning by Example

### Want: See a complete working example

**1. Open:** AI-AGENT-QUICK-REFERENCE.md

**2. Scroll to bottom:** "Quick Convert Example (Full)"

**3. Study the complete 80-line example:**
- HTML structure
- Canvas setup
- Controls
- Event handlers
- Configuration

**4. Copy and modify** for your needs

---

### Want: See specific pattern examples

**1. Open:** CHATOOLY-CONVERSION-GUIDE.md

**2. Choose your section:**
- **Canvas setup?** → "Canvas Integration Patterns"
- **Background features?** → "Background Management" → "Integration Patterns"
- **Canvas resizing?** → "Canvas Resizing API" → "Integration Patterns"
- **Events?** → "Event System Reference" → "Event-Driven Tool Pattern"

**3. Each section has multiple complete examples**

---

## 🎓 Recommended Learning Path

### For Beginners

1. **Read:** AI-AGENT-QUICK-REFERENCE.md (top to bottom)
   - Time: 10 minutes
   - Understand basic structure

2. **Try:** Convert a simple tool using AI agent (Use Case 1, Option A)
   - Time: 15 minutes
   - Get hands-on experience

3. **Read:** CHATOOLY-CONVERSION-GUIDE.md (sections as needed)
   - Time: 30-60 minutes
   - Deep dive into specific features

4. **Practice:** Add advanced features (Use Case 3)
   - Time: 30 minutes
   - Master advanced patterns

---

### For Experienced Developers

1. **Skim:** AI-AGENT-QUICK-REFERENCE.md (5 minutes)
   - Get the gist

2. **Reference:** CHATOOLY-CONVERSION-GUIDE.md (as needed)
   - Look up specific APIs
   - Copy code patterns

3. **Bookmark:** Common sections for quick lookup:
   - Background Management (Advanced)
   - Canvas Resizing API (Advanced)
   - Event System Reference
   - Common Pitfalls & Solutions

---

## 🔍 Quick Lookup Table

| I Need To... | Go To | File |
|--------------|-------|------|
| Convert basic tool | Quick Start (5 Steps) | AI-AGENT-QUICK-REFERENCE.md |
| Convert complex tool | Complete workflow | CHATOOLY-CONVERSION-GUIDE.md |
| Add background controls | Background Management | CHATOOLY-CONVERSION-GUIDE.md |
| Add size presets | Canvas Resizing API | CHATOOLY-CONVERSION-GUIDE.md |
| Handle events | Event System Reference | CHATOOLY-CONVERSION-GUIDE.md |
| Fix export button | Common Pitfalls | CHATOOLY-CONVERSION-GUIDE.md |
| See complete example | Bottom section | AI-AGENT-QUICK-REFERENCE.md |
| Understand p5.js setup | Canvas Integration → Pattern 1 | CHATOOLY-CONVERSION-GUIDE.md |
| Understand Three.js setup | Canvas Integration → Pattern 2 | CHATOOLY-CONVERSION-GUIDE.md |
| Check conversion completeness | Conversion Checklist | CHATOOLY-CONVERSION-GUIDE.md |

---

## 💡 Pro Tips

### Tip 1: Use AI Agents Effectively

**Good prompt:**
```
Convert this p5.js particle system to Chatooly.

Requirements:
- Add background color control
- Add particle count slider (10-100)
- Add canvas size presets (Square, HD, 4K)
- Ensure proper event handling

Use the patterns from CHATOOLY-CONVERSION-GUIDE.md:
- p5.js integration pattern
- Background Manager section
- Canvas Resizer section
```

**Bad prompt:**
```
Make this work with Chatooly
```

---

### Tip 2: Work Incrementally

1. ✅ Get basic structure working first
2. ✅ Add canvas integration
3. ✅ Test export button
4. ✅ Add controls
5. ✅ Add advanced features (background, sizing)
6. ✅ Test thoroughly

Don't try to do everything at once!

---

### Tip 3: Use the Templates

View complete working template examples on GitHub:
- **p5.js**: [test-p5-mediarecorder.html](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-p5-mediarecorder.html)
- **Three.js**: [test-threejs-mediarecorder-template.html](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-threejs-mediarecorder-template.html)
- **Canvas API**: [test-canvas-mediarecorder-template.html](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-canvas-mediarecorder-template.html)

Open these in your browser to see real working examples!

---

### Tip 4: Copy-Paste Strategy

The documentation is designed for copy-pasting:

1. **Copy HTML structure** → Modify titles/descriptions
2. **Copy canvas pattern** → Adapt to your framework
3. **Copy controls HTML** → Adjust parameters
4. **Copy event handlers** → Connect to your logic

This is FASTER than writing from scratch!

---

## 🚨 Common First-Time Mistakes

### Mistake 1: Not reading the Quick Reference first
**Solution:** Start with AI-AGENT-QUICK-REFERENCE.md, it's only 10 minutes

### Mistake 2: Missing critical IDs
**Solution:** Use the checklist in CHATOOLY-CONVERSION-GUIDE.md

### Mistake 3: Wrong canvas pattern for framework
**Solution:** Check "Canvas Integration Patterns" - choose the right one

### Mistake 4: Not testing incrementally
**Solution:** Test after each major step (structure → canvas → controls → features)

### Mistake 5: Ignoring events
**Solution:** Always add `chatooly:canvas-resized` listener from the start

---

## 📞 When You're Stuck

### Step 1: Check Common Pitfalls
Location: CHATOOLY-CONVERSION-GUIDE.md → "Common Pitfalls & Solutions"

### Step 2: Review the Checklist
Location: CHATOOLY-CONVERSION-GUIDE.md → "Conversion Checklist"

### Step 3: Check Console
Open browser DevTools → Console tab → Look for errors

### Step 4: Compare with Template
Open template examples on GitHub (see links in README.md)
Compare your code structure with working examples

### Step 5: Review Event Debugging
Location: CHATOOLY-CONVERSION-GUIDE.md → "Event System Reference" → "Debugging Events"
Add the debug helper to see what events fire

---

## 🎯 Success Criteria

Your conversion is successful when:

- [x] Tool loads without console errors
- [x] Export button appears (bottom-right corner)
- [x] Static PNG export works
- [x] Video export works (if animated)
- [x] Canvas resizing works via UI controls
- [x] All your controls update the visualization
- [x] Mouse/touch interaction works (if applicable)
- [x] Tool is responsive on mobile

Use this checklist from: CHATOOLY-CONVERSION-GUIDE.md → "Conversion Checklist"

---

## 📁 File Organization

These docs work in any location:

```
your-project/
├── chatooly-docs/                         ← Standalone docs folder
│   ├── CHATOOLY-CONVERSION-GUIDE.md       ← Main reference (90% complete)
│   ├── AI-AGENT-QUICK-REFERENCE.md        ← Quick lookup
│   ├── HOW-TO-USE-THIS-DOCUMENTATION.md   ← This file
│   ├── QUICK-START-MESSAGE.md             ← Share with coworkers
│   ├── DOCUMENTATION-GAPS.md              ← For maintainers
│   └── README.md                          ← Navigation hub
└── your-tool.html                          ← Your converted tool
```

**Template Examples**: View on GitHub at https://github.com/yaelren/chatooly-cdn/tree/main/tests

---

## 🔄 Workflow Summary

### Quick Workflow (Simple Tool)
```
1. Drop AI-AGENT-QUICK-REFERENCE.md + your files to AI
2. Say: "Convert to Chatooly"
3. Test with checklist
4. Done!
```

### Complete Workflow (Complex Tool)
```
1. Read AI-AGENT-QUICK-REFERENCE.md (10 min)
2. Drop CHATOOLY-CONVERSION-GUIDE.md + your files to AI
3. Request specific features (background, sizing, etc.)
4. Review code against patterns in guide
5. Test incrementally
6. Add advanced features from guide sections
7. Final test with complete checklist
8. Done!
```

### Manual Workflow (Coding Yourself)
```
1. Open CHATOOLY-CONVERSION-GUIDE.md in IDE
2. Copy HTML structure
3. Choose canvas integration pattern
4. Copy and adapt
5. Add controls
6. Add advanced features (optional)
7. Test with checklist
8. Debug with Common Pitfalls section
9. Done!
```

---

## 📖 Documentation Completeness

| Feature | Documentation | Code Examples |
|---------|---------------|---------------|
| Basic Structure | ✅ Complete | ✅ 5 examples |
| Canvas Integration | ✅ Complete | ✅ 4 patterns |
| Controls | ✅ Complete | ✅ 8 examples |
| Background Manager | ✅ Complete | ✅ 7 examples |
| Canvas Resizer | ✅ Complete | ✅ 6 examples |
| Event System | ✅ Complete | ✅ 8 examples |
| Export System | ✅ Complete | ✅ 3 examples |
| Common Problems | ✅ Complete | ✅ 6 solutions |

**Total**: 90% documentation completeness for tool conversions

---

## 🎓 Next Steps After Reading This

1. **Try Use Case 1** - Convert a simple tool with AI agent
2. **Study the examples** in AI-AGENT-QUICK-REFERENCE.md
3. **Bookmark** CHATOOLY-CONVERSION-GUIDE.md for reference
4. **Share** these docs with your team
5. **Report issues** or missing info (see DOCUMENTATION-GAPS.md)

---

## 📝 Version & Updates

- **Version**: 1.0.0
- **Last Updated**: 2025-10-23
- **Completeness**: 90% for tool conversions
- **Files**: 3 documentation files + templates

---

**You're ready to convert tools to Chatooly! Start with Use Case 1 and work your way up.** 🚀

Got questions? Check CHATOOLY-CONVERSION-GUIDE.md → "Common Pitfalls & Solutions"
