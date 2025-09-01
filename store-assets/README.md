# Chrome Web Store Assets - ChronoMark

## 📸 Screenshots Criados

Este diretório contém os assets necessários para publicação na Chrome Web Store:

### Screenshots Principais (1280x800px)
- `screenshot-1-main-interface.png` - Interface principal com bookmarks e tags
- `screenshot-2-edit-bookmark.png` - Modal de edição de bookmark com sistema de tags
- `screenshot-3-settings.png` - Tela de configurações com sincronização Google Drive

### Screenshots Alternativos (640x400px)
- `screenshot-1-main-interface-small.png`
- `screenshot-2-edit-bookmark-small.png` 
- `screenshot-3-settings-small.png`

## 🎯 Funcionalidades Demonstradas

### Screenshot 1: Interface Principal
- ✅ Lista de bookmarks organizada
- ✅ Sistema de tags coloridas
- ✅ Barra de busca
- ✅ Status de sincronização
- ✅ Estatísticas e tags populares
- ✅ Dados sensíveis obfuscados (URLs parcialmente mascaradas)

### Screenshot 2: Edição de Bookmark
- ✅ Modal de edição intuitivo
- ✅ Sistema de tags com remoção fácil
- ✅ Adição de novas tags
- ✅ Interface moderna e responsiva
- ✅ Callouts explicativos das funcionalidades

### Screenshot 3: Configurações
- ✅ Sincronização automática com Google Drive
- ✅ Localização dos dados no Google Drive
- ✅ Gerenciamento de tags
- ✅ Import inteligente do Chrome
- ✅ Destaques de privacidade e segurança

## 📋 Informações para Chrome Web Store

### Requisitos Atendidos
- ✅ Dimensões: 1280x800px (recomendado) e 640x400px (alternativo)
- ✅ Formato: PNG de alta qualidade
- ✅ Quantidade: 3 screenshots (dentro do limite de 1-5)
- ✅ Conteúdo: Demonstra funcionalidades principais
- ✅ Privacidade: Dados sensíveis obfuscados

### Como Usar na Publicação

1. **Acesse**: [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)
2. **Faça Upload**: Use os arquivos PNG de 1280x800px
3. **Ordem Sugerida**:
   - Screenshot 1: Interface principal (primeira impressão)
   - Screenshot 2: Funcionalidade de tags (diferencial)
   - Screenshot 3: Configurações e privacidade (confiança)

## 🛠️ Comandos Makefile

```bash
# Converter SVG para PNG (1280x800)
make convert-screenshots

# Converter SVG para PNG pequeno (640x400)
make convert-screenshots-small

# Ver informações da loja
make store-info

# Guia completo de publicação
make store-help
```

## 📝 Descrições Sugeridas para Cada Screenshot

### Screenshot 1
**"Interface principal do ChronoMark mostrando bookmarks organizados com tags inteligentes e sincronização em tempo real."**

### Screenshot 2
**"Sistema avançado de tags permitindo organização flexível e busca rápida dos seus bookmarks favoritos."**

### Screenshot 3
**"Configurações de privacidade e sincronização segura com Google Drive - seus dados ficam apenas com você."**

## 🔒 Privacidade nos Screenshots

- ✅ URLs parcialmente mascaradas (ex: `https://aitm**.com/`)
- ✅ Nenhum dado pessoal real exposto
- ✅ Exemplos representativos das funcionalidades
- ✅ Foco nas funcionalidades, não nos dados

## 📊 Especificações Técnicas

- **Resolução**: 1280x800px (16:10) e 640x400px
- **Formato**: PNG com transparência
- **Qualidade**: 96 DPI
- **Tamanho**: ~60-110KB por screenshot
- **Cores**: Esquema escuro moderno
- **Fonte**: Arial/Sans-serif para compatibilidade

---

**Próximo passo**: Use `make package` para criar o arquivo ZIP final e publique na Chrome Web Store!