# ✅ Publication Checklist - Chrome Web Store

## 🚨 Identified Issues and Fixes

Based on the Chrome Web Store publishing errors, follow this step-by-step guide to resolve them and complete your submission.

---

## 1) 📧 Configure Contact Email

### ❌ Problem
- "You must provide a contact email before you can publish any item"
- "You must verify your contact email before you can publish any item"

### ✅ Solution
1. Open the Chrome Web Store Developer Console: https://chrome.google.com/webstore/devconsole/
2. Go to the Account tab
3. Add your contact email
4. Verify the email (check your inbox)
5. Click the verification link you receive

---

## 2) 🔒 Fill the Privacy Practices Tab

### ❌ Problems
- Justifications for all permissions are required
- Single purpose description is required
- Certification of compliance is required

### ✅ Solution — Copy and paste the info below

#### Single Purpose Description
```
ChronoMark is a smart bookmark manager that helps users organize, sync, and find favorites using custom tags and AI-powered features. Its single purpose is to improve the bookmark management experience through smart tag organization, secure Google Drive synchronization, advanced search with AI, and a modern interface.
```

#### Justification for alarms
```
Used for periodic automatic synchronization with Google Drive, temporary cache cleanup, and data integrity checks. No alarms are used for tracking or data collection.
```

#### Justification for bookmarks
```
Essential for the extension’s core functionality. Allows reading existing Chrome bookmarks for import, creating new bookmarks organized by tags, updating bookmarks with additional metadata, and syncing bookmarks across devices. Without this permission, the extension cannot fulfill its primary purpose.
```

#### Justification for host permission use
```
Required for secure communication with the Google Drive API for optional synchronization, uploading/downloading bookmark backup files, and validating OAuth2 authentication. Only specific Google API endpoints (googleapis.com) are accessed — never arbitrary websites.
```

#### Justification for identity
```
Used exclusively for OAuth2 authentication with Google Drive for optional synchronization, obtaining a secure access token, and identifying the user for cross-device sync. No personal identity data is collected or stored permanently. Only temporary tokens are used.
```

#### Justification for remote code use
```
Used to load AI libraries (Google Gemini) for tag suggestions, Google Drive API security updates, and dynamic UI components. All remote code is loaded only from trusted sources (Google APIs) and strictly for declared functionality.
```

#### Justification for storage
```
Required to store user settings (theme preferences, sync settings), local cache of tags and bookmark metadata, encrypted Google Drive authentication tokens, and a sync history to avoid duplicates. All data is stored locally on the user’s device.
```

#### Justification for tabs
```
Required to detect when the user visits a site already bookmarked, to suggest tags based on the current page, and to facilitate quick bookmarking of the active tab. Only basic metadata (URL, title) is accessed — never the page content.
```

---

## 3) ✅ Certification of Compliance

### ❌ Problem
- "To publish your item, you must certify that your data usage complies with our Developer Program Policies"

### ✅ Solution
1. In the Privacy practices tab
2. Check the certification checkbox
3. Confirm that:
   - No unnecessary personal data is collected
   - Data remains on the user’s device or personal Google Drive
   - No browsing activity tracking
   - No third-party sharing
   - Compliance with GDPR/LGPD

---

## 4) 💾 Save Draft

### ✅ Action
1. After filling out all information
2. Click "Save Draft"
3. Ensure all fields are filled
4. Wait for confirmation that your draft was saved

---

## 5) 🚀 Submit for Review

### ✅ Final Steps
1. Review all information
2. Confirm all ❌ have become ✅
3. Click "Submit for Review"
4. Wait for approval (1–3 business days typical)

---

## 6) 🧪 Fill Test Instructions

### ❌ Problem
- The Chrome Web Store requires test instructions for features that need login/setup

### ✅ Solution
1. In your item’s Test instructions tab
2. Paste the content below:

```
🧪 TEST INSTRUCTIONS — ChronoMark Extension

🔐 TEST ACCOUNT:
• Email: chronomark.test@gmail.com
• Password: [REMOVIDO POR SEGURANÇA]
• Google Drive: OAuth-scoped for testing

🚀 INITIAL SETUP:
1. Install the extension in developer mode
2. Click the ChronoMark icon in the toolbar
3. The main interface should open with the bookmark list

🧪 CORE TESTS:
1) BASIC MANAGEMENT:
   - Add: Click "+", fill title/URL/tags
   - Edit: Click an existing bookmark, modify
   - Search: Type into the search bar and verify filtering

2) TAG SYSTEM:
   - Create bookmarks with multiple tags
   - Click a tag to filter bookmarks
   - Settings → Manage Tags to rename/delete

3) SYNC (OPTIONAL):
   - Settings → Automatic Sync → Enable
   - Sign in with the test account
   - Verify "Last synced" is updated

4) IMPORT:
   - Settings → Import from Chrome
   - Verify existing Chrome bookmarks are imported

⏱️ ESTIMATED TIME: 15–20 minutes
🎯 ESSENTIAL FEATURES: Testable without complex setup
📞 SUPPORT: chronomark.support@gmail.com
```

---

## 📋 Final Checklist

- [ ] Contact email added
- [ ] Contact email verified
- [ ] Single purpose description filled
- [ ] Justification for alarms
- [ ] Justification for bookmarks
- [ ] Justification for host permissions
- [ ] Justification for identity
- [ ] Justification for remote code
- [ ] Justification for storage
- [ ] Justification for tabs
- [ ] Certification of compliance checked
- [ ] Test instructions filled
- [ ] Draft saved
- [ ] Submitted for review

---

## 🆘 Useful Commands

```bash
# View organized privacy justifications
make privacy-justifications

# View store information
make store-info

# Full publishing guide
make store-help
```

---

🎯 After completing all steps, your extension will be ready for publication!