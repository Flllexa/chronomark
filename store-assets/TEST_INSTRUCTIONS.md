# 🧪 Instruções de Teste - ChronoMark Extension

## 📋 **Informações para Equipe Chrome Web Store**

### 🔐 **Conta de Teste**
- **Email**: chronomark.test@gmail.com
- **Senha**: ChromeTest2024!
- **Google Drive**: Configurado com permissões OAuth
- **Dados de Teste**: Bookmarks pré-configurados com tags

---

## 🚀 **Configuração Inicial**

### 1. **Instalação da Extensão**
1. Baixar o arquivo `.zip` da extensão
2. Abrir Chrome → Extensões → Modo Desenvolvedor
3. "Carregar sem compactação" → Selecionar pasta da extensão
4. Verificar se o ícone ChronoMark aparece na barra de ferramentas

### 2. **Primeira Execução**
1. Clicar no ícone da extensão
2. A interface principal deve abrir mostrando:
   - Lista de bookmarks existentes do Chrome
   - Barra de pesquisa no topo
   - Botão "+" para adicionar novos bookmarks
   - Ícone de configurações (engrenagem)

---

## 🧪 **Testes de Funcionalidades**

### ✅ **Teste 1: Gerenciamento Básico de Bookmarks**
1. **Adicionar Bookmark**:
   - Clicar no botão "+"
   - Preencher: Título, URL, Tags
   - Verificar se aparece na lista

2. **Editar Bookmark**:
   - Clicar em qualquer bookmark existente
   - Modificar título ou tags
   - Salvar e verificar alterações

3. **Buscar Bookmarks**:
   - Digitar na barra de pesquisa
   - Verificar filtragem em tempo real
   - Testar busca por tags

### ✅ **Teste 2: Sistema de Tags**
1. **Adicionar Tags**:
   - Criar bookmark com múltiplas tags
   - Verificar se tags aparecem como chips coloridos

2. **Filtrar por Tags**:
   - Clicar em uma tag
   - Verificar se mostra apenas bookmarks com essa tag

3. **Gerenciar Tags** (Configurações):
   - Abrir Settings → Manage Tags
   - Renomear/deletar tags existentes
   - Verificar atualização automática nos bookmarks

### ✅ **Teste 3: Sincronização Google Drive** (OPCIONAL)
1. **Configurar OAuth**:
   - Settings → Automatic Sync → Ativar
   - Fazer login com conta de teste
   - Aguardar confirmação de conexão

2. **Testar Sincronização**:
   - Adicionar novo bookmark
   - Verificar status "Last synced" atualizado
   - Verificar arquivo no Google Drive (chronomark_bookmarks.json)

3. **Importar do Chrome**:
   - Settings → Import Bookmarks → "Import from Chrome"
   - Verificar importação de bookmarks existentes
   - Verificar sugestões automáticas de tags

### ✅ **Teste 4: Interface e Usabilidade**
1. **Responsividade**:
   - Redimensionar janela da extensão
   - Verificar adaptação do layout

2. **Tema Escuro**:
   - Interface já em tema escuro por padrão
   - Verificar contraste e legibilidade

3. **Performance**:
   - Testar com 50+ bookmarks
   - Verificar velocidade de busca
   - Verificar scroll suave na lista

---

## 🔍 **Cenários de Teste Específicos**

### 📚 **Cenário 1: Usuário Novo**
1. Instalar extensão sem bookmarks existentes
2. Adicionar primeiro bookmark
3. Explorar interface e configurações
4. Importar bookmarks do Chrome

### 🔄 **Cenário 2: Usuário com Muitos Bookmarks**
1. Importar 100+ bookmarks do Chrome
2. Testar performance da busca
3. Organizar com tags
4. Testar sincronização

### 🌐 **Cenário 3: Sincronização Multi-Dispositivo**
1. Configurar Google Drive em um "dispositivo"
2. Adicionar bookmarks
3. Simular segundo dispositivo (limpar dados locais)
4. Verificar restauração via Google Drive

---

## ⚠️ **Problemas Conhecidos e Soluções**

### 🔐 **OAuth Google Drive**
- **Problema**: Erro de autenticação
- **Solução**: Verificar se popup não foi bloqueado
- **Alternativa**: Usar modo sem sincronização

### 📱 **Performance**
- **Problema**: Lentidão com muitos bookmarks
- **Solução**: Usar busca para filtrar resultados
- **Otimização**: Lista virtualizada implementada

### 🏷️ **Tags**
- **Problema**: Tags não aparecem
- **Solução**: Verificar se foram salvas corretamente
- **Dica**: Pressionar Enter após digitar tag

---

## 📊 **Dados de Teste Pré-configurados**

### 🔖 **Bookmarks de Exemplo**
```
1. "Google" - https://google.com - Tags: [search, tools]
2. "GitHub" - https://github.com - Tags: [dev, code, git]
3. "Stack Overflow" - https://stackoverflow.com - Tags: [dev, help, programming]
4. "YouTube" - https://youtube.com - Tags: [video, entertainment]
5. "Netflix" - https://netflix.com - Tags: [streaming, movies]
```

### 🏷️ **Tags Sugeridas**
- Desenvolvimento: `dev`, `code`, `programming`, `tools`
- Entretenimento: `video`, `music`, `games`, `streaming`
- Trabalho: `work`, `productivity`, `business`
- Educação: `learning`, `courses`, `documentation`

---

## 🎯 **Critérios de Sucesso**

### ✅ **Funcionalidades Essenciais**
- [ ] Adicionar/editar/deletar bookmarks
- [ ] Sistema de tags funcionando
- [ ] Busca em tempo real
- [ ] Interface responsiva
- [ ] Importação do Chrome

### ✅ **Funcionalidades Avançadas**
- [ ] Sincronização Google Drive (opcional)
- [ ] Sugestões automáticas de tags
- [ ] Performance com muitos bookmarks
- [ ] Gerenciamento de tags

### ✅ **Experiência do Usuário**
- [ ] Interface intuitiva
- [ ] Feedback visual adequado
- [ ] Sem erros de JavaScript
- [ ] Carregamento rápido

---

## 📞 **Contato para Suporte**
- **Email**: chronomark.support@gmail.com
- **Documentação**: Disponível na pasta `store-assets/`
- **Código Fonte**: Disponível para auditoria

---

**⏱️ Tempo estimado de teste: 15-20 minutos**
**🔧 Versão testada: 1.0.0**
**📅 Última atualização: Janeiro 2024**