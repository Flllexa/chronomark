# ✅ Checklist de Publicação - Chrome Web Store

## 🚨 Problemas Identificados e Soluções

Baseado nos erros de publicação, siga este guia passo a passo:

---

## 1. 📧 **Configurar Email de Contato**

### ❌ Problema:
- "You must provide a contact email before you can publish any item"
- "You must verify your contact email before you can publish any item"

### ✅ Solução:
1. Acesse [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/)
2. Vá para **Account tab**
3. Adicione seu email de contato
4. **Verifique o email** (check your inbox)
5. Clique no link de verificação recebido

---

## 2. 🔒 **Preencher Privacy Practices Tab**

### ❌ Problemas:
- Justificativas para todas as permissões são obrigatórias
- Descrição de propósito único é obrigatória
- Certificação de conformidade é obrigatória

### ✅ Solução - Copie e Cole as Informações Abaixo:

#### **Single Purpose Description:**
```
ChronoMark é um gerenciador inteligente de bookmarks que permite aos usuários organizar, sincronizar e encontrar seus favoritos usando tags personalizadas e inteligência artificial. O propósito único é melhorar a experiência de gerenciamento de bookmarks através de organização por tags inteligentes, sincronização segura com Google Drive, busca avançada com IA e interface moderna.
```

#### **Justification for alarms:**
```
Utilizada para sincronização automática periódica com Google Drive, limpeza de cache temporário e verificação de integridade dos dados. Nenhum alarme é usado para rastreamento ou coleta de dados.
```

#### **Justification for bookmarks:**
```
Essencial para o funcionamento principal da extensão. Permite ler bookmarks existentes do Chrome para importação, criar novos bookmarks organizados por tags, atualizar bookmarks com metadados adicionais e sincronizar bookmarks entre dispositivos. Sem esta permissão, a extensão não pode cumprir seu propósito principal.
```

#### **Justification for host permission use:**
```
Necessária para comunicação segura com Google Drive API para sincronização opcional, upload/download de arquivos de backup dos bookmarks e verificação de autenticação OAuth2. Apenas endpoints específicos da API do Google (googleapis.com) são acessados, nunca outros sites.
```

#### **Justification for identity:**
```
Utilizada exclusivamente para autenticação OAuth2 com Google Drive para sincronização opcional, obter token de acesso seguro para API do Google Drive e identificar o usuário para sincronização entre dispositivos. Nenhum dado de identidade é coletado ou armazenado permanentemente. Apenas tokens temporários são utilizados.
```

#### **Justification for remote code use:**
```
Utilizada para carregar bibliotecas de IA (Google Gemini) para sugestões de tags, atualizações de segurança da API do Google Drive e carregamento dinâmico de componentes de interface. Todo código remoto é carregado apenas de fontes confiáveis (Google APIs) e é usado exclusivamente para funcionalidades declaradas.
```

#### **Justification for storage:**
```
Necessária para armazenar configurações do usuário (preferências de tema, configurações de sincronização), cache local de tags e metadados dos bookmarks, armazenar tokens de autenticação do Google Drive (criptografados) e manter histórico de sincronização para evitar duplicatas. Todos os dados são armazenados localmente no dispositivo do usuário.
```

#### **Justification for tabs:**
```
Necessária para detectar quando o usuário visita um site já marcado como bookmark, sugerir tags baseadas no conteúdo da página atual e facilitar a adição rápida de bookmarks da página ativa. Apenas metadados básicos (URL, título) são acessados, nunca o conteúdo da página.
```

---

## 3. ✅ **Certificação de Conformidade**

### ❌ Problema:
- "To publish your item, you must certify that your data usage complies with our Developer Program Policies"

### ✅ Solução:
1. Na **Privacy practices tab**
2. Marque a checkbox de certificação
3. Confirme que:
   - ✅ Nenhum dado pessoal é coletado desnecessariamente
   - ✅ Dados ficam no dispositivo do usuário ou Google Drive pessoal
   - ✅ Nenhum rastreamento de atividade de navegação
   - ✅ Nenhum compartilhamento com terceiros
   - ✅ Conformidade com LGPD e GDPR

---

## 4. 💾 **Salvar Rascunho**

### ✅ Ação:
1. Após preencher todas as informações
2. Clique em **"Save Draft"**
3. Verifique se todos os campos estão preenchidos
4. Aguarde confirmação de salvamento

---

## 5. 🚀 **Publicar**

### ✅ Passos Finais:
1. Revise todas as informações
2. Confirme que todos os ❌ viraram ✅
3. Clique em **"Submit for Review"**
4. Aguarde aprovação (1-3 dias úteis)

---

## 📋 **Checklist Final**

- [ ] ✅ Email de contato adicionado
- [ ] ✅ Email de contato verificado
- [ ] ✅ Single purpose description preenchida
- [ ] ✅ Justificativa para alarms
- [ ] ✅ Justificativa para bookmarks
- [ ] ✅ Justificativa para host permissions
- [ ] ✅ Justificativa para identity
- [ ] ✅ Justificativa para remote code
- [ ] ✅ Justificativa para storage
- [ ] ✅ Justificativa para tabs
- [ ] ✅ Certificação de conformidade marcada
- [ ] ✅ Rascunho salvo
- [ ] ✅ Submetido para revisão

---

## 🆘 **Comandos Úteis**

```bash
# Ver justificativas organizadas
make privacy-justifications

# Ver informações da loja
make store-info

# Guia completo de publicação
make store-help
```

---

**🎯 Após seguir todos os passos, sua extensão estará pronta para publicação!**