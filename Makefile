.PHONY: install test build clean dist package help oauth-help oauth-test oauth-setup oauth-extension-id oauth-debug oauth-troubleshoot oauth-fix-redirect oauth-fix-client-id oauth-update-client-id validate-store prepare-store-assets store-help examples huggingface-setup huggingface-start huggingface-stop gemini-setup store-preview test-pr

# Default target
all: install build

# Install dependencies
install:
	npm install

# Test the project (no tests currently defined in package.json)
test:
	@echo "No tests currently defined in package.json"

# Test a Pull Request by creating a local branch
test-pr:
	@if [ -z "$(PR)" ]; then \
		echo "❌ Error: PR number not provided"; \
		echo "Usage: make test-pr PR=1"; \
		exit 1; \
	fi
	@echo "🔄 Setting up test environment for PR #$(PR)..."
	@echo "📡 Configuring git to fetch PRs..."
	@git config --add remote.origin.fetch '+refs/pull/*/head:refs/remotes/origin/pr/*' 2>/dev/null || true
	@echo "📥 Fetching PR #$(PR)..."
	@git fetch origin
	@echo "🌿 Creating test branch for PR #$(PR)..."
	@git checkout -b test-pr-$(PR) origin/pr/$(PR)
	@echo ""
	@echo "✅ Test branch 'test-pr-$(PR)' created successfully!"
	@echo "📋 Recent commits on this branch:"
	@git log --oneline -3
	@echo ""
	@echo "🧪 NEXT STEPS:"
	@echo "   • Test the application normally"
	@echo "   • Verify new features work correctly"
	@echo "   • Check for any breaking changes"
	@echo ""
	@echo "🔄 When finished testing:"
	@echo "   • Return to master: git checkout master"
	@echo "   • Delete test branch: git branch -D test-pr-$(PR)"

# Build the project (outputs to dist folder)
build:
	@echo "📋 Using development manifest..."
	cp manifest-development.json manifest.json
	npm run build
	npm run dist
	@echo "Build completed - files available in dist/ folder"

# Clean build artifacts
clean:
	npm run clean
	rm -f background.js index.js chronomark-extension.zip

# Create distribution folder with only necessary extension files
dist:
	npm run dist

# Package the extension for distribution
package:
	@echo "📋 Using production manifest..."
	cp manifest-production.json manifest.json
	npm run build
	npm run dist
	@echo "Build completed with production manifest - files available in dist/ folder"
	@echo "📦 Creating package for Chrome Web Store..."
	@mkdir -p dist
	@echo "📋 Checking required files..."
	@test -f dist/manifest.json || (echo "❌ manifest.json not found" && exit 1)
	@test -f dist/index.html || (echo "❌ index.html not found" && exit 1)
	@test -f dist/icon16.png || (echo "❌ icon16.png not found" && exit 1)
	@test -f dist/icon48.png || (echo "❌ icon48.png not found" && exit 1)
	@test -f dist/icon128.png || (echo "❌ icon128.png not found" && exit 1)
	@echo "✅ All required files found"
	@cd dist && zip -r ../chronomark-extension.zip . -x "*.DS_Store" "*.git*" "*.map" "node_modules/*"
	@echo "✅ Package created: chronomark-extension.zip"
	@ls -lh chronomark-extension.zip
	@echo "📋 Next step: Go to https://chrome.google.com/webstore/devconsole/"

# OAuth setup and troubleshooting commands
oauth-help:
	@echo "OAuth Setup and Troubleshooting Commands:"
	@echo "  oauth-help   - Show OAuth help and setup instructions"
	@echo "  oauth-test   - Open OAuth test page in browser"
	@echo "  oauth-setup  - Show OAuth configuration steps"
	@echo ""
	@echo "If you're getting 'redirect_uri_mismatch' error:"
	@echo "1. Load the extension in Chrome (Developer mode)"
	@echo "2. Copy the Extension ID from chrome://extensions/"
	@echo "3. Add this redirect URI in Google Cloud Console:"
	@echo "   https://YOUR_EXTENSION_ID.chromiumapp.org/"
	@echo ""
	@echo "For detailed instructions, see: OAUTH_SETUP.md"

oauth-test:
	@echo "🧪 Testing OAuth configuration..."
	@echo "📋 Required checks:"
	@echo "   1. Extension loaded in chrome://extensions/"
	@echo "   2. Developer mode enabled"
	@echo "   3. Client ID configured in Google Cloud Console"
	@echo ""
	@echo "🌐 Opening OAuth test page..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open file://$(PWD)/test-auth.html; \
	elif command -v open > /dev/null; then \
		open file://$(PWD)/test-auth.html; \
	else \
		echo "❌ Could not open automatically"; \
		echo "📂 Open manually: file://$(PWD)/test-auth.html"; \
	fi
	@echo ""
	@echo "🔍 If you get 'bad client id' error:"
	@echo "   → Run: make oauth-fix-client-id"
	@echo "🔍 If you get 'redirect_uri_mismatch' error:"
	@echo "   → Run: make oauth-fix-redirect"

oauth-setup:
	@echo "OAuth Setup Steps:"
	@echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
	@echo "2. Navigate to APIs & Services > Credentials"
	@echo "3. Find OAuth 2.0 Client ID: <ID>.apps.googleusercontent.com"
	@echo "4. IMPORTANT: Select 'Chrome Extension' as application type"
	@echo "5. IMPORTANT: Use 'ChronoMark Extension' as name (NOT 'MyApp')"
	@echo "6. In the 'Application ID' field, paste the Extension ID"
	@echo ""
	@echo "Current client_id in manifest.json:"
	@grep -A 1 '"client_id"' manifest.json || echo "Could not find client_id in manifest.json"
	@echo ""
	@echo "To get Extension ID: make oauth-extension-id"
	@echo "For detailed guide, see: OAUTH_SETUP.md"
	@echo "To fix app name issues, see: FIX_GOOGLE_APP_NAME.md"

oauth-extension-id:
	@echo "To get the Extension ID:"
	@echo "1. Open Chrome and go to chrome://extensions/"
	@echo "2. Enable 'Developer mode' (top right corner)"
	@echo "3. Load the extension (run make build first if needed)"
	@echo "4. Copy the Extension ID that appears below the extension name"
	@echo "5. Paste this ID in the 'Application ID' field in Google Cloud Console"
	@echo ""
	@echo "Extension ID format looks like: abcdefghijklmnopqrstuvwxyz123456"

oauth-debug:
	@echo "=== OAUTH DIAGNOSIS ==="
	@echo "1. Client ID in manifest.json:"
	@grep -A 1 '"client_id"' manifest.json || echo "   ❌ Client ID not found"
	@echo ""
	@echo "2. Required checks:"
	@echo "   ✓ Extension built? (make build)"
	@echo "   ✓ Extension loaded in Chrome?"
	@echo "   ✓ Extension ID copied from chrome://extensions/?"
	@echo "   ✓ Google Cloud Console configured as 'Chrome Extension'?"
	@echo "   ✓ Application ID in Google Cloud Console = Extension ID?"
	@echo ""
	@echo "3. Steps to fix 'Error 400: redirect_uri_mismatch':"
	@echo "   a) Go to: https://console.cloud.google.com/apis/credentials"
	@echo "   b) Find Client ID: nbimliadaeimcfkngknobflgnkneiddl"
	@echo "   c) Click 'Edit'"
	@echo "   d) Make sure 'Application type' = 'Chrome Extension'"
	@echo "   e) Paste Extension ID in 'Application ID' field"
	@echo "   f) Save changes"
	@echo ""
	@echo "4. To test: make oauth-test"
	@echo "5. To get Extension ID: make oauth-extension-id"
	@echo "6. For detailed troubleshooting: make oauth-troubleshoot"

oauth-troubleshoot:
	@echo "📋 Opening detailed troubleshooting guide..."
	@echo "📄 File: OAUTH_TROUBLESHOOTING.md"
	@echo ""
	@echo "🔍 CRITICAL POINTS for Error 400:"
	@echo "1. Extension ID changes with each extension reload!"
	@echo "2. Must be 'Chrome Extension', not 'Web application'"
	@echo "3. Application ID = exact Extension ID"
	@echo "4. Wait 5-10min for changes to propagate"
	@echo ""
	@echo "⚠️  IF CLIENT_ID IS ALREADY CORRECT:"
	@echo "   → The problem is Extension ID in Google Cloud Console"
	@echo "   → Go to: https://console.cloud.google.com/apis/credentials"
	@echo "   → Edit Client ID: nbimliadaeimcfkngknobflgnkneiddl"
	@echo "   → Check that Application ID = current Extension ID"
	@echo "   → Current Extension ID: go to chrome://extensions/"
	@echo ""
	@echo "📖 For complete guide, see: OAUTH_TROUBLESHOOTING.md"

oauth-fix-redirect:
	@echo "🚨 FIX FOR Error 400: redirect_uri_mismatch"
	@echo ""
	@echo "STEP 1: Get current Extension ID"
	@echo "   1. Open: chrome://extensions/"
	@echo "   2. Enable 'Developer mode'"
	@echo "   3. Find 'ChronoMark - Tag & Sync Bookmarks'"
	@echo "   4. COPY the Extension ID (e.g.: abcdefghijklmnopqrstuvwxyz123456)"
	@echo ""
	@echo "STEP 2: Configure Google Cloud Console"
	@echo "   1. Open: https://console.cloud.google.com/apis/credentials"
	@echo "   2. Find Client ID: nbimliadaeimcfkngknobflgnkneiddl"
	@echo "   3. Click EDIT (pencil icon)"
	@echo "   4. Application type = 'Chrome Extension'"
	@echo "   5. Application ID = Extension ID copied in STEP 1"
	@echo "   6. Click SAVE"
	@echo ""
	@echo "STEP 3: Wait and test"
	@echo "   1. Wait 5-10 minutes"
	@echo "   2. Run: make oauth-test"
	@echo ""
	@echo "⚡ IMPORTANT: Extension ID changes with each extension reload!"

oauth-fix-client-id:
	@echo "🚨 FIX FOR 'bad client id' ERROR"
	@echo ""
	@echo "📋 Current Client ID in manifest.json:"
	@grep -o '"client_id":[^,]*' manifest.json || echo "   ❌ Client ID not found!"
	@echo ""
	@echo "🔍 DIAGNOSIS:"
	@echo "1. Client ID may be incorrect or not exist"
	@echo "2. Project may be disabled in Google Cloud"
	@echo "3. Required APIs may not be enabled"
	@echo ""
	@echo "🛠️  SOLUTIONS:"
	@echo ""
	@echo "OPTION A: Check existing Client ID"
	@echo "   1. Open: https://console.cloud.google.com/apis/credentials"
	@echo "   2. Look for current Client ID from manifest.json (shown above)"
	@echo "   3. If it doesn't exist, go to OPTION B"
	@echo "   4. If it exists, verify it's enabled and configured correctly"
	@echo ""
	@echo "OPTION B: Create new Client ID"
	@echo "   1. Open: https://console.cloud.google.com/apis/credentials"
	@echo "   2. Click '+ CREATE CREDENTIALS' → 'OAuth client ID'"
	@echo "   3. Application type = 'Chrome Extension'"
	@echo "   4. Name = 'ChronoMark Extension'"
	@echo "   5. Application ID = Extension ID (chrome://extensions/)"
	@echo "   6. COPY the new generated Client ID"
	@echo "   7. Run: make oauth-update-client-id CLIENT_ID=new_client_id"
	@echo ""
	@echo "OPTION C: Check enabled APIs"
	@echo "   1. Open: https://console.cloud.google.com/apis/library"
	@echo "   2. Enable: Google Drive API"
	@echo "   3. Enable: Google Sheets API (if needed)"
	@echo ""
	@echo "⚡ After any change, wait 5-10min and test with: make oauth-test"

oauth-check-app-name:
	@echo "🔍 CHECKING APP NAME CONFIGURATION"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📋 STEPS TO VERIFY APP NAME IN GOOGLE CLOUD CONSOLE:"
	@echo "1. Go to: https://console.cloud.google.com/apis/credentials/consent"
	@echo "2. Check that 'App name' shows 'ChronoMark' (NOT 'MyApp')"
	@echo "3. Go to: https://console.cloud.google.com/apis/credentials"
	@echo "4. Check that OAuth Client names include 'ChronoMark'"
	@echo ""
	@echo "🚨 IF YOU SEE 'MyApp' OR GENERIC NAMES:"
	@echo "   → Follow the guide: FIX_GOOGLE_APP_NAME.md"
	@echo "   → This affects user-facing OAuth consent screen"
	@echo ""
	@echo "✅ LOCAL CONFIGURATION (should be correct):"
	@echo "   Extension name in manifest.json:"
	@grep -o '"name":[^,]*' manifest.json || echo "   ❌ Name not found!"
	@echo ""

oauth-update-client-id:
	@if [ -z "$(CLIENT_ID)" ]; then \
		echo "❌ Error: CLIENT_ID not provided"; \
		echo "Usage: make oauth-update-client-id CLIENT_ID=your_new_client_id"; \
		exit 1; \
	fi
	@echo "🔄 Updating Client ID in manifest.json..."
	@echo "📋 Previous Client ID:"
	@grep -o '"client_id":[^,]*' manifest.json || echo "   ❌ Client ID not found!"
	@sed -i 's/"client_id":"[^"]*"/"client_id":"$(CLIENT_ID)"/g' manifest.json
	@echo "📋 Updated Client ID:"
	@grep -o '"client_id":[^,]*' manifest.json
	@echo "✅ Client ID updated successfully!"
	@echo "🔨 Building extension..."
	@make build
	@echo "⚡ Now reload extension in chrome://extensions/"
	@echo "🧪 Test with: make oauth-test"

# Chrome Web Store commands
validate-store:
	@echo "🔍 Validando extensão para Chrome Web Store..."
	@echo ""
	@echo "📋 Verificando manifest.json..."
	@test -f manifest.json || (echo "❌ manifest.json não encontrado" && exit 1)
	@grep -q '"version"' manifest.json || (echo "❌ Versão não encontrada no manifest" && exit 1)
	@grep -q '"name"' manifest.json || (echo "❌ Nome não encontrado no manifest" && exit 1)
	@grep -q '"description"' manifest.json || (echo "❌ Descrição não encontrada no manifest" && exit 1)
	@echo "✅ manifest.json válido"
	@echo ""
	@echo "📋 Verificando ícones..."
	@test -f icon16.png || (echo "❌ icon16.png não encontrado" && exit 1)
	@test -f icon48.png || (echo "❌ icon48.png não encontrado" && exit 1)
	@test -f icon128.png || (echo "❌ icon128.png não encontrado" && exit 1)
	@echo "✅ Todos os ícones encontrados"
	@echo ""
	@echo "📋 Verificando arquivos principais..."
	@test -f index.html || (echo "❌ index.html não encontrado" && exit 1)
	@test -f background.ts || test -f background.js || (echo "❌ background script não encontrado" && exit 1)
	@echo "✅ Arquivos principais encontrados"
	@echo ""
	@echo "🎯 Versão atual:"
	@grep -o '"version":[^,]*' manifest.json
	@echo ""
	@echo "✅ Extensão pronta para empacotamento!"
	@echo "📦 Execute: make package"

prepare-store-assets:
	@echo "📸 Preparando assets para Chrome Web Store..."
	@echo ""
	@echo "📋 Assets necessários:"
	@echo "   ✅ Ícones (16x16, 48x48, 128x128) - Já disponíveis"
	@echo "   📸 Screenshots (1280x800 ou 640x400) - NECESSÁRIO CRIAR"
	@echo "   🖼️  Tile icon (440x280) - Opcional"
	@echo ""
	@echo "📸 Para criar screenshots:"
	@echo "   1. Carregue a extensão em chrome://extensions/"
	@echo "   2. Abra a extensão e capture telas das funcionalidades"
	@echo "   3. Redimensione para 1280x800px ou 640x400px"
	@echo "   4. Salve como PNG ou JPEG"
	@echo "   5. Mínimo 1, máximo 5 screenshots"
	@echo ""
	@echo "🎨 Funcionalidades para capturar:"
	@echo "   • Interface principal com lista de bookmarks"
	@echo "   • Sistema de tags em ação"
	@echo "   • Busca funcionando"
	@echo "   • Configurações de sincronização"
	@echo "   • Adição de novo bookmark com tags"
	@echo ""
	@echo "📁 Crie uma pasta 'store-assets' para organizar"
	@mkdir -p store-assets
	@echo "✅ Pasta store-assets criada"

convert-screenshots:
	@echo "🖼️  Convertendo screenshots SVG para PNG (1280x800)..."
	@echo ""
	@if command -v inkscape >/dev/null 2>&1; then \
		echo "✅ Inkscape encontrado, convertendo..."; \
		for svg in store-assets/screenshot-*.svg; do \
			if [ -f "$$svg" ]; then \
				png="$${svg%.svg}.png"; \
				echo "📸 Convertendo $$svg -> $$png (1280x800)"; \
				inkscape --export-type=png --export-width=1280 --export-height=800 --export-filename="$$png" "$$svg"; \
			fi; \
		done; \
		echo "✅ Screenshots convertidos para PNG (1280x800)"; \
	else \
		echo "❌ Inkscape não encontrado. Instalando..."; \
		sudo apt update && sudo apt install -y inkscape; \
		echo "✅ Inkscape instalado. Execute 'make convert-screenshots' novamente"; \
	fi
	@echo ""
	@echo "📁 Screenshots disponíveis em store-assets/"
	@ls -la store-assets/screenshot-*.png 2>/dev/null || echo "⚠️  Nenhum PNG encontrado ainda"

convert-screenshots-small:
	@echo "🖼️  Convertendo screenshots SVG para PNG (640x400)..."
	@echo ""
	@if command -v inkscape >/dev/null 2>&1; then \
		echo "✅ Inkscape encontrado, convertendo..."; \
		for svg in store-assets/screenshot-*.svg; do \
			if [ -f "$$svg" ]; then \
				png="$${svg%.svg}-small.png"; \
				echo "📸 Convertendo $$svg -> $$png (640x400)"; \
				inkscape --export-type=png --export-width=640 --export-height=400 --export-filename="$$png" "$$svg"; \
			fi; \
		done; \
		echo "✅ Screenshots convertidos para PNG (640x400)"; \
	else \
		echo "❌ Inkscape não encontrado. Execute 'make convert-screenshots' primeiro"; \
	fi
	@echo ""
	@echo "📁 Screenshots pequenos disponíveis em store-assets/"
	@ls -la store-assets/screenshot-*-small.png 2>/dev/null || echo "⚠️  Nenhum PNG pequeno encontrado ainda"

generate-store-readme:
	@echo "📝 Gerando README otimizado para Chrome Web Store..."
	@echo ""
	@echo "# 🔖 ChronoMark - Smart Bookmark Manager" > store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "**Organize, sincronize e encontre seus bookmarks com inteligência artificial**" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "## ✨ Principais Funcionalidades" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "- 🏷️ **Sistema de Tags Inteligente** - Organize bookmarks por categorias personalizadas" >> store-assets/CHROME_STORE_README.md
	@echo "- ☁️ **Sincronização Google Drive** - Seus dados seguros e acessíveis em qualquer lugar" >> store-assets/CHROME_STORE_README.md
	@echo "- 🔍 **Busca Avançada** - Encontre qualquer bookmark instantaneamente" >> store-assets/CHROME_STORE_README.md
	@echo "- 🤖 **IA Integrada** - Sugestões automáticas de tags e organização" >> store-assets/CHROME_STORE_README.md
	@echo "- 📊 **Estatísticas Detalhadas** - Acompanhe seus hábitos de navegação" >> store-assets/CHROME_STORE_README.md
	@echo "- 🔒 **Privacidade Total** - Seus dados ficam apenas com você" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "## 🚀 Por que ChronoMark?" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "Cansado de perder bookmarks importantes? ChronoMark transforma o caos dos seus favoritos em uma biblioteca organizada e inteligente." >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Tags Ilimitadas** vs Apenas pastas" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Sincronização Google Drive** vs Limitada" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Busca com IA** vs Busca básica" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Interface Moderna** vs Interface básica" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "## 🔒 Privacidade e Segurança" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "- Seus dados ficam apenas com você" >> store-assets/CHROME_STORE_README.md
	@echo "- Sincronização opcional com Google Drive" >> store-assets/CHROME_STORE_README.md
	@echo "- Nenhum dado é enviado para servidores externos" >> store-assets/CHROME_STORE_README.md
	@echo "- Código aberto e auditável" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "---" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "*Transforme seus bookmarks em uma ferramenta poderosa de produtividade!*" >> store-assets/CHROME_STORE_README.md
	@echo "✅ README otimizado criado em store-assets/CHROME_STORE_README.md"

store-help:
	@echo "🏪 GUIA DE PUBLICAÇÃO NA CHROME WEB STORE"
	@echo ""
	@echo "📋 Comandos disponíveis:"
	@echo "   make validate-store     - Validar extensão antes da publicação"
	@echo "   make prepare-store-assets - Preparar screenshots e assets"
	@echo "   make package           - Criar arquivo ZIP para upload"
	@echo "   make store-info        - Mostrar informações para listagem"
	@echo "   make store-help        - Mostrar esta ajuda"
	@echo ""
	@echo "📖 Documentação completa: CHROME_STORE_PUBLISHING.md"
	@echo ""
	@echo "🚀 Processo rápido:"
	@echo "   1. make validate-store"
	@echo "   2. make prepare-store-assets (criar screenshots)"
	@echo "   3. make package"
	@echo "   4. Acesse: https://chrome.google.com/webstore/devconsole/"
	@echo "   5. Upload do chronomark-extension.zip"
	@echo ""
	@echo "💰 Taxa: $5 USD (única vez)"
	@echo "⏱️  Revisão: 1-3 dias úteis"

privacy-justifications:
	@echo "🔒 JUSTIFICATIVAS DE PRIVACIDADE - CHROME WEB STORE"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📝 PROPÓSITO ÚNICO:"
	@echo "ChronoMark é um gerenciador inteligente de bookmarks que permite"
	@echo "organizar, sincronizar e encontrar favoritos usando tags e IA."
	@echo ""
	@echo "🔑 JUSTIFICATIVAS DE PERMISSÕES:"
	@echo ""
	@echo "📚 BOOKMARKS:"
	@echo "• Ler/criar/atualizar bookmarks do Chrome"
	@echo "• Importar bookmarks existentes"
	@echo "• Sincronizar entre dispositivos"
	@echo ""
	@echo "💾 STORAGE:"
	@echo "• Armazenar configurações do usuário"
	@echo "• Cache de tags e metadados"
	@echo "• Tokens de autenticação (criptografados)"
	@echo ""
	@echo "🆔 IDENTITY:"
	@echo "• Autenticação OAuth2 com Google Drive"
	@echo "• Tokens temporários para sincronização"
	@echo "• Nenhum dado permanente coletado"
	@echo ""
	@echo "🌐 HOST PERMISSIONS (googleapis.com):"
	@echo "• Comunicação com Google Drive API"
	@echo "• Upload/download de backups"
	@echo "• Apenas endpoints específicos do Google"
	@echo ""
	@echo "⏰ ALARMS:"
	@echo "• Sincronização automática periódica"
	@echo "• Limpeza de cache temporário"
	@echo "• Verificação de integridade"
	@echo ""
	@echo "📑 TABS:"
	@echo "• Detectar sites já marcados"
	@echo "• Sugerir tags baseadas na página"
	@echo "• Facilitar adição rápida de bookmarks"
	@echo ""
	@echo "💻 REMOTE CODE:"
	@echo "• Bibliotecas de IA (Google Gemini)"
	@echo "• Atualizações de segurança da API"
	@echo "• Componentes de interface dinâmicos"
	@echo ""
	@echo "✅ CONFORMIDADE:"
	@echo "• Nenhum dado pessoal desnecessário coletado"
	@echo "• Dados ficam no dispositivo/Google Drive pessoal"
	@echo "• Código aberto e auditável"
	@echo "• Conformidade com LGPD/GDPR"
	@echo ""
	@echo "📄 Detalhes completos: store-assets/PRIVACY_JUSTIFICATIONS.md"

# Checklist de publicação para Chrome Web Store
publication-checklist:
	@echo "📋 PUBLICATION CHECKLIST - CHROME WEB STORE"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "❌ IDENTIFIED ISSUES:"
	@echo "1. 📧 Email not verified in Developer Console"
	@echo "2. 🔒 Privacy practices not filled"
	@echo "3. ✅ Compliance certification pending"
	@echo ""
	@echo "📋 STEPS TO RESOLVE:"
	@echo "1. 📧 Configure email in Account tab"
	@echo "2. ✉️  Verify email (check inbox)"
	@echo "3. 🔒 Fill Privacy practices tab"
	@echo "4. ✅ Mark compliance certification"
	@echo "5. 💾 Save draft (Save Draft)"
	@echo "6. 🚀 Submit for review"
	@echo ""
	@echo "📄 Complete guide: store-assets/PUBLICATION_CHECKLIST.md"
	@echo "🔒 Justifications: make privacy-justifications"

# Test instructions for Chrome Web Store
test-instructions:
	@echo "🧪 TEST INSTRUCTIONS - CHROME WEB STORE"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "🔐 TEST ACCOUNT:"
	@echo "• Email: chronomark.test@gmail.com"
	@echo "• Password: ChromeTest2024!"
	@echo "• Google Drive: Configured with OAuth"
	@echo ""
	@echo "🧪 MAIN TESTS:"
	@echo "1. 📚 Basic bookmark management"
	@echo "2. 🏷️  Tag system and filtering"
	@echo "3. 🔄 Google Drive sync (optional)"
	@echo "4. 🎨 Interface and usability"
	@echo ""
	@echo "⏱️  ESTIMATED TIME: 15-20 minutes"
	@echo "🎯 CRITERIA: Essential features + UX"
	@echo ""
	@echo "📄 Complete instructions: store-assets/TEST_INSTRUCTIONS.md"

# How to test extension pending approval
test-pending:
	@echo "🧪 TEST EXTENSION PENDING APPROVAL"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📋 STATUS: Extension submitted for review"
	@echo ""
	@echo "🔧 TEST METHODS:"
	@echo "1. 💻 LOCAL TEST (Recommended):"
	@echo "   • make package → Install in developer mode"
	@echo "   • Full control + immediate testing"
	@echo ""
	@echo "2. 🌐 TEST LINK (Chrome Web Store):"
	@echo "   • Developer Console → Preview link"
	@echo "   • Limited during review"
	@echo ""
	@echo "3. 👥 SHARE PACKAGE:"
	@echo "   • Send .zip to testers"
	@echo "   • Manual installation"
	@echo ""
	@echo "⏳ APPROVAL TIME: 1-7 business days"
	@echo "📧 Monitor Google emails for updates"
	@echo ""
	@echo "📄 Complete guide: store-assets/TESTING_PENDING_EXTENSION.md"

# Configure AI integration
ai-setup:
	@echo "🤖 AI CONFIGURATION - CHRONOMARK"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📋 AVAILABLE METHODS:"
	@echo "1. 🤖 GOOGLE GEMINI (Recommended):"
	@echo "   • Uses user authentication via Chrome identity API"
	@echo "   • No backend server required"
	@echo "   • Secure OAuth tokens"
	@echo "   • Example: BookmarkFormWithGemini.tsx"
	@echo ""
	@echo "2. 🔒 PROXY BACKEND:"
	@echo "   • Secure keys on server"
	@echo "   • Full control over usage and limits"
	@echo "   • Multiple AI providers"
	@echo ""
	@echo "3. 🆓 FREE APIS:"
	@echo "   • HuggingFace Inference API"
	@echo "   • Groq (free with limits)"
	@echo "   • No keys exposed in extension"
	@echo ""
	@echo "4. 🧠 LOCAL AI (WebLLM):"
	@echo "   • Browser processing"
	@echo "   • No external dependencies"
	@echo "   • Total privacy"
	@echo ""
	@echo "5. 🎯 SMART RULES (Implemented):"
	@echo "   • Domain and keyword-based system"
	@echo "   • No APIs or keys required"
	@echo "   • Maximum performance"
	@echo ""
	@echo "💡 RECOMMENDATION: Start with Gemini + Rules as fallback"
	@echo "🔒 SECURITY: Never expose keys in extension code"
	@echo ""
	@echo "📄 Complete guides:"
	@echo "   • AI_INTEGRATION_GUIDE.md"
	@echo "   • examples/README-Gemini.md"
	@echo "   • examples/README-HuggingFace.md"
	@echo ""
	@echo "📝 Practical examples:"
	@echo "   • examples/BookmarkFormWithAI.tsx (local rules)"
	@echo "   • examples/BookmarkFormWithGemini.tsx (Gemini AI)"
	@echo "   • examples/BookmarkFormWithHuggingFace.tsx (HuggingFace)"
	@echo ""
	@echo "Quick Start Commands:"
	@echo "  make gemini-setup       - Setup Gemini integration"
	@echo "  make huggingface-setup  - Setup Hugging Face integration"
	@echo "  make huggingface-start  - Start Hugging Face proxy server"

store-info:
	@echo "📋 INFORMAÇÕES PARA CHROME WEB STORE"
	@echo ""
	@echo "📦 Nome: ChronoMark - Smart Bookmark Manager"
	@echo "📋 Categoria: Productivity"
	@echo "🌍 Idioma: Português (Brasil)"
	@echo ""
	@echo "📄 Descrição Curta:"
	@echo "Organize seus bookmarks com tags inteligentes e sincronização com Google Drive"
	@echo ""
	@echo "🔗 Links importantes:"
	@echo "   📖 Documentação: store-assets/STORE_LISTING.md"
	@echo "   🔒 Política Privacidade: PRIVACY_POLICY.md"
	@echo "   📦 Pacote: chronomark-extension.zip"
	@echo ""
	@echo "📷  Permissões necessárias:"
	@echo "   • bookmarks - Gerenciar bookmarks do usuário"
	@echo "   • storage - Armazenar configurações locais"
	@echo "   • identity - Autenticação OAuth com Google"
	@echo "   • googleapis.com - Sincronização com Google Drive"
	@echo ""
	@echo "📸 Screenshots necessários: 1-5 imagens (1280x800px)"
	@echo "💡 Veja store-assets/STORE_LISTING.md para detalhes completos"

# Hugging Face Integration Commands
huggingface-setup:
	@echo "🤖 Hugging Face Integration Setup"
	@echo "================================="
	@echo ""
	@echo "📋 Setup Steps:"
	@echo "1. 📁 Navigate to examples directory: cd examples"
	@echo "2. 📦 Install dependencies: npm install"
	@echo "3. 🔑 Copy environment file: cp .env.example .env"
	@echo "4. ✏️  Edit .env with your Hugging Face API key"
	@echo "5. 🚀 Start proxy server: make huggingface-start"
	@echo ""
	@echo "🔑 Get API Key:"
	@echo "   1. Visit: https://huggingface.co/settings/tokens"
	@echo "   2. Create new token with 'Read' permissions"
	@echo "   3. Copy token to .env file"
	@echo ""
	@echo "📖 Full guide: examples/README-HuggingFace.md"

huggingface-start:
	@echo "🚀 Starting Hugging Face Proxy Server..."
	@if [ ! -f examples/.env ]; then \
		echo "❌ Error: .env file not found!"; \
		echo "Run 'make huggingface-setup' first"; \
		exit 1; \
	fi
	@cd examples && npm run dev."
	@if [ ! -f examples/.env ]; then \
		echo "❌ Error: .env file not found!"; \
		echo "Run 'make huggingface-setup' first"; \
		exit 1; \
	fi
	@cd examples && npm run dev

# Create 1280x800 images with original screenshots centered on black background
create-centered-screenshots:
	@echo "🖼️  Creating 1280x800 images with centered screenshots on black background..."
	@echo ""
	@if command -v convert >/dev/null 2>&1; then \
		echo "✅ ImageMagick found, processing screenshots..."; \
		convert -size 1280x800 xc:black store-assets/screenshot1.png -gravity center -composite store-assets/screenshot1-centered.png; \
		convert -size 1280x800 xc:black store-assets/screenshot2.png -gravity center -composite store-assets/screenshot2-centered.png; \
		convert -size 1280x800 xc:black store-assets/screenshot3.png -gravity center -composite store-assets/screenshot3-centered.png; \
		convert -size 1280x800 xc:black store-assets/screenshot4.png -gravity center -composite store-assets/screenshot4-centered.png; \
		echo ""; \
		echo "✅ Centered screenshots created successfully in 1280x800 format!"; \
	else \
		echo "❌ ImageMagick not found. Install with: sudo apt install imagemagick"; \
	fi
	@echo ""
	@echo "📁 Centered screenshots available in store-assets/"
	@ls -la store-assets/screenshot*-centered.png 2>/dev/null || echo "⚠️  No centered screenshots found yet"

validate-extension:
	@echo "🔍 Checking main files..."
	@echo "📁 File structure:"
	@ls -la dist/ 2>/dev/null || echo "   ❌ dist/ folder not found - run 'make build'"
	@echo ""
	@echo "📋 Checking manifest.json:"
	@if [ -f "manifest.json" ]; then \
		echo "   ✅ manifest.json found"; \
		jq . manifest.json > /dev/null 2>&1 && echo "   ✅ Valid JSON" || echo "   ❌ Invalid JSON"; \
	else \
		echo "   ❌ manifest.json not found"; \
	fi
	@echo ""
	@echo "🔢 Extension version:"
	@jq -r '.version' manifest.json 2>/dev/null || echo "   ❌ Could not read version"

huggingface-stop:
	@echo "🛑 Stopping Hugging Face Proxy Server..."
	@pkill -f "node.*huggingface-proxy-backend" || echo "No server running"

# Gemini Integration Commands
gemini-setup:
	@echo "🤖 Google Gemini Integration Setup"
	@echo "==================================="
	@echo ""
	@echo "📋 Setup Steps:"
	@echo "1. 🔧 Configure Chrome Extension Permissions"
	@echo "2. ☁️  Setup Google Cloud Console"
	@echo "3. 🔑 Configure OAuth Client ID"
	@echo "4. 🚀 Use BookmarkFormWithGemini component"
	@echo ""
	@echo "🔧 Required Permissions (manifest.json):"
	@echo "   • \"identity\" - Chrome identity API"
	@echo "   • \"https://generativelanguage.googleapis.com/*\""
	@echo ""
	@echo "☁️  Google Cloud Console:"
	@echo "   1. Visit: https://console.cloud.google.com/"
	@echo "   2. Enable Generative Language API"
	@echo "   3. Create OAuth 2.0 Client ID (Chrome Extension)"
	@echo "   4. Add extension ID to authorized origins"
	@echo ""
	@echo "🔑 OAuth Configuration:"
	@echo "   • Client ID → manifest.json oauth2.client_id"
	@echo "   • Scopes: https://www.googleapis.com/auth/generative-language"
	@echo ""
	@echo "✨ Advantages:"
	@echo "   • No backend server required"
	@echo "   • Uses user's Google account authentication"
	@echo "   • Secure OAuth token-based access"
	@echo "   • No API keys stored in extension"
	@echo ""
	@echo "📖 Full guide: examples/README-Gemini.md"
	@echo "📝 Example: examples/BookmarkFormWithGemini.tsx"

examples:
	@echo "📚 EXEMPLOS DISPONÍVEIS - CHRONOMARK"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "🤖 INTEGRAÇÃO COM IA:"
	@echo "   📄 examples/BookmarkFormWithAI.tsx"
	@echo "      └─ Formulário com sugestões automáticas de tags (regras locais)"
	@echo "      └─ Sistema de confiança e múltiplas fontes"
	@echo "      └─ Interface intuitiva para aceitar sugestões"
	@echo ""
	@echo "   📄 examples/BookmarkFormWithGemini.tsx"
	@echo "      └─ Integração com Google Gemini AI"
	@echo "      └─ Autenticação via Chrome identity API"
	@echo "      └─ Sem servidor backend necessário"
	@echo ""
	@echo "   📄 examples/BookmarkFormWithHuggingFace.tsx"
	@echo "      └─ Integração com Hugging Face AI"
	@echo "      └─ Sugestões de tags usando modelos de linguagem"
	@echo "      └─ Proxy backend para segurança"
	@echo ""
	@echo "🔧 SERVIÇOS:"
	@echo "   📄 services/smartTaggingService.ts"
	@echo "      └─ Sistema de IA baseado em regras"
	@echo "      └─ Análise de domínio, palavras-chave e URL"
	@echo "      └─ Sem necessidade de APIs externas"
	@echo ""
	@echo "   📄 services/geminiService.ts"
	@echo "      └─ Serviço para Google Gemini AI"
	@echo "      └─ Autenticação OAuth via Chrome identity API"
	@echo "      └─ Sem servidor backend necessário"
	@echo ""
	@echo "   📄 services/huggingFaceService.ts"
	@echo "      └─ Serviço para API Hugging Face"
	@echo "      └─ Comunicação segura via proxy"
	@echo ""
	@echo "   📄 examples/huggingface-proxy-backend.js"
	@echo "      └─ Servidor proxy seguro para Hugging Face"
	@echo "      └─ Protege chaves de API"
	@echo ""
	@echo "💡 COMO USAR:"
	@echo "   1. Copie os arquivos para seu projeto"
	@echo "   2. Para regras locais: use BookmarkFormWithAI"
	@echo "   3. Para Google Gemini: make gemini-setup"
	@echo "   4. Para Hugging Face: make huggingface-setup"
	@echo "   5. Personalize as configurações conforme necessário"
	@echo ""
	@echo "📖 Documentação:"
	@echo "   • examples/README.md"
	@echo "   • examples/README-Gemini.md"
	@echo "   • examples/README-HuggingFace.md"
	@echo "🤖 Configuração: make ai-setup"

# Show help
help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "🔧 DESENVOLVIMENTO:"
	@echo "  make install          - Instalar dependências"
	@echo "  make test            - Executar testes"
	@echo "  make test-pr PR=N    - Testar Pull Request #N localmente"
	@echo "  make build           - Construir extensão"
	@echo "  make clean           - Limpar arquivos de build"
	@echo "  make dist            - Criar pacote de distribuição"
	@echo ""
	@echo "🔐 OAUTH:"
	@echo "  make oauth-help      - Mostrar ajuda OAuth"
	@echo "  make oauth-test      - Testar configuração OAuth"
	@echo "  make oauth-setup     - Configurar OAuth inicial"
	@echo "  make oauth-extension-id - Mostrar Extension ID"
	@echo "  make oauth-debug     - Diagnóstico completo OAuth"
	@echo "  make oauth-troubleshoot - Guia de troubleshooting OAuth"
	@echo "  make oauth-fix-redirect - 🚨 CORRIGIR Error 400: redirect_uri_mismatch"
	@echo "  make oauth-fix-client-id - 🚨 CORRIGIR 'bad client id' error"
	@echo "  make oauth-update-client-id CLIENT_ID=xxx - Atualizar Client ID no manifest"
	@echo ""
	@echo "🏪 CHROME WEB STORE:"
	@echo "  make validate-store   - Validar extensão para publicação"
	@echo "  make prepare-store-assets - Preparar screenshots e assets"
	@echo "  make convert-screenshots    # Converter screenshots SVG para PNG (1280x800)"
	@echo "  make convert-screenshots-small # Converter screenshots SVG para PNG (640x400)"
	@echo "  make generate-store-readme  # Gerar README otimizado para Chrome Web Store"
	@echo "  make privacy-justifications # Justificativas de privacidade para Chrome Web Store"
	@echo "  make publication-checklist  # Checklist para resolver problemas de publicação"
	@echo "  make test-instructions      # Instruções de teste para equipe Chrome Web Store"
	@echo "  make test-pending           # Como testar extensão aguardando aprovação"
	@echo "  make ai-setup               # Métodos para integrar IA sem expor chaves"
	@echo "  make examples               # Mostrar exemplos disponíveis"
	@echo "  make huggingface-setup      # Setup Hugging Face integration"
	@echo "  make huggingface-start      # Start Hugging Face proxy server"
	@echo "  make package         - Criar arquivo .zip para Chrome Web Store"
	@echo "  make store-info      - Informações para listagem"
	@echo "  make store-help      - Guia completo de publicação"

# Preview Chrome Web Store assets locally
store-preview:
	@echo "Starting local preview server for store-assets at http://localhost:8081/"
	@echo "Press Ctrl+C to stop the server"
	@cd store-assets && python3 -m http.server 8081
	@echo ""
	@echo "📁 Screenshots disponíveis em store-assets/"
	@ls -la store-assets/screenshot-*.png 2>/dev/null || echo "⚠️  Nenhum PNG encontrado ainda"

convert-screenshots-small:
	@echo "🖼️  Convertendo screenshots SVG para PNG (640x400)..."
	@echo ""
	@if command -v inkscape >/dev/null 2>&1; then \
		echo "✅ Inkscape encontrado, convertendo..."; \
		for svg in store-assets/screenshot-*.svg; do \
			if [ -f "$$svg" ]; then \
				png="$${svg%.svg}-small.png"; \
				echo "📸 Convertendo $$svg -> $$png (640x400)"; \
				inkscape --export-type=png --export-width=640 --export-height=400 --export-filename="$$png" "$$svg"; \
			fi; \
		done; \
		echo "✅ Screenshots convertidos para PNG (640x400)"; \
	else \
		echo "❌ Inkscape não encontrado. Execute 'make convert-screenshots' primeiro"; \
	fi
	@echo ""
	@echo "📁 Screenshots pequenos disponíveis em store-assets/"
	@ls -la store-assets/screenshot-*-small.png 2>/dev/null || echo "⚠️  Nenhum PNG pequeno encontrado ainda"

generate-store-readme:
	@echo "📝 Gerando README otimizado para Chrome Web Store..."
	@echo ""
	@echo "# 🔖 ChronoMark - Smart Bookmark Manager" > store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "**Organize, sincronize e encontre seus bookmarks com inteligência artificial**" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "## ✨ Principais Funcionalidades" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "- 🏷️ **Sistema de Tags Inteligente** - Organize bookmarks por categorias personalizadas" >> store-assets/CHROME_STORE_README.md
	@echo "- ☁️ **Sincronização Google Drive** - Seus dados seguros e acessíveis em qualquer lugar" >> store-assets/CHROME_STORE_README.md
	@echo "- 🔍 **Busca Avançada** - Encontre qualquer bookmark instantaneamente" >> store-assets/CHROME_STORE_README.md
	@echo "- 🤖 **IA Integrada** - Sugestões automáticas de tags e organização" >> store-assets/CHROME_STORE_README.md
	@echo "- 📊 **Estatísticas Detalhadas** - Acompanhe seus hábitos de navegação" >> store-assets/CHROME_STORE_README.md
	@echo "- 🔒 **Privacidade Total** - Seus dados ficam apenas com você" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "## 🚀 Por que ChronoMark?" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "Cansado de perder bookmarks importantes? ChronoMark transforma o caos dos seus favoritos em uma biblioteca organizada e inteligente." >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Tags Ilimitadas** vs Apenas pastas" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Sincronização Google Drive** vs Limitada" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Busca com IA** vs Busca básica" >> store-assets/CHROME_STORE_README.md
	@echo "✅ **Interface Moderna** vs Interface básica" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "## 🔒 Privacidade e Segurança" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "- Seus dados ficam apenas com você" >> store-assets/CHROME_STORE_README.md
	@echo "- Sincronização opcional com Google Drive" >> store-assets/CHROME_STORE_README.md
	@echo "- Nenhum dado é enviado para servidores externos" >> store-assets/CHROME_STORE_README.md
	@echo "- Código aberto e auditável" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "---" >> store-assets/CHROME_STORE_README.md
	@echo "" >> store-assets/CHROME_STORE_README.md
	@echo "*Transforme seus bookmarks em uma ferramenta poderosa de produtividade!*" >> store-assets/CHROME_STORE_README.md
	@echo "✅ README otimizado criado em store-assets/CHROME_STORE_README.md"

store-help:
	@echo "🏪 GUIA DE PUBLICAÇÃO NA CHROME WEB STORE"
	@echo ""
	@echo "📋 Comandos disponíveis:"
	@echo "   make validate-store     - Validar extensão antes da publicação"
	@echo "   make prepare-store-assets - Preparar screenshots e assets"
	@echo "   make package           - Criar arquivo ZIP para upload"
	@echo "   make store-info        - Mostrar informações para listagem"
	@echo "   make store-help        - Mostrar esta ajuda"
	@echo ""
	@echo "📖 Documentação completa: CHROME_STORE_PUBLISHING.md"
	@echo ""
	@echo "🚀 Processo rápido:"
	@echo "   1. make validate-store"
	@echo "   2. make prepare-store-assets (criar screenshots)"
	@echo "   3. make package"
	@echo "   4. Acesse: https://chrome.google.com/webstore/devconsole/"
	@echo "   5. Upload do chronomark-extension.zip"
	@echo ""
	@echo "💰 Taxa: $5 USD (única vez)"
	@echo "⏱️  Revisão: 1-3 dias úteis"

privacy-justifications:
	@echo "🔒 JUSTIFICATIVAS DE PRIVACIDADE - CHROME WEB STORE"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📝 PROPÓSITO ÚNICO:"
	@echo "ChronoMark é um gerenciador inteligente de bookmarks que permite"
	@echo "organizar, sincronizar e encontrar favoritos usando tags e IA."
	@echo ""
	@echo "🔑 JUSTIFICATIVAS DE PERMISSÕES:"
	@echo ""
	@echo "📚 BOOKMARKS:"
	@echo "• Ler/criar/atualizar bookmarks do Chrome"
	@echo "• Importar bookmarks existentes"
	@echo "• Sincronizar entre dispositivos"
	@echo ""
	@echo "💾 STORAGE:"
	@echo "• Armazenar configurações do usuário"
	@echo "• Cache de tags e metadados"
	@echo "• Tokens de autenticação (criptografados)"
	@echo ""
	@echo "🆔 IDENTITY:"
	@echo "• Autenticação OAuth2 com Google Drive"
	@echo "• Tokens temporários para sincronização"
	@echo "• Nenhum dado permanente coletado"
	@echo ""
	@echo "🌐 HOST PERMISSIONS (googleapis.com):"
	@echo "• Comunicação com Google Drive API"
	@echo "• Upload/download de backups"
	@echo "• Apenas endpoints específicos do Google"
	@echo ""
	@echo "⏰ ALARMS:"
	@echo "• Sincronização automática periódica"
	@echo "• Limpeza de cache temporário"
	@echo "• Verificação de integridade"
	@echo ""
	@echo "📑 TABS:"
	@echo "• Detectar sites já marcados"
	@echo "• Sugerir tags baseadas na página"
	@echo "• Facilitar adição rápida de bookmarks"
	@echo ""
	@echo "💻 REMOTE CODE:"
	@echo "• Bibliotecas de IA (Google Gemini)"
	@echo "• Atualizações de segurança da API"
	@echo "• Componentes de interface dinâmicos"
	@echo ""
	@echo "✅ CONFORMIDADE:"
	@echo "• Nenhum dado pessoal desnecessário coletado"
	@echo "• Dados ficam no dispositivo/Google Drive pessoal"
	@echo "• Código aberto e auditável"
	@echo "• Conformidade com LGPD/GDPR"
	@echo ""
	@echo "📄 Detalhes completos: store-assets/PRIVACY_JUSTIFICATIONS.md"

# Checklist de publicação para Chrome Web Store
publication-checklist:
	@echo "✅ CHECKLIST DE PUBLICAÇÃO - CHROME WEB STORE"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "🚨 PROBLEMAS IDENTIFICADOS:"
	@echo "• Email de contato não configurado/verificado"
	@echo "• Justificativas de permissões em falta"
	@echo "• Descrição de propósito único em falta"
	@echo "• Certificação de conformidade pendente"
	@echo ""
	@echo "📋 PASSOS PARA RESOLVER:"
	@echo "1. 📧 Configurar email no Account tab"
	@echo "2. ✉️  Verificar email (check inbox)"
	@echo "3. 🔒 Preencher Privacy practices tab"
	@echo "4. ✅ Marcar certificação de conformidade"
	@echo "5. 💾 Salvar rascunho (Save Draft)"
	@echo "6. 🚀 Submeter para revisão"
	@echo ""
	@echo "📄 Guia completo: store-assets/PUBLICATION_CHECKLIST.md"
	@echo "🔒 Justificativas: make privacy-justifications"

# Instruções de teste para Chrome Web Store
test-instructions:
	@echo "🧪 INSTRUÇÕES DE TESTE - CHROME WEB STORE"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "🔐 CONTA DE TESTE:"
	@echo "• Email: chronomark.test@gmail.com"
	@echo "• Senha: ChromeTest2024!"
	@echo "• Google Drive: Configurado com OAuth"
	@echo ""
	@echo "🧪 TESTES PRINCIPAIS:"
	@echo "1. 📚 Gerenciamento básico de bookmarks"
	@echo "2. 🏷️  Sistema de tags e filtragem"
	@echo "3. 🔄 Sincronização Google Drive (opcional)"
	@echo "4. 🎨 Interface e usabilidade"
	@echo ""
	@echo "⏱️  TEMPO ESTIMADO: 15-20 minutos"
	@echo "🎯 CRITÉRIOS: Funcionalidades essenciais + UX"
	@echo ""
	@echo "📄 Instruções completas: store-assets/TEST_INSTRUCTIONS.md"

# Como testar extensão aguardando aprovação
test-pending:
	@echo "🧪 TESTAR EXTENSÃO AGUARDANDO APROVAÇÃO"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📋 STATUS: Extensão submetida para revisão"
	@echo ""
	@echo "🔧 MÉTODOS DE TESTE:"
	@echo "1. 💻 TESTE LOCAL (Recomendado):"
	@echo "   • make package → Instalar modo desenvolvedor"
	@echo "   • Controle total + teste imediato"
	@echo ""
	@echo "2. 🌐 LINK DE TESTE (Chrome Web Store):"
	@echo "   • Developer Console → Preview link"
	@echo "   • Limitado durante revisão"
	@echo ""
	@echo "3. 👥 COMPARTILHAR PACOTE:"
	@echo "   • Enviar .zip para testadores"
	@echo "   • Instalação manual"
	@echo ""
	@echo "⏳ TEMPO DE APROVAÇÃO: 1-7 dias úteis"
	@echo "📧 Monitorar emails da Google para updates"
	@echo ""
	@echo "📄 Guia completo: store-assets/TESTING_PENDING_EXTENSION.md"

# Configurar integração com IA
ai-setup:
	@echo "🤖 CONFIGURAÇÃO DE IA - CHRONOMARK"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📋 MÉTODOS DISPONÍVEIS:"
	@echo "1. 🤖 GOOGLE GEMINI (Recomendado):"
	@echo "   • Usa autenticação do usuário via Chrome identity API"
	@echo "   • Sem servidor backend necessário"
	@echo "   • Tokens OAuth seguros"
	@echo "   • Exemplo: BookmarkFormWithGemini.tsx"
	@echo ""
	@echo "2. 🔒 PROXY BACKEND:"
	@echo "   • Chaves seguras no servidor"
	@echo "   • Controle total sobre uso e limites"
	@echo "   • Múltiplos provedores de IA"
	@echo ""
	@echo "3. 🆓 APIS GRATUITAS:"
	@echo "   • HuggingFace Inference API"
	@echo "   • Groq (gratuito com limite)"
	@echo "   • Sem chaves expostas na extensão"
	@echo ""
	@echo "4. 🧠 IA LOCAL (WebLLM):"
	@echo "   • Processamento no navegador"
	@echo "   • Sem dependências externas"
	@echo "   • Privacidade total"
	@echo ""
	@echo "5. 🎯 REGRAS INTELIGENTES (Implementado):"
	@echo "   • Sistema baseado em domínios e palavras-chave"
	@echo "   • Sem APIs ou chaves necessárias"
	@echo "   • Performance máxima"
	@echo ""
	@echo "💡 RECOMENDAÇÃO: Começar com Gemini + Regras como fallback"
	@echo "🔒 SEGURANÇA: Nunca expor chaves no código da extensão"
	@echo ""
	@echo "📄 Guias completos:"
	@echo "   • AI_INTEGRATION_GUIDE.md"
	@echo "   • examples/README-Gemini.md"
	@echo "   • examples/README-HuggingFace.md"
	@echo ""
	@echo "📝 Exemplos práticos:"
	@echo "   • examples/BookmarkFormWithAI.tsx (regras locais)"
	@echo "   • examples/BookmarkFormWithGemini.tsx (Gemini AI)"
	@echo "   • examples/BookmarkFormWithHuggingFace.tsx (HuggingFace)"
	@echo ""
	@echo "Quick Start Commands:"
	@echo "  make gemini-setup       - Setup Gemini integration"
	@echo "  make huggingface-setup  - Setup Hugging Face integration"
	@echo "  make huggingface-start  - Start Hugging Face proxy server"

store-info:
	@echo "📋 INFORMAÇÕES PARA CHROME WEB STORE"
	@echo ""
	@echo "📦 Nome: ChronoMark - Smart Bookmark Manager"
	@echo "📋 Categoria: Productivity"
	@echo "🌍 Idioma: Português (Brasil)"
	@echo ""
	@echo "📄 Descrição Curta:"
	@echo "Organize seus bookmarks com tags inteligentes e sincronização com Google Drive"
	@echo ""
	@echo "🔗 Links importantes:"
	@echo "   📖 Documentação: store-assets/STORE_LISTING.md"
	@echo "   🔒 Política Privacidade: PRIVACY_POLICY.md"
	@echo "   📦 Pacote: chronomark-extension.zip"
	@echo ""
	@echo "📷  Permissões necessárias:"
	@echo "   • bookmarks - Gerenciar bookmarks do usuário"
	@echo "   • storage - Armazenar configurações locais"
	@echo "   • identity - Autenticação OAuth com Google"
	@echo "   • googleapis.com - Sincronização com Google Drive"
	@echo ""
	@echo "📸 Screenshots necessários: 1-5 imagens (1280x800px)"
	@echo "💡 Veja store-assets/STORE_LISTING.md para detalhes completos"

# Hugging Face Integration Commands
huggingface-setup:
	@echo "🤖 Hugging Face Integration Setup"
	@echo "================================="
	@echo ""
	@echo "📋 Setup Steps:"
	@echo "1. 📁 Navigate to examples directory: cd examples"
	@echo "2. 📦 Install dependencies: npm install"
	@echo "3. 🔑 Copy environment file: cp .env.example .env"
	@echo "4. ✏️  Edit .env with your Hugging Face API key"
	@echo "5. 🚀 Start proxy server: make huggingface-start"
	@echo ""
	@echo "🔑 Get API Key:"
	@echo "   1. Visit: https://huggingface.co/settings/tokens"
	@echo "   2. Create new token with 'Read' permissions"
	@echo "   3. Copy token to .env file"
	@echo ""
	@echo "📖 Full guide: examples/README-HuggingFace.md"

huggingface-start:
	@echo "🚀 Starting Hugging Face Proxy Server..