# Chrome Web Store Assets — ChronoMark

## 📸 Created Screenshots

This directory contains the assets required for publishing on the Chrome Web Store.

### Primary Screenshots (1280×800)
- `screenshot-1-main-interface.png` — Main interface with bookmarks and tags
- `screenshot-2-edit-bookmark.png` — Edit bookmark modal with tagging system
- `screenshot-3-settings.png` — Settings page with Google Drive sync

### Alternative Screenshots (640×400)
- `screenshot-1-main-interface-small.png`
- `screenshot-2-edit-bookmark-small.png`
- `screenshot-3-settings-small.png`

## 🎯 Features Shown

### Screenshot 1: Main Interface
- ✅ Organized bookmark list
- ✅ Colored tag chips
- ✅ Search bar
- ✅ Sync status
- ✅ Popular tags and quick stats
- ✅ Sensitive data obfuscated (partially masked URLs)

### Screenshot 2: Edit Bookmark
- ✅ Intuitive edit modal
- ✅ Tag management (add/remove)
- ✅ Create new tags
- ✅ Modern and responsive UI
- ✅ Feature callouts

### Screenshot 3: Settings
- ✅ Automatic Google Drive sync
- ✅ Data location within Google Drive
- ✅ Tag management
- ✅ Smart Chrome import
- ✅ Privacy and security highlights

## 📋 Chrome Web Store Requirements

- ✅ Resolution: 1280×800 (recommended) and 640×400 (alternative)
- ✅ Format: High-quality PNG
- ✅ Quantity: 3 screenshots (within the 1–5 limit)
- ✅ Content: Demonstrates core features
- ✅ Privacy: Sensitive data obfuscated

## How to Use During Publishing

1. Go to: Chrome Web Store Developer Console  
2. Upload: Use the 1280×800 PNG files  
3. Suggested Order:
   - Screenshot 1: Main interface (first impression)
   - Screenshot 2: Tagging feature (differentiator)
   - Screenshot 3: Settings and privacy (trust)

## 🛠️ Makefile Commands

```bash
# Convert SVG to PNG (1280×800)
make convert-screenshots

# Convert SVG to smaller PNG (640×400)
make convert-screenshots-small

# Show store information
make store-info

# Full publishing guide
make store-help
```

## 📝 Suggested Captions

### Screenshot 1
“ChronoMark main interface showing bookmarks organized with smart tags and real-time sync.”

### Screenshot 2
“Advanced tagging system enabling flexible organization and quick search of your favorite bookmarks.”

### Screenshot 3
“Privacy-focused settings and secure Google Drive sync — your data stays with you.”

## 🔒 Privacy in Screenshots

- ✅ Partially masked URLs (e.g., `https://aitm**.com/`)  
- ✅ No real personal data shown  
- ✅ Representative examples of features  
- ✅ Focus on features, not data

## 📊 Technical Specs

- Resolution: 1280×800 (16:10) and 640×400  
- Format: PNG with transparency  
- Quality: 96 DPI  
- Size: ~60–110 KB per image  
- Colors: Modern dark theme  
- Font: Arial/Sans-serif for compatibility

---

Next step: run `make package` to generate the final ZIP and publish it to the Chrome Web Store!