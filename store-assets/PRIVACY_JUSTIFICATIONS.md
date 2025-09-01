# Privacy Justifications — ChronoMark

## Single Purpose Description

ChronoMark is an intelligent bookmark manager that helps users organize, synchronize, and find their favorites using custom tags and (optional) AI assistance.

The sole purpose of the extension is to improve the bookmark management experience by providing:
- Organization via smart tags
- Optional and secure Google Drive synchronization
- Fast search
- A modern, intuitive interface

---

## Permission Justifications

### 1) bookmarks — Bookmark Access
Required for the core functionality of the extension. Allows:
- Reading existing Chrome bookmarks for import
- Creating new bookmarks organized with tags
- Updating bookmarks with additional metadata
- Synchronizing bookmarks across devices

Without this permission the extension cannot fulfill its main purpose.

### 2) storage — Local Storage
Used to:
- Store user settings (theme, sync preferences)
- Cache tags and bookmark metadata
- Store Google Drive authentication tokens (encrypted)
- Keep sync history to prevent duplicates

All data is stored locally on the user’s device.

### 3) identity — User Identity
Used exclusively to:
- Perform OAuth2 authentication with Google Drive (optional sync)
- Obtain a secure access token for Google Drive API
- Identify the user to sync across devices

No personal identity data is permanently collected; only temporary tokens are used.

### 4) host permission (https://www.googleapis.com/*) — Google APIs
Required to:
- Communicate securely with Google Drive API for synchronization
- Upload/download backup files with bookmarks
- Verify OAuth2 authentication

Only specific Google API endpoints are accessed.

### 5) alarms — Scheduling
Used for:
- Periodic automatic synchronization with Google Drive
- Clearing temporary caches
- Data integrity checks

No alarms are used for tracking.

### 6) tabs — Tab Access
Required to:
- Detect when the user visits a site that already exists as a bookmark
- Suggest tags based on the current page metadata
- Enable quick-add from the active tab

Only basic metadata (URL, title) is accessed — never page content.

### 7) remote code — Remote Code
Used to:
- Load AI libraries (e.g., Google Gemini) for tag suggestions (optional)
- Security updates for Google Drive API usage
- Lazy-load UI components when applicable

All remote code is loaded only from trusted sources (e.g., Google APIs) and strictly for declared features.

---

## Policy Compliance

### Data Collection
- ✅ No personal data is collected beyond what is necessary to operate
- ✅ Data stays on the user’s device and/or personal Google Drive
- ✅ No browsing activity tracking
- ✅ No sharing with third parties

### Data Usage
- ✅ Data is used only for the declared features
- ✅ Sync is optional — user controlled
- ✅ Full transparency — open-source code
- ✅ User control — features can be disabled

### Security
- ✅ Authentication tokens are encrypted
- ✅ HTTPS used for all communications
- ✅ Standard Google OAuth2 flow
- ✅ Secure storage via Chrome Storage APIs

---

## Compliance Certification

We certify that ChronoMark is fully compliant with the Chrome Web Store Developer Program Policies:

1. ✅ All permissions are justified and necessary  
2. ✅ No unnecessary data collection  
3. ✅ User privacy is respected  
4. ✅ Features are transparent and documented  
5. ✅ Code is auditable and secure  
6. ✅ Compliance with GDPR and LGPD

---

**Date**: January 2025  
**Developer**: ChronoMark Team  
**Version**: 1.0.0  
**Contact**: support@chronomark.com