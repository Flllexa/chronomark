# Guia de Publicação na Chrome Web Store

## 📋 Pré-requisitos

### 1. Conta de Desenvolvedor
- [ ] Conta Google ativa
- [ ] Taxa única de $5 USD paga no [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [ ] Verificação de identidade concluída

### 2. Extensão Pronta
- [ ] OAuth configurado e funcionando
- [ ] Testes completos realizados
- [ ] Versão final buildada
- [ ] Arquivo ZIP criado

## 🛠️ Preparação para Publicação

### Comandos Makefile Disponíveis
```bash
# Criar pacote para Chrome Web Store
make package

# Validar extensão antes da publicação
make validate-store

# Preparar todos os assets necessários
make prepare-store-assets
```

## 📦 Assets Necessários

### 1. Ícones (✅ Já disponíveis)
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px  
- `icon128.png` - 128x128px

### 2. Screenshots (Obrigatório)
- **Tamanho:** 1280x800px ou 640x400px
- **Formato:** PNG ou JPEG
- **Quantidade:** Mínimo 1, máximo 5
- **Conteúdo:** Mostrar funcionalidades principais da extensão

### 3. Tile Icon (Opcional)
- **Tamanho:** 440x280px
- **Formato:** PNG
- **Uso:** Destaque na Chrome Web Store

### 4. Promotional Images (Opcional)
- **Small tile:** 440x280px
- **Large tile:** 920x680px
- **Marquee:** 1400x560px

## 📝 Informações da Listagem

### Informações Básicas
- **Nome:** ChronoMark - Tag & Sync Bookmarks
- **Descrição Curta:** Organize e sincronize seus bookmarks com tags inteligentes e backup no Google Drive
- **Categoria:** Productivity
- **Idioma:** Portuguese (Brazil) / English

### Descrição Detalhada
```
🔖 ChronoMark - Organize seus bookmarks como nunca antes!

✨ RECURSOS PRINCIPAIS:
• 🏷️ Sistema de tags inteligente para organização
• ☁️ Sincronização automática com Google Drive
• 🔍 Busca avançada por título, URL e tags
• 📱 Interface moderna e responsiva
• 🚀 Performance otimizada com virtualização
• 🔒 Dados seguros e privados

🎯 FUNCIONALIDADES:
• Adicione tags personalizadas aos seus bookmarks
• Sincronize automaticamente com Google Drive
• Busque rapidamente por qualquer bookmark
• Gerencie tags com facilidade
• Backup automático dos seus dados
• Interface limpa e intuitiva

🔧 COMO USAR:
1. Instale a extensão
2. Configure a sincronização com Google Drive
3. Comece a organizar seus bookmarks com tags
4. Aproveite a busca rápida e eficiente!

🛡️ PRIVACIDADE:
Seus dados ficam seguros no seu Google Drive pessoal. Não coletamos nem compartilhamos informações pessoais.

💡 SUPORTE:
Problemas ou sugestões? Entre em contato através do GitHub.
```

## 🔒 Privacidade e Permissões

### Permissões Utilizadas
- `bookmarks` - Acesso aos bookmarks do Chrome
- `storage` - Armazenamento local de configurações
- `identity` - Autenticação com Google Drive
- `https://www.googleapis.com/*` - API do Google Drive

### Justificativas
- **bookmarks:** Necessário para ler e organizar os bookmarks do usuário
- **storage:** Armazenar configurações e cache local
- **identity:** Autenticação OAuth para sincronização
- **googleapis.com:** Comunicação com Google Drive API

## 📋 Checklist de Publicação

### Antes de Enviar
- [ ] Extensão testada em diferentes cenários
- [ ] OAuth funcionando corretamente
- [ ] Screenshots criados
- [ ] Descrição revisada
- [ ] Política de privacidade criada
- [ ] Arquivo ZIP gerado com `make package`
- [ ] Versão no manifest.json atualizada

### Durante o Envio
- [ ] Upload do arquivo ZIP
- [ ] Preenchimento de todas as informações
- [ ] Upload dos screenshots
- [ ] Configuração de privacidade
- [ ] Revisão final
- [ ] Submissão para análise

### Após o Envio
- [ ] Aguardar revisão (1-3 dias úteis)
- [ ] Responder a possíveis solicitações de mudança
- [ ] Publicação aprovada
- [ ] Monitorar reviews e feedback

## 🚀 Processo de Publicação

### 1. Preparar Pacote
```bash
# Gerar versão final
make build

# Criar pacote ZIP
make package
```

### 2. Acessar Developer Dashboard
1. Vá para [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Faça login com sua conta Google
3. Pague a taxa de $5 USD (se ainda não pago)

### 3. Criar Nova Listagem
1. Clique em "Add new item"
2. Faça upload do arquivo ZIP
3. Preencha todas as informações obrigatórias
4. Adicione screenshots
5. Configure privacidade e permissões

### 4. Submeter para Revisão
1. Revise todas as informações
2. Clique em "Submit for review"
3. Aguarde aprovação (1-3 dias úteis)

## ⚠️ Possíveis Problemas

### Rejeições Comuns
- **Permissões desnecessárias:** Justificar todas as permissões
- **Política de privacidade:** Deve estar clara e acessível
- **Funcionalidade limitada:** Demonstrar valor real
- **Screenshots inadequados:** Mostrar funcionalidades reais

### Soluções
- Revisar política de privacidade
- Melhorar screenshots
- Documentar melhor as funcionalidades
- Responder rapidamente às solicitações

## 📞 Suporte

- **Chrome Web Store Help:** https://support.google.com/chrome_webstore/
- **Developer Policies:** https://developer.chrome.com/docs/webstore/program-policies/
- **GitHub Issues:** Para problemas técnicos da extensão

---

**Próximos passos:**
1. Execute `make prepare-store-assets` para preparar todos os assets
2. Execute `make validate-store` para validação final
3. Execute `make package` para criar o arquivo ZIP
4. Siga o processo de publicação acima