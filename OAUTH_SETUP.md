# OAuth Setup Guide for ChronoMark

## Error: redirect_uri_mismatch

If you're encountering the error "Error 400: redirect_uri_mismatch", this means the redirect URI configured in your Google Cloud Console OAuth application doesn't match the one being used by the Chrome extension.

## Root Cause

Chrome extensions use a specific redirect URI format that must be configured in the Google Cloud Console. The redirect URI for Chrome extensions follows this pattern:

```
https://<EXTENSION_ID>.chromiumapp.org/
```

Where `<EXTENSION_ID>` is your actual Chrome extension ID.

## How to Fix

### Step 1: Get Your Extension ID

1. Load your extension in Chrome (Developer mode)
2. Go to `chrome://extensions/`
3. Find your ChronoMark extension
4. Copy the Extension ID (it looks like: `abcdefghijklmnopqrstuvwxyz123456`)

### Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID (the one matching your manifest.json client_id)
4. Click **Edit** on your OAuth client
5. **IMPORTANT**: Make sure the application type is **Chrome Extension** (not Web application)
6. In the **Application ID** field, enter your Extension ID from Step 1
7. **Note**: You DON'T need to add redirect URIs manually - Chrome handles this automatically

### Step 3: Save and Test

1. Click **Save** in Google Cloud Console
2. Wait a few minutes for changes to propagate
3. Test the authentication in your extension

## Example

If your extension ID is `abcdefghijklmnopqrstuvwxyz123456`, then:
1. Set **Application Type** to **Chrome Extension**
2. Set **Application ID** to `abcdefghijklmnopqrstuvwxyz123456`
3. Chrome will automatically handle the redirect URI: `https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/`

## Current Configuration

Your current OAuth client ID in manifest.json is:
```
214396245139-vpq9cr8hqh4tivh03nfos6lmeosrnsdn.apps.googleusercontent.com
```

Make sure this matches the client ID in your Google Cloud Console project.

## Troubleshooting

### Still Getting Errors?

1. **Double-check the Extension ID**: Make sure you copied the correct extension ID
2. **Wait for Propagation**: Google Cloud changes can take up to 5 minutes to take effect
3. **Clear Extension Storage**: Go to `chrome://extensions/`, click on ChronoMark details, and clear storage
4. **Reload Extension**: Disable and re-enable the extension

### Testing Authentication

Use the test files included in the project:
- Open `test-auth.html` in your extension popup
- Click "Test Authentication" to verify OAuth is working

### Common Mistakes

1. **Wrong Extension ID**: Using the wrong extension ID in the redirect URI
2. **Missing Protocol**: Forgetting `https://` in the redirect URI
3. **Wrong Domain**: Using `.apps.googleusercontent.com` instead of `.chromiumapp.org`
4. **Trailing Slash**: The redirect URI should end with `/`

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify your Google Cloud Console project has the necessary APIs enabled:
   - Google Drive API
   - Google+ API (for user info)
3. Ensure your OAuth consent screen is properly configured

## Security Notes

- Never share your client ID or client secret publicly
- The redirect URI must exactly match what's configured in Google Cloud Console
- Chrome extensions don't use client secrets for security reasons