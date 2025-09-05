# 🐛 Gissues - Visual Bug Reports Made Simple

Chrome extension for instant bug reporting. Take screenshots and create GitHub issues with one keyboard shortcut.

## ⚡ Quick Start

### Installation
1. **Download**: Click "Code" → "Download ZIP" sur GitHub
2. **Extract**: Dézippe le fichier dans un dossier (ex: `Downloads/gissues/`)
3. **Chrome**: Va sur `chrome://extensions/`
4. **Developer mode**: Active le mode développeur (toggle en haut à droite)
5. **Load**: Clique "Load unpacked" → sélectionne le dossier `gissues/`

### Configuration
1. **Setup**: Click extension icon → enter GitHub token + repository
2. **Use**: Press `Ctrl+Shift+B` on any website → fill form → create issue

> ⚠️ **Important** : Il faut dézipper le fichier ! Chrome ne peut pas charger directement un fichier ZIP.

## 🔧 Setup

### GitHub Token
1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new?scopes=repo&description=Gissues%20Extension)
2. Create token with `repo` scope
3. Paste in extension popup

### Repository Format
`owner/repository-name` (e.g., `mycompany/webapp`)

## ✨ Features

- **One-click screenshots** with `Ctrl+Shift+B`
- **Auto-metadata**: URL, browser, resolution, console errors
- **GitHub integration**: Direct issue creation
- **Domain mapping**: Different sites → different repos
- **Clean UI**: Shadow DOM modal, no site interference

## 📁 Project Structure

```
gissues/
├── manifest.json           # Extension config
├── src/
│   ├── background/service-worker.js
│   ├── content/content.js
│   ├── popup/popup.html + popup.js
│   └── options/options.html + options.js
└── auto-generate-icons.html   # Icon generator
```

## 🎨 Icons Setup

1. Open `auto-generate-icons.html`
2. Icons auto-download
3. Move to `/icons/` folder
4. Copy generated code to `manifest.json`

## 🐛 Troubleshooting

- **No screenshot**: Only works on regular websites (not chrome:// pages)
- **GitHub error**: Check token scope and repository permissions
- **Modal missing**: Refresh page and try again

## 🚀 Chrome Web Store Ready

- Professional icons included
- Privacy policy provided
- Manifest V3 compliant
- No external dependencies

## 🚀 Releases

To create a new release:

```bash
# Patch version (1.0.0 → 1.0.1)
./release.sh patch

# Minor version (1.0.0 → 1.1.0)  
./release.sh minor

# Major version (1.0.0 → 2.0.0)
./release.sh major
```

The script automatically:
- Updates `manifest.json` version
- Creates git tag with release notes
- Pushes to GitHub with tags
- Opens GitHub releases page

## 🤝 Contributing

Issues and pull requests welcome! Please check existing issues first.

## 📄 License

MIT License

---

**Built with**: Vanilla JS, Manifest V3, GitHub API, Tailwind CSS