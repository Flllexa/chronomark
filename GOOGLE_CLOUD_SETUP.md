# Google Cloud Console Setup Guide for ChronoMark

This guide walks you through setting up Google Cloud Console for ChronoMark's OAuth authentication and Google Drive integration.

## Prerequisites

- Google account
- Chrome browser with Developer mode enabled
- ChronoMark extension loaded in Chrome

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: `ChronoMark Extension`
4. Click **Create**

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Google Drive API**
   - **Google+ API** (for user profile information)

### Enable Google Drive API
1. Search "Google Drive API"
2. Click on **Google Drive API**
3. Click **Enable**

### Enable Google+ API
1. Search "Google+ API"
2. Click on **Google+ API**
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Click **Create**
4. Fill in the required fields:
   - **App name**: `ChronoMark`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On **Scopes** page, click **Add or Remove Scopes**
7. Add these scopes:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
8. Click **Update** → **Save and Continue**
9. Skip **Test users** (click **Save and Continue**)
10. Review and click **Back to Dashboard**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth 2.0 Client ID**
3. **IMPORTANTE**: Choose **Chrome extension** as application type (NOT Web application)
4. Enter **Name**: `ChronoMark Extension`
5. **Important**: Leave **Application ID** field empty for now
6. Click **Create**
7. Copy the **Client ID** (you'll need this for manifest.json)

## Step 5: Get Your Extension ID

1. Open Chrome and go to `chrome://extensions/`
2. Make sure **Developer mode** is enabled (toggle in top right)
3. Load your ChronoMark extension:
   - Click **Load unpacked**
   - Select your project's `dist` folder (run `make build` first)
4. Copy the **Extension ID** (long string like `abcdefghijklmnopqrstuvwxyz123456`)

## Step 6: Update OAuth Credentials with Extension ID

1. Go back to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click **Edit** on your OAuth 2.0 Client ID
3. In **Application ID** field, enter your Extension ID from Step 5
4. **Note**: For Chrome Extensions, you DON'T need to manually add redirect URIs - Chrome handles this automatically when you specify the Application ID
5. Click **Save**

## Step 7: Update manifest.json

1. Open your project's `manifest.json` file
2. Update the `client_id` in the `oauth2` section:
   ```json
   "oauth2": {
     "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/drive",
       "https://www.googleapis.com/auth/userinfo.email",
       "https://www.googleapis.com/auth/userinfo.profile"
     ]
   }
   ```
3. Replace `YOUR_CLIENT_ID` with the Client ID from Step 4

## Step 8: Test the Setup

1. Rebuild your extension: `make build`
2. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on ChronoMark
3. Test OAuth authentication:
   - Run `make oauth-test` to open the test page
   - Or open `test-auth.html` in your extension popup
   - Click "Test Authentication"

## Troubleshooting

### Common Issues

#### "redirect_uri_mismatch" Error
- **Cause**: Extension ID in redirect URI doesn't match actual extension ID
- **Fix**: Double-check Extension ID and update redirect URI in Google Cloud Console

#### "invalid_client" Error
- **Cause**: Client ID in manifest.json doesn't match Google Cloud Console
- **Fix**: Verify Client ID matches exactly

#### "access_denied" Error
- **Cause**: User denied permission or OAuth consent screen not properly configured
- **Fix**: Check OAuth consent screen configuration

### Verification Steps

1. **Check Extension ID**:
   ```bash
   # The redirect URI should be:
   https://YOUR_ACTUAL_EXTENSION_ID.chromiumapp.org/
   ```

2. **Verify Client ID**:
   ```bash
   make oauth-setup
   ```

3. **Test Authentication**:
   ```bash
   make oauth-test
   ```

### Getting Help

If you're still having issues:

1. Check browser console for detailed error messages
2. Verify all APIs are enabled in Google Cloud Console
3. Ensure OAuth consent screen is published (not in testing mode)
4. Try creating a new OAuth client ID if problems persist

## Security Best Practices

- Never commit your actual Client ID to public repositories
- Use environment variables or separate config files for sensitive data
- Regularly review and rotate OAuth credentials
- Monitor API usage in Google Cloud Console

## API Quotas and Limits

- Google Drive API: 1,000 requests per 100 seconds per user
- Google+ API: 10,000 requests per day
- Monitor usage in **APIs & Services** → **Quotas**

## Next Steps

Once OAuth is working:
1. Test bookmark syncing functionality
2. Verify Google Drive file creation
3. Test import from Chrome bookmarks
4. Configure automatic sync settings

For ongoing OAuth issues, see `OAUTH_SETUP.md` for detailed troubleshooting steps.