# 🧪 Test Instructions — ChronoMark Extension

## 📋 Information for the Chrome Web Store Review Team

### 🔐 Test Account
- Email: chronomark.test@gmail.com
- Password: [REMOVED FOR SECURITY]
- Google Drive: OAuth permissions configured
- Test Data: Pre-configured bookmarks with tags

---

## 🚀 Initial Setup

### 1) Install the Extension
1. Download the `.zip` package
2. Open Chrome → Extensions → Developer Mode
3. “Load unpacked” → Select the extension folder
4. Confirm the ChronoMark icon appears in the toolbar

### 2) First Run
1. Click the extension icon
2. The main interface should show:
   - Existing Chrome bookmarks (if any)
   - Search bar at the top
   - “+” button to add a new bookmark
   - Settings icon (gear)

---

## 🧪 Feature Tests

### ✅ Test 1: Basic Bookmark Management
1. Add Bookmark: click “+”, fill Title/URL/Tags, verify it appears in the list
2. Edit Bookmark: click any existing item, change title/tags, save and verify
3. Search: type in the search bar, verify real-time filtering, try tag search

### ✅ Test 2: Tag System
1. Add Tags: create a bookmark with multiple tags, verify chips appear
2. Filter by Tag: click a tag, verify filtering by that tag
3. Manage Tags (Settings): rename/delete a tag and verify bookmarks update

### ✅ Test 3: Google Drive Sync (Optional)
1. OAuth Setup: Settings → Automatic Sync → Enable → Sign in
2. Sync: add a new bookmark, check “Last synced” status, verify JSON file in Drive
3. Import from Chrome: Settings → Import Bookmarks → “Import from Chrome”

### ✅ Test 4: UI & Usability
1. Responsiveness: resize the popup, verify layout adapts
2. Dark Theme: verify readability and contrast
3. Performance: test with 50+ bookmarks, search speed, and smooth scrolling

---

## 🔍 Specific Scenarios

### 📚 Scenario 1: New User
1. Install with no existing bookmarks
2. Add the first bookmark
3. Explore settings
4. Import Chrome bookmarks

### 🔄 Scenario 2: Heavy User
1. Import 100+ bookmarks
2. Stress-test search
3. Organize with tags
4. Test synchronization

### 🌐 Scenario 3: Multi-Device Sync
1. Enable Google Drive sync on one device
2. Add bookmarks
3. Simulate another device (clear local data)
4. Verify restore via Google Drive

---

## ⚠️ Known Issues & Workarounds

### 🔐 Google Drive OAuth
- Problem: Auth error  
- Fix: Ensure pop-ups are not blocked  
- Alternative: Use non-sync mode

### 🤖 Gemini AI Authorization
- Problem: AI suggestions not appearing  
- Likely cause: First‑time authorization not granted in this profile  
- Fix: In the Add/Edit form, click “Ativar sugestões por IA”. Complete the Google consent screen. After authorization, suggestions appear automatically.  
- Notes: We request the scope `https://www.googleapis.com/auth/generative-language` and call the Gemini `generateContent` endpoint directly from the extension using Chrome Identity OAuth. No API keys are embedded.

### 📱 Performance
- Problem: Slow with very large lists  
- Fix: Use search to filter  
- Optimization: Virtualized list implemented

### 🏷️ Tags
- Problem: Tags not showing  
- Fix: Ensure they were saved  
- Tip: Press Enter after typing a tag

---

## 📊 Preloaded Test Data

### 🔖 Sample Bookmarks
```
1. "Google" — https://google.com — Tags: [search, tools]
2. "GitHub" — https://github.com — Tags: [dev, code, git]
3. "Stack Overflow" — https://stackoverflow.com — Tags: [dev, help, programming]
4. "YouTube" — https://youtube.com — Tags: [video, entertainment]
5. "Netflix" — https://netflix.com — Tags: [streaming, movies]
```

### 🏷️ Suggested Tags
- Development: dev, code, programming, tools  
- Entertainment: video, music, games, streaming  
- Work: work, productivity, business  
- Education: learning, courses, documentation

---

## 🎯 Success Criteria

### ✅ Core Features
- [ ] Add/Edit/Delete bookmarks  
- [ ] Tag system working  
- [ ] Real-time search  
- [ ] Responsive UI  
- [ ] Chrome import

### ✅ Advanced Features
- [ ] Google Drive sync (optional)  
- [ ] Automatic tag suggestions  
- [ ] Large-list performance  
- [ ] Tag management

### ✅ UX
- [ ] Intuitive interface  
- [ ] Proper visual feedback  
- [ ] No JavaScript errors  
- [ ] Fast loading

---

## 📞 Support
- Email: chronomark.support@gmail.com  
- Documentation: inside `store-assets/`  
- Source Code: available for audit

---

⏱️ Estimated test time: 15–20 minutes  
🔧 Version under test: 1.0.0  
📅 Last update: January 2024
