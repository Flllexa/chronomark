# Fix: Update App Name from "MyApp" to "ChronoMark" in Google Cloud Console

## Problem
The app name in Google Cloud Console configurations is showing as "MyApp" instead of the correct name "ChronoMark". This can cause confusion and inconsistency in OAuth consent screens and API configurations.

## Solution Steps

### 1. Update OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your ChronoMark project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Click **Edit App**
5. Update the following fields:
   - **App name**: Change from "MyApp" to **"ChronoMark"**
   - **App domain** (if applicable): Update to reflect ChronoMark branding
   - **Application homepage** (if applicable): Update to ChronoMark repository or website
6. Click **Save and Continue**

### 2. Update OAuth 2.0 Client ID Names

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client IDs
3. For each Client ID, click the **Edit** (pencil) icon
4. Update the **Name** field:
   - Change from "MyApp" or any generic name to **"ChronoMark Extension"**
   - For development: **"ChronoMark Extension (Development)"**
   - For production: **"ChronoMark Extension (Production)"**
5. Click **Save**

### 3. Update API Key Names (if applicable)

1. In **APIs & Services** → **Credentials**
2. If you have API keys, click **Edit** on each
3. Update the **Name** field to include "ChronoMark"
4. Click **Save**

### 4. Update Service Account Names (if applicable)

1. Go to **IAM & Admin** → **Service Accounts**
2. For any service accounts related to the project:
   - Click **Edit** (pencil icon)
   - Update **Service account name** to include "ChronoMark"
   - Update **Description** to reflect ChronoMark functionality
3. Click **Save**

### 5. Update Project Information

1. Go to **IAM & Admin** → **Settings**
2. In **Project Info** section:
   - Verify **Project name** is "ChronoMark Extension" or similar
   - Update **Project ID** if needed (note: this may affect existing configurations)

### 6. Verify Changes

After making these updates:

1. **Test OAuth Flow**:
   ```bash
   make oauth-test
   ```

2. **Check Consent Screen**:
   - The OAuth consent screen should now show "ChronoMark" instead of "MyApp"
   - Users will see the correct app name when granting permissions

3. **Verify API Calls**:
   - Test Google Drive sync functionality
   - Ensure all API calls work correctly with updated names

## Files That May Need Updates

### Local Configuration Files
- `manifest.json` - Already correctly shows "ChronoMark - Tag & Sync Bookmarks"
- `manifest-development.json` - Already correctly configured
- `manifest-production.json` - Already correctly configured

### Documentation Files (Already Correct)
- `GOOGLE_CLOUD_SETUP.md` - Already references "ChronoMark"
- `OAUTH_SETUP.md` - Already references "ChronoMark"
- `README.md` - Already uses correct name

## Important Notes

### OAuth Consent Screen Impact
- Users who have already granted permissions may see the updated name on next authorization
- Existing tokens remain valid after name changes
- No need to revoke/reissue tokens for name changes only

### API Quotas and Monitoring
- API quotas and usage statistics will continue under the same project
- Monitoring dashboards may show the updated names after changes propagate

### Propagation Time
- Changes to OAuth consent screen: **Immediate**
- Changes to credential names: **Immediate**
- Changes to project names: **Up to 24 hours** for full propagation

## Verification Checklist

- [ ] OAuth consent screen shows "ChronoMark" as app name
- [ ] All OAuth 2.0 Client IDs have "ChronoMark" in their names
- [ ] API keys (if any) have "ChronoMark" in their names
- [ ] Service accounts (if any) reference "ChronoMark"
- [ ] Project information is correctly named
- [ ] OAuth flow works correctly with updated names
- [ ] Google Drive sync functionality works
- [ ] No "MyApp" references remain in Google Cloud Console

## Troubleshooting

### If OAuth Stops Working After Changes
1. Verify Client IDs in manifest files match Google Cloud Console
2. Check that Extension IDs are correctly configured
3. Wait 5-10 minutes for changes to propagate
4. Clear browser cache and reload extension

### If Users Report Different App Name
- Changes to OAuth consent screen may take time to appear for all users
- Users may need to re-authorize to see updated name
- Consider communicating the name update to users if needed

## Security Considerations

- Name changes do not affect security of existing tokens
- No need to rotate Client IDs or secrets for name changes only
- Existing user permissions remain valid
- Monitor for any unexpected authentication issues after changes

---

**Note**: This fix addresses cosmetic/branding issues in Google Cloud Console. All functional aspects of the extension should continue working normally after these updates.
