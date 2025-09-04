# Chrome Web Store Publishing Guide

## 📋 Prerequisites

### 1. Developer Account
- [ ] Active Google Account
- [ ] One-time $5 USD fee paid on the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [ ] Identity verification completed

### 2. Extension Ready
- [ ] OAuth configured and working
- [ ] Complete tests performed
- [ ] Final version built
- [ ] ZIP file created

## 🛠️ Preparation for Publishing

### Available Makefile Commands
```bash
# Create package for Chrome Web Store
make package

# Validate extension before publishing
make validate-store

# Prepare all necessary assets
make prepare-store-assets
```

## 📦 Required Assets

### 1. Icons (✅ Already available)
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px  
- `icon128.png` - 128x128px

### 2. Screenshots (Required)
- **Size:** 1280x800px or 640x400px
- **Format:** PNG or JPEG
- **Quantity:** Minimum 1, maximum 5
- **Content:** Show the main features of the extension

### 3. Tile Icon (Optional)
- **Size:** 440x280px
- **Format:** PNG
- **Use:** Spotlight on the Chrome Web Store

### 4. Promotional Images (Optional)
- **Small tile:** 440x280px
- **Large tile:** 920x680px
- **Marquee:** 1400x560px

## 📝 Listing Information

### Basic Information
- **Name:** ChronoMark - Tag & Sync Bookmarks
- **Short Description:** Organize and sync your bookmarks with smart tags and Google Drive backup
- **Category:** Productivity
- **Language:** Portuguese (Brazil) / English

### Detailed Description
```
🔖 ChronoMark - Organize your bookmarks like never before!

✨ KEY FEATURES:
• 🏷️ Smart tagging system for organization
• ☁️ Automatic synchronization with Google Drive
• 🔍 Advanced search by title, URL, and tags
• 📱 Modern and responsive interface
• 🚀 Optimized performance with virtualization
• 🔒 Secure and private data

🎯 FEATURES:
• Add custom tags to your bookmarks
• Automatically sync with Google Drive
• Quickly search for any bookmark
• Manage tags with ease
• Automatic backup of your data
• Clean and intuitive interface

🔧 HOW TO USE:
1. Install the extension
2. Set up synchronization with Google Drive
3. Start organizing your bookmarks with tags
4. Enjoy fast and efficient searching!

🛡️ PRIVACY:
Your data is kept secure in your personal Google Drive. We do not collect or share personal information.

💡 SUPPORT:
Problems or suggestions? Get in touch via GitHub.
```

## 🔒 Privacy and Permissions

### Permissions Used
- `bookmarks` - Access to Chrome bookmarks
- `storage` - Local storage for settings
- `identity` - Authentication with Google Drive
- `https://www.googleapis.com/*` - Google Drive API

### Justifications
- **bookmarks:** Required to read and organize the user's bookmarks
- **storage:** Store settings and local cache
- **identity:** OAuth authentication for synchronization
- **googleapis.com:** Communication with the Google Drive API

## 📋 Publishing Checklist

### Before Submitting
- [ ] Extension tested in different scenarios
- [ ] OAuth working correctly
- [ ] Screenshots created
- [ ] Description reviewed
- [ ] Privacy policy created
- [ ] ZIP file generated with `make package`
- [ ] Version in manifest.json updated

### During Submission
- [ ] Upload the ZIP file
- [ ] Fill in all information
- [ ] Upload screenshots
- [ ] Privacy settings configuration
- [ ] Final review
- [ ] Submit for review

### After Submission
- [ ] Wait for review (1-3 business days)
- [ ] Respond to any change requests
- [ ] Publication approved
- [ ] Monitor reviews and feedback

## 🚀 Publishing Process

### 1. Prepare Package
```bash
# Generate final version
make build

# Create ZIP package
make package
```

### 2. Access Developer Dashboard
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Log in with your Google account
3. Pay the $5 USD fee (if not already paid)

### 3. Create New Listing
1. Click "Add new item"
2. Upload the ZIP file
3. Fill in all required information
4. Add screenshots
5. Configure privacy and permissions

### 4. Submit for Review
1. Review all information
2. Click "Submit for review"
3. Wait for approval (1-3 business days)

## ⚠️ Potential Issues

### Common Rejections
- **Unnecessary permissions:** Justify all permissions
- **Privacy policy:** Must be clear and accessible
- **Limited functionality:** Demonstrate real value
- **Inadequate screenshots:** Show real features

### Solutions
- Review privacy policy
- Improve screenshots
- Better document the features
- Respond quickly to requests

## 📞 Support

- **Chrome Web Store Help:** https://support.google.com/chrome_webstore/
- **Developer Policies:** https://developer.chrome.com/docs/webstore/program-policies/
- **GitHub Issues:** For technical issues with the extension

---

**Next steps:**
1. Run `make prepare-store-assets` to prepare all assets
2. Run `make validate-store` for final validation
3. Run `make package` to create the ZIP file
4. Follow the publishing process above
