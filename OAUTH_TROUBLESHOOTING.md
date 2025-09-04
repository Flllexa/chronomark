# OAuth Troubleshooting - Error 400: redirect_uri_mismatch

## Problema Atual
Você está recebendo "Error 400: redirect_uri_mismatch" mesmo com as configurações aparentemente corretas.

## Checklist de Verificação

### 1. ✅ Verificar Client ID
- Client ID atual no manifest.json: `<ID>.apps.googleusercontent.com`
- ✅ Este valor está correto

### 2. 🔍 Verificar Extension ID
**CRÍTICO**: O Extension ID muda a cada vez que você carrega a extensão no modo desenvolvedor!

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação" e selecione a pasta `dist/`
4. **COPIE O NOVO Extension ID** que aparece
5. **IMPORTANTE**: Se você recarregar a extensão, o ID pode mudar!

### 3. 🔧 Configurar Google Cloud Console
1. Vá para: https://console.cloud.google.com/apis/credentials
2. Encontre o Client ID: `nbimliadaeimcfkngknobflgnkneiddl`
3. Clique em **"Editar"** (ícone de lápis)
4. **VERIFIQUE**:
   - Application type = **"Chrome Extension"** (NÃO "Web application")
   - Application ID = **Extension ID copiado do passo 2**
5. Clique em **"Save"**

### 4. 🧪 Testar a Configuração
```bash
make oauth-test
```

## Possíveis Causas do Erro

### A. Extension ID Incorreto
- **Sintoma**: Erro persiste mesmo após configuração
- **Solução**: Verifique se o Extension ID no Google Cloud Console é EXATAMENTE o mesmo do chrome://extensions/

### B. Tipo de Aplicação Incorreto
- **Sintoma**: Erro "redirect_uri_mismatch"
- **Solução**: Certifique-se que está configurado como "Chrome Extension", não "Web application"

### C. Cache do Chrome
- **Sintoma**: Erro persiste após configuração correta
- **Solução**: 
  1. Feche o Chrome completamente
  2. Reabra o Chrome
  3. Recarregue a extensão
  4. Teste novamente

### D. Propagação das Configurações
- **Sintoma**: Configuração parece correta mas erro persiste
- **Solução**: Aguarde 5-10 minutos para as mudanças no Google Cloud Console se propagarem

## Comandos Úteis

```bash
# Diagnóstico completo
make oauth-debug

# Obter Extension ID
make oauth-extension-id

# Testar OAuth
make oauth-test

# Reconstruir extensão
make build
```

## Formato Correto do Redirect URI
Para extensões Chrome, o redirect URI é automaticamente:
```
https://SEU_EXTENSION_ID.chromiumapp.org/
```

**Exemplo**: Se seu Extension ID é `abcdefghijklmnopqrstuvwxyz123456`, o redirect URI será:
```
https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/
```

## Se Nada Funcionar

1. **Delete e recrie o OAuth Client**:
   - Vá para Google Cloud Console
   - Delete o client atual
   - Crie um novo como "Chrome Extension"
   - Atualize o manifest.json com o novo client_id

2. **Verifique as APIs habilitadas**:
   - Google Drive API
   - Google+ API (ou People API)

3. **Teste com Extension ID fixo**:
   - Publique a extensão na Chrome Web Store (mesmo como não listada)
   - Use o Extension ID fixo da store

## Logs de Debug
Para ver logs detalhados:
1. Abra DevTools na extensão (F12)
2. Vá para a aba Console
3. Execute o teste OAuth
4. Verifique mensagens de erro específicas