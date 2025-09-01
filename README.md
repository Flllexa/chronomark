<div align="center">

# 🔖 ChronoMark - Smart Bookmark Manager

**Organize, sincronize e encontre seus bookmarks com inteligência artificial**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen?style=for-the-badge&logo=googlechrome)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/flllexa/chronomark)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Transforme o caos dos seus bookmarks em uma biblioteca organizada e inteligente*

</div>

---

## ✨ Por que ChronoMark?

**Cansado de perder bookmarks importantes?** ChronoMark é a solução definitiva para gerenciar seus favoritos com **inteligência artificial**, **sincronização automática** e **organização por tags**.

### 🎯 Principais Funcionalidades

- **🏷️ Sistema de Tags Inteligente** - Organize bookmarks por categorias personalizadas
- **☁️ Sincronização Google Drive** - Seus dados seguros e acessíveis em qualquer lugar
- **🔍 Busca Avançada** - Encontre qualquer bookmark instantaneamente
- **🤖 IA Integrada** - Sugestões automáticas de tags e organização
- **📊 Estatísticas Detalhadas** - Acompanhe seus hábitos de navegação
- **🔒 Privacidade Total** - Seus dados ficam apenas com você

### 🚀 Benefícios Únicos

| Recurso | ChronoMark | Bookmarks Padrão |
|---------|------------|-------------------|
| **Tags Personalizadas** | ✅ Ilimitadas | ❌ Apenas pastas |
| **Sincronização** | ✅ Google Drive | ❌ Limitada |
| **Busca Inteligente** | ✅ IA + Filtros | ❌ Busca básica |
| **Estatísticas** | ✅ Detalhadas | ❌ Nenhuma |
| **Interface Moderna** | ✅ Dark/Light | ❌ Básica |

---

## 🎬 Como Funciona

### 1. **Instale e Configure**
```bash
# Clone o repositório
git clone https://github.com/flllexa/chronomark.git
cd chronomark

# Instale dependências
make install

# Configure sua API key do Gemini
echo "GEMINI_API_KEY=sua_api_key_aqui" > .env.local
```

### 2. **Build e Carregue no Chrome**
```bash
# Build da extensão
make build

# Carregue no Chrome:
# 1. Vá para chrome://extensions/
# 2. Ative o "Modo do desenvolvedor"
# 3. Clique em "Carregar sem compactação"
# 4. Selecione a pasta 'dist'
```

### 3. **Configure OAuth (Opcional)**
Para sincronização com Google Drive:
```bash
make oauth-setup    # Guia de configuração
make oauth-test     # Testar configuração
```

---

## 🛠️ Comandos Disponíveis

### **Desenvolvimento**
```bash
make help           # Mostrar todos os comandos
make install        # Instalar dependências
make build          # Build da extensão
make dev            # Modo desenvolvimento
```

### **Chrome Web Store**
```bash
make package        # Criar arquivo ZIP para publicação
make store-info     # Informações da loja
make store-help     # Guia de publicação
```

### **OAuth & Configuração**
```bash
make oauth-setup    # Configurar OAuth
make oauth-help     # Ajuda com OAuth
make oauth-test     # Testar configuração
```

---

## 📱 Screenshots

<div align="center">

### Interface Principal
*Organize seus bookmarks com tags inteligentes*

### Sistema de Tags
*Adicione e gerencie tags personalizadas*

### Sincronização Google Drive
*Seus dados seguros na nuvem*

</div>

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS Modules + Design System
- **Storage**: Chrome Storage API + IndexedDB
- **Sync**: Google Drive API
- **AI**: Google Gemini API
- **Build**: Makefile + Node.js

---

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/chronomark.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'Add: nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🆘 Suporte

- **📧 Email**: [suporte@chronomark.com](mailto:suporte@chronomark.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/flllexa/chronomark/issues)
- **📖 Documentação**: [Wiki do Projeto](https://github.com/flllexa/chronomark/wiki)

---

<div align="center">

**⭐ Se o ChronoMark te ajudou, deixe uma estrela no GitHub!**

*Feito com ❤️ para organizar a web*

</div>
