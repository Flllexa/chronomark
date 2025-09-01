# 🧪 Como Testar Extensão Aguardando Aprovação

## 📋 **Status: Extensão Submetida para Revisão**

Quando sua extensão está "aguardando aprovação" na Chrome Web Store, você tem algumas opções para continuar testando:

---

## 🔧 **Método 1: Teste Local (Recomendado)**

### ✅ **Vantagens:**
- Teste imediato
- Controle total sobre atualizações
- Sem limitações de funcionalidades

### 📋 **Passos:**
1. **Manter Código Local Atualizado**:
   ```bash
   # Gerar pacote atualizado
   make package
   ```

2. **Instalar em Modo Desenvolvedor**:
   - Chrome → Extensões → Modo Desenvolvedor (ON)
   - "Carregar sem compactação"
   - Selecionar pasta da extensão

3. **Testar Funcionalidades**:
   - Usar `make test-instructions` para guia
   - Testar todas as funcionalidades principais
   - Verificar OAuth e sincronização

---

## 🌐 **Método 2: Link de Teste da Chrome Web Store**

### ⚠️ **Limitações:**
- Disponível apenas durante revisão
- Link privado (não público)
- Funcionalidades podem estar limitadas

### 📋 **Como Acessar:**
1. **Chrome Web Store Developer Console**:
   - Acesse [console.developers.google.com](https://chrome.google.com/webstore/devconsole/)
   - Encontre sua extensão

2. **Link de Teste**:
   - Status: "Pending Review" ou "In Review"
   - Procure por "Test Link" ou "Preview"
   - Link formato: `chrome.google.com/webstore/detail/[ID]?authuser=0`

3. **Instalar via Link**:
   - Abrir link no Chrome
   - Clicar "Adicionar ao Chrome" (se disponível)
   - ⚠️ Pode não funcionar se ainda em revisão

---

## 👥 **Método 3: Teste com Usuários Confiáveis**

### 📋 **Compartilhar para Teste:**
1. **Gerar Pacote de Teste**:
   ```bash
   make package
   # Arquivo: chronomark-extension.zip
   ```

2. **Instruções para Testadores**:
   - Enviar arquivo .zip
   - Instruções de instalação manual
   - Usar `make test-instructions` como guia

3. **Coleta de Feedback**:
   - Criar formulário de feedback
   - Documentar bugs encontrados
   - Preparar atualizações se necessário

---

## 📊 **Durante o Período de Revisão**

### ⏳ **Tempo de Aprovação:**
- **Primeira submissão**: 1-7 dias úteis
- **Atualizações**: 1-3 dias úteis
- **Extensões complexas**: Até 14 dias

### 📧 **Acompanhar Status:**
1. **Email de Notificação**:
   - Google envia updates por email
   - Verificar spam/promoções

2. **Developer Console**:
   - Verificar status regularmente
   - Possíveis solicitações de correção

### 🔄 **Se Rejeitada:**
1. **Ler Feedback Detalhado**
2. **Corrigir Problemas Identificados**
3. **Resubmeter Nova Versão**
4. **Continuar Testando Localmente**

---

## 🛠️ **Comandos Úteis Durante Teste**

```bash
# Gerar pacote para distribuição
make package

# Ver instruções de teste
make test-instructions

# Verificar justificativas de privacidade
make privacy-justifications

# Checklist de publicação
make publication-checklist

# Informações da loja
make store-info
```

---

## 🚨 **Problemas Comuns e Soluções**

### ❌ **"Extensão não aparece na loja"**
- **Causa**: Ainda em revisão
- **Solução**: Aguardar aprovação ou testar localmente

### ❌ **"Link de teste não funciona"**
- **Causa**: Extensão ainda não processada
- **Solução**: Usar instalação manual local

### ❌ **"Funcionalidades não funcionam"**
- **Causa**: Restrições durante revisão
- **Solução**: Testar versão local completa

### ❌ **"OAuth não funciona"**
- **Causa**: URLs de callback não aprovadas
- **Solução**: Verificar configuração OAuth local

---

## 📋 **Checklist de Teste Durante Revisão**

- [ ] ✅ Teste local funcionando 100%
- [ ] ✅ Todas as funcionalidades principais testadas
- [ ] ✅ OAuth e sincronização funcionando
- [ ] ✅ Interface responsiva e sem bugs
- [ ] ✅ Performance adequada com muitos bookmarks
- [ ] ✅ Importação do Chrome funcionando
- [ ] ✅ Sistema de tags operacional
- [ ] ✅ Busca em tempo real funcionando
- [ ] ✅ Configurações salvando corretamente
- [ ] ✅ Sem erros no console do Chrome

---

## 📞 **Próximos Passos**

1. **Continuar desenvolvimento local**
2. **Preparar correções se necessário**
3. **Aguardar feedback da Google**
4. **Planejar estratégia de lançamento**
5. **Preparar documentação de usuário**

---

**⏱️ Recomendação: Use teste local como método principal durante revisão**
**🔧 Mantenha código sempre atualizado e testado**
**📧 Monitore emails da Google para updates**