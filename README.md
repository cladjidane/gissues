# 🐛 Gissues - Visual Bug Reports Made Simple

Chrome extension for instant bug reporting. Take screenshots and create GitHub issues with one keyboard shortcut.

## ⚡ Quick Start

1. **Install**: Load unpacked in `chrome://extensions/` (enable Developer mode)
2. **Setup**: Click extension icon → enter GitHub token + repository
3. **Use**: Press `Ctrl+Shift+B` on any website → fill form → create issue

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

## 🤝 Contributing

Issues and pull requests welcome! Please check existing issues first.

## 📄 License

MIT License

---

**Built with**: Vanilla JS, Manifest V3, GitHub API, Tailwind CSS