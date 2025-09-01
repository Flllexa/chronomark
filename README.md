<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fmzZv0gnd8-MEa2sscg91SBt-N46LwkE

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   make install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Build the extension:
   ```bash
   make build
   ```

4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select the `dist` folder

## OAuth Setup

**Important**: If you encounter "Error 400: redirect_uri_mismatch", you need to configure OAuth properly.

### Quick Fix
```bash
make oauth-help
```

### Detailed Setup
1. Follow the [Google Cloud Console Setup Guide](GOOGLE_CLOUD_SETUP.md)
2. For troubleshooting, see [OAuth Setup Guide](OAUTH_SETUP.md)
3. Test your setup: `make oauth-test`

### Available Commands
```bash
make help           # Show all available commands
make oauth-help     # OAuth troubleshooting help
make oauth-setup    # Show OAuth configuration steps
make oauth-test     # Test OAuth authentication
```
