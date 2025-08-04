# Chatooly CDN - Folder Structure Rules

## 📁 Organization Rules

### File Type Separation
- **`js/`** - All JavaScript files (core.js, utilities)
- **`tests/`** - All HTML test files and examples  
- **`docs/`** - All markdown documentation files
- **`root`** - Only essential files (index.html, package.json, etc.)

### Naming Conventions
- **JavaScript**: `kebab-case.js` (e.g., `core.js`, `export-utils.js`)
- **HTML**: `test-[framework].html` (e.g., `test-p5.html`)
- **Markdown**: `UPPERCASE.md` for project docs, `lowercase.md` for guides

### Path References
- Tests reference JS: `../js/core.js`
- Documentation links: `js/core.js`, `tests/test-p5.html`
- CDN URL: `https://yaelren.github.io/chatooly-cdn/js/core.js`

### GitHub Pages Structure
```
chatooly-cdn/
├── index.html              # Landing page with usage examples
├── js/
│   └── core.js            # Main CDN library
├── tests/
│   ├── test-p5.html       # p5.js integration test
│   ├── test-three.html    # Three.js integration test  
│   └── test-dom.html      # DOM export test
├── docs/
│   ├── README.md          # Main documentation
│   ├── TASKS.md           # Implementation progress
│   └── *.md               # Other documentation
└── .github/
    └── FOLDER_STRUCTURE.md # This file
```

## 🔄 Maintenance Rules

1. **New JavaScript files** → `js/` folder
2. **New test pages** → `tests/` folder with `test-` prefix
3. **New documentation** → `docs/` folder
4. **Update path references** when moving files
5. **Test CDN URLs** after structural changes

This structure ensures clean organization and reliable CDN access patterns.