.PHONY: install test build clean dist package help oauth-help oauth-test oauth-setup oauth-extension-id oauth-debug oauth-troubleshoot oauth-fix-redirect oauth-fix-client-id oauth-update-client-id validate-store prepare-store-assets store-help

# Default target
all: install build

# Install dependencies
install:
	npm install

# Test the project (no tests currently defined in package.json)
test:
	@echo "No tests currently defined in package.json"

# Build the project (outputs to dist folder)
build:
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
package: build
	@echo "📦 Criando pacote para Chrome Web Store..."
	@mkdir -p dist
	@echo "📋 Verificando arquivos obrigatórios..."
	@test -f dist/manifest.json || (echo "❌ manifest.json não encontrado" && exit 1)
	@test -f dist/index.html || (echo "❌ index.html não encontrado" && exit 1)
	@test -f dist/icon16.png || (echo "❌ icon16.png não encontrado" && exit 1)
	@test -f dist/icon48.png || (echo "❌ icon48.png não encontrado" && exit 1)
	@test -f dist/icon128.png || (echo "❌ icon128.png não encontrado" && exit 1)
	@echo "✅ Todos os arquivos obrigatórios encontrados"
	@cd dist && zip -r ../chronomark-extension.zip . -x "*.DS_Store" "*.git*" "*.map" "node_modules/*"
	@echo "✅ Pacote criado: chronomark-extension.zip"
	@ls -lh chronomark-extension.zip
	@echo "📋 Próximo passo: Acesse https://chrome.google.com/webstore/devconsole/"

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
	@echo "🧪 Testando configuração OAuth..."
	@echo "📋 Verificações necessárias:"
	@echo "   1. Extensão carregada em chrome://extensions/"
	@echo "   2. Modo desenvolvedor ativado"
	@echo "   3. Client ID configurado no Google Cloud Console"
	@echo ""
	@echo "🌐 Abrindo página de teste OAuth..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open file://$(PWD)/test-auth.html; \
	elif command -v open > /dev/null; then \
		open file://$(PWD)/test-auth.html; \
	else \
		echo "❌ Não foi possível abrir automaticamente"; \
		echo "📂 Abra manualmente: file://$(PWD)/test-auth.html"; \
	fi
	@echo ""
	@echo "🔍 Se houver erro 'bad client id':"
	@echo "   → Execute: make oauth-fix-client-id"
	@echo "🔍 Se houver erro 'redirect_uri_mismatch':"
	@echo "   → Execute: make oauth-fix-redirect"

oauth-setup:
	@echo "OAuth Setup Steps:"
	@echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
	@echo "2. Navigate to APIs & Services > Credentials"
	@echo "3. Find OAuth 2.0 Client ID: nbimliadaeimcfkngknobflgnkneiddl.apps.googleusercontent.com"
	@echo "4. IMPORTANTE: Selecione 'Chrome Extension' como tipo de aplicação"
	@echo "5. No campo 'Application ID', cole o Extension ID da extensão"
	@echo ""
	@echo "Current client_id in manifest.json:"
	@grep -A 1 '"client_id"' manifest.json || echo "Could not find client_id in manifest.json"
	@echo ""
	@echo "Para obter o Extension ID: make oauth-extension-id"
	@echo "For detailed guide, see: OAUTH_SETUP.md"

oauth-extension-id:
	@echo "Para obter o Extension ID:"
	@echo "1. Abra o Chrome e vá para chrome://extensions/"
	@echo "2. Ative o 'Modo do desenvolvedor' (canto superior direito)"
	@echo "3. Carregue a extensão (make build primeiro se necessário)"
	@echo "4. Copie o Extension ID que aparece abaixo do nome da extensão"
	@echo "5. Cole esse ID no campo 'Application ID' no Google Cloud Console"
	@echo ""
	@echo "O Extension ID tem formato similar a: abcdefghijklmnopqrstuvwxyz123456"

oauth-debug:
	@echo "=== DIAGNÓSTICO OAUTH ==="
	@echo "1. Client ID no manifest.json:"
	@grep -A 1 '"client_id"' manifest.json || echo "   ❌ Client ID não encontrado"
	@echo ""
	@echo "2. Verificações necessárias:"
	@echo "   ✓ Extensão foi construída? (make build)"
	@echo "   ✓ Extensão foi carregada no Chrome?"
	@echo "   ✓ Extension ID foi copiado do chrome://extensions/?"
	@echo "   ✓ Google Cloud Console configurado como 'Chrome Extension'?"
	@echo "   ✓ Application ID no Google Cloud Console = Extension ID?"
	@echo ""
	@echo "3. Passos para resolver 'Error 400: redirect_uri_mismatch':"
	@echo "   a) Vá para: https://console.cloud.google.com/apis/credentials"
	@echo "   b) Encontre o Client ID: nbimliadaeimcfkngknobflgnkneiddl"
	@echo "   c) Clique em 'Editar'"
	@echo "   d) Certifique-se que 'Application type' = 'Chrome Extension'"
	@echo "   e) Cole o Extension ID no campo 'Application ID'"
	@echo "   f) Salve as alterações"
	@echo ""
	@echo "4. Para testar: make oauth-test"
	@echo "5. Para obter Extension ID: make oauth-extension-id"
	@echo "6. Para troubleshooting detalhado: make oauth-troubleshoot"

oauth-troubleshoot:
	@echo "📋 Abrindo guia de troubleshooting detalhado..."
	@echo "📄 Arquivo: OAUTH_TROUBLESHOOTING.md"
	@echo ""
	@echo "🔍 PONTOS CRÍTICOS para Error 400:"
	@echo "1. Extension ID muda a cada reload da extensão!"
	@echo "2. Deve ser 'Chrome Extension', não 'Web application'"
	@echo "3. Application ID = Extension ID exato"
	@echo "4. Aguarde 5-10min para propagação das mudanças"
	@echo ""
	@echo "⚠️  SE O CLIENT_ID JÁ ESTÁ CORRETO:"
	@echo "   → O problema é o Extension ID no Google Cloud Console"
	@echo "   → Vá para: https://console.cloud.google.com/apis/credentials"
	@echo "   → Edite o Client ID: nbimliadaeimcfkngknobflgnkneiddl"
	@echo "   → Verifique se Application ID = Extension ID atual"
	@echo "   → Extension ID atual: vá para chrome://extensions/"
	@echo ""
	@echo "📖 Para guia completo, veja: OAUTH_TROUBLESHOOTING.md"

oauth-fix-redirect:
	@echo "🚨 CORREÇÃO PARA Error 400: redirect_uri_mismatch"
	@echo ""
	@echo "PASSO 1: Obter Extension ID atual"
	@echo "   1. Abra: chrome://extensions/"
	@echo "   2. Ative 'Modo do desenvolvedor'"
	@echo "   3. Encontre 'ChronoMark - Tag & Sync Bookmarks'"
	@echo "   4. COPIE o Extension ID (ex: abcdefghijklmnopqrstuvwxyz123456)"
	@echo ""
	@echo "PASSO 2: Configurar Google Cloud Console"
	@echo "   1. Abra: https://console.cloud.google.com/apis/credentials"
	@echo "   2. Encontre Client ID: nbimliadaeimcfkngknobflgnkneiddl"
	@echo "   3. Clique em EDITAR (ícone lápis)"
	@echo "   4. Application type = 'Chrome Extension'"
	@echo "   5. Application ID = Extension ID copiado no PASSO 1"
	@echo "   6. Clique SAVE"
	@echo ""
	@echo "PASSO 3: Aguardar e testar"
	@echo "   1. Aguarde 5-10 minutos"
	@echo "   2. Execute: make oauth-test"
	@echo ""
	@echo "⚡ IMPORTANTE: Extension ID muda a cada reload da extensão!"

oauth-fix-client-id:
	@echo "🚨 CORREÇÃO PARA 'bad client id' ERROR"
	@echo ""
	@echo "📋 Client ID atual no manifest.json:"
	@grep -o '"client_id":[^,]*' manifest.json || echo "   ❌ Client ID não encontrado!"
	@echo ""
	@echo "🔍 DIAGNÓSTICO:"
	@echo "1. Client ID pode estar incorreto ou não existir"
	@echo "2. Projeto pode estar desabilitado no Google Cloud"
	@echo "3. APIs necessárias podem não estar habilitadas"
	@echo ""
	@echo "🛠️  SOLUÇÕES:"
	@echo ""
	@echo "OPÇÃO A: Verificar Client ID existente"
	@echo "   1. Abra: https://console.cloud.google.com/apis/credentials"
	@echo "   2. Procure pelo Client ID atual do manifest.json (mostrado acima)"
	@echo "   3. Se não existir, vá para OPÇÃO B"
	@echo "   4. Se existir, verifique se está habilitado e configurado corretamente"
	@echo ""
	@echo "OPÇÃO B: Criar novo Client ID"
	@echo "   1. Abra: https://console.cloud.google.com/apis/credentials"
	@echo "   2. Clique '+ CREATE CREDENTIALS' → 'OAuth client ID'"
	@echo "   3. Application type = 'Chrome Extension'"
	@echo "   4. Name = 'ChronoMark Extension'"
	@echo "   5. Application ID = Extension ID (chrome://extensions/)"
	@echo "   6. COPIE o novo Client ID gerado"
	@echo "   7. Execute: make oauth-update-client-id CLIENT_ID=novo_client_id"
	@echo ""
	@echo "OPÇÃO C: Verificar APIs habilitadas"
	@echo "   1. Abra: https://console.cloud.google.com/apis/library"
	@echo "   2. Habilite: Google Drive API"
	@echo "   3. Habilite: Google Sheets API (se necessário)"
	@echo ""
	@echo "⚡ Após qualquer mudança, aguarde 5-10min e teste com: make oauth-test"

oauth-update-client-id:
	@if [ -z "$(CLIENT_ID)" ]; then \
		echo "❌ Erro: CLIENT_ID não fornecido"; \
		echo "Uso: make oauth-update-client-id CLIENT_ID=seu_novo_client_id"; \
		exit 1; \
	fi
	@echo "🔄 Atualizando Client ID no manifest.json..."
	@echo "📋 Client ID anterior:"
	@grep -o '"client_id":[^,]*' manifest.json || echo "   ❌ Client ID não encontrado!"
	@sed -i 's/"client_id":"[^"]*"/"client_id":"$(CLIENT_ID)"/g' manifest.json
	@echo "📋 Client ID atualizado:"
	@grep -o '"client_id":[^,]*' manifest.json
	@echo "✅ Client ID atualizado com sucesso!"
	@echo "🔨 Executando build da extensão..."
	@make build
	@echo "⚡ Agora recarregue a extensão em chrome://extensions/"
	@echo "🧪 Teste com: make oauth-test"

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

store-info:
	@echo "📝 INFORMAÇÕES PARA CHROME WEB STORE"
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
	@echo "🏷️  Permissões necessárias:"
	@echo "   • bookmarks - Gerenciar bookmarks do usuário"
	@echo "   • storage - Armazenar configurações locais"
	@echo "   • identity - Autenticação OAuth com Google"
	@echo "   • googleapis.com - Sincronização com Google Drive"
	@echo ""
	@echo "📸 Screenshots necessários: 1-5 imagens (1280x800px)"
	@echo "💡 Veja store-assets/STORE_LISTING.md para detalhes completos"

# Show help
help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "🔧 DESENVOLVIMENTO:"
	@echo "  make install          - Instalar dependências"
	@echo "  make test            - Executar testes"
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
	@echo "  make package         - Criar arquivo .zip para Chrome Web Store"
	@echo "  make store-info      - Informações para listagem"
	@echo "  make store-help      - Guia completo de publicação"