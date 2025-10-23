# Converting Tools to Chatooly - Quick Instructions

Hey! Here's how to convert any tool to Chatooly format:

## 🚀 Fastest Method (AI-Assisted - 15 minutes)

### Step 1: Open Claude (or ChatGPT)

### Step 2: Drag these files to the chat:
```
📄 docs/AI-AGENT-QUICK-REFERENCE.md
📁 [Your tool files - HTML, JS, CSS]
```

### Step 3: Use this prompt:
```
Convert this tool to Chatooly format following the quick reference guide.

The tool uses: [p5.js / Three.js / Canvas API / DOM-based]

Make sure to:
- Use the exact HTML structure from the guide
- Set canvas ID to "chatooly-canvas"
- Add the chatooly:canvas-resized event listener
- Place controls in the controls panel
```

### Step 4: Test the output
- Tool loads without errors? ✓
- Export button appears (bottom-right)? ✓
- PNG export works? ✓
- Controls update visualization? ✓

---

## 📖 Need More Details?

**Start here:** `docs/HOW-TO-USE-THIS-DOCUMENTATION.md`

It has 6 use cases with complete workflows for:
- AI conversion (detailed)
- Manual conversion
- Adding background controls
- Adding size presets
- Debugging issues
- And more...

**Main reference:** `docs/CHATOOLY-CONVERSION-GUIDE.md`
- Complete API documentation
- 36+ code examples
- All canvas patterns
- Common problems & solutions

---

## 💡 Quick Tips

1. **Always use AI first** - it's faster and follows the patterns
2. **Check the examples** - AI-AGENT-QUICK-REFERENCE.md has a complete working example at the bottom
3. **Test incrementally** - structure → canvas → controls → features
4. **Use the checklist** - it's in CHATOOLY-CONVERSION-GUIDE.md

---

## 🆘 If You Get Stuck

1. Check: `docs/HOW-TO-USE-THIS-DOCUMENTATION.md` → "Use Case 4: Debugging Issues"
2. Review: Common Pitfalls section in CHATOOLY-CONVERSION-GUIDE.md
3. Compare: Your code with templates in `/tests/` folder

---

## 📁 Files Location

All documentation is in the `docs/` folder:
- `AI-AGENT-QUICK-REFERENCE.md` ← Start with this
- `HOW-TO-USE-THIS-DOCUMENTATION.md` ← Detailed workflows
- `CHATOOLY-CONVERSION-GUIDE.md` ← Complete reference
- `README.md` ← Navigation hub

That's it! The AI method takes ~15 minutes for a basic tool. Let me know if you hit any issues.
