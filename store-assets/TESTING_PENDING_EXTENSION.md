# 🧪 How to Test an Extension Pending Approval

## 📋 Status: Extension Submitted for Review

When your extension is “pending review” in the Chrome Web Store, you still have several ways to continue testing.

---

## 🔧 Method 1: Local Testing (Recommended)

### ✅ Advantages
- Immediate testing  
- Full control over updates  
- No feature limitations

### 📋 Steps
1. Keep Local Code Updated:
   ```bash
   # Generate an updated package
   make package
   ```
2. Install in Developer Mode:  
   Chrome → Extensions → Developer Mode (ON) → “Load unpacked” → Select the folder
3. Test Features:  
   Use `make test-instructions` as a guide and verify OAuth and sync

---

## 🌐 Method 2: Chrome Web Store Test Link

### ⚠️ Limitations
- Available only during review  
- Private link (not public)  
- Some features may be limited

### 📋 How to Access
1. Developer Console:  
   Open https://chrome.google.com/webstore/devconsole/ and locate your item
2. Test Link:  
   Look for “Test Link” or “Preview” when status is “Pending Review” or “In Review”  
   Link format: `chrome.google.com/webstore/detail/[ID]?authuser=0`
3. Install via Link:  
   Open in Chrome and click “Add to Chrome” (if available)

---

## 👥 Method 3: Trusted Testers

### 📋 Share for Testing
1. Generate Test Package:
   ```bash
   make package
   # Output: chronomark-extension.zip
   ```
2. Send Instructions:  
   Provide the ZIP file and manual installation steps.  
   Reference `make test-instructions` for guidance.
3. Collect Feedback:  
   Create a simple feedback form, track bugs, and prepare follow-ups.

---

## 📊 During the Review Period

### ⏳ Approval Timeframes
- First submission: 1–7 business days  
- Updates: 1–3 business days  
- Complex extensions: up to 14 days

### 📧 Monitor Status
1. Email Notifications:  
   Google will send updates via email (check spam/promo tabs)
2. Developer Console:  
   Check status regularly; respond to any required changes

### 🔄 If Rejected
1. Read the detailed feedback  
2. Fix identified issues  
3. Resubmit a new version  
4. Continue local testing

---

## 🛠️ Helpful Commands During Testing

```bash
# Build a distributable package
make package

# View test instructions
dmake test-instructions

# Review privacy justifications
make privacy-justifications

# Publication checklist
make publication-checklist

# Store information
make store-info
```

---

## 🚨 Common Issues and Fixes

### ❌ “Extension doesn’t appear in the store”
- Cause: still under review  
- Fix: wait for approval or test locally

### ❌ “Test link does not work”
- Cause: item not yet processed  
- Fix: use manual local installation

### ❌ “OAuth does not work”
- Cause: callback URLs not approved  
- Fix: verify local OAuth configuration

---

## 📋 Review Checklist

- [ ] 100% local testing passes  
- [ ] All core features tested  
- [ ] OAuth and sync verified  
- [ ] Responsive UI and no visual bugs  
- [ ] Good performance with many bookmarks  
- [ ] Chrome import working  
- [ ] Tag system operational  
- [ ] Real-time search functional  
- [ ] Settings persisted correctly  
- [ ] No errors in the Chrome console

---

## 📞 Next Steps

1. Continue local development  
2. Prepare fixes if needed  
3. Wait for Google’s feedback  
4. Plan the launch strategy  
5. Prepare end-user documentation

---

⏱️ Recommendation: use local testing as the primary method during review  
🔧 Keep the code updated and tested  
📧 Monitor Google emails for updates