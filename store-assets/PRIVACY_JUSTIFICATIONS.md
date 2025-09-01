# Justificativas de Privacidade - ChronoMark

## Descrição de Propósito Único (Single Purpose Description)

**ChronoMark é um gerenciador inteligente de bookmarks que permite aos usuários organizar, sincronizar e encontrar seus favoritos usando tags personalizadas e inteligência artificial.**

O propósito único da extensão é melhorar a experiência de gerenciamento de bookmarks através de:
- Organização por tags inteligentes
- Sincronização segura com Google Drive
- Busca avançada com IA
- Interface moderna e intuitiva

---

## Justificativas de Permissões

### 1. **bookmarks** - Permissão de Bookmarks
**Justificativa**: Esta permissão é essencial para o funcionamento principal da extensão. Permite:
- Ler bookmarks existentes do Chrome para importação
- Criar novos bookmarks organizados por tags
- Atualizar bookmarks com metadados adicionais
- Sincronizar bookmarks entre dispositivos

Sem esta permissão, a extensão não pode cumprir seu propósito principal de gerenciar bookmarks.

### 2. **storage** - Armazenamento Local
**Justificativa**: Necessária para:
- Armazenar configurações do usuário (preferências de tema, configurações de sincronização)
- Cache local de tags e metadados dos bookmarks
- Armazenar tokens de autenticação do Google Drive (criptografados)
- Manter histórico de sincronização para evitar duplicatas

Todos os dados são armazenados localmente no dispositivo do usuário.

### 3. **identity** - Identidade do Usuário
**Justificativa**: Utilizada exclusivamente para:
- Autenticação OAuth2 com Google Drive para sincronização opcional
- Obter token de acesso seguro para API do Google Drive
- Identificar o usuário para sincronização entre dispositivos

Nenhum dado de identidade é coletado ou armazenado permanentemente. Apenas tokens temporários são utilizados.

### 4. **host permission (https://www.googleapis.com/*)** - Acesso a APIs do Google
**Justificativa**: Necessária para:
- Comunicação segura com Google Drive API para sincronização
- Upload/download de arquivos de backup dos bookmarks
- Verificação de autenticação OAuth2

Apenas endpoints específicos da API do Google são acessados, nunca outros sites.

### 5. **alarms** - Alarmes/Agendamento
**Justificativa**: Utilizada para:
- Sincronização automática periódica com Google Drive
- Limpeza de cache temporário
- Verificação de integridade dos dados

Nenhum alarme é usado para rastreamento ou coleta de dados.

### 6. **tabs** - Acesso a Abas
**Justificativa**: Necessária para:
- Detectar quando o usuário visita um site já marcado como bookmark
- Sugerir tags baseadas no conteúdo da página atual
- Facilitar a adição rápida de bookmarks da página ativa

Apenas metadados básicos (URL, título) são acessados, nunca o conteúdo da página.

### 7. **remote code** - Código Remoto
**Justificativa**: Utilizada para:
- Carregar bibliotecas de IA (Google Gemini) para sugestões de tags
- Atualizações de segurança da API do Google Drive
- Carregamento dinâmico de componentes de interface

Todo código remoto é carregado apenas de fontes confiáveis (Google APIs) e é usado exclusivamente para funcionalidades declaradas.

---

## Conformidade com Políticas de Privacidade

### Coleta de Dados
- ✅ **Nenhum dado pessoal é coletado** além do necessário para funcionamento
- ✅ **Dados ficam no dispositivo do usuário** ou no Google Drive pessoal
- ✅ **Nenhum rastreamento** de atividade de navegação
- ✅ **Nenhum compartilhamento** com terceiros

### Uso de Dados
- ✅ Dados são usados **apenas para funcionalidades declaradas**
- ✅ **Sincronização opcional** - usuário controla quando ativar
- ✅ **Transparência total** - código aberto disponível
- ✅ **Controle do usuário** - pode desativar qualquer funcionalidade

### Segurança
- ✅ **Criptografia** de tokens de autenticação
- ✅ **HTTPS** para todas as comunicações
- ✅ **OAuth2** padrão do Google para autenticação
- ✅ **Armazenamento local seguro** usando Chrome Storage API

---

## Certificação de Conformidade

**Certifico que o ChronoMark está em total conformidade com as Políticas do Programa de Desenvolvedores da Chrome Web Store:**

1. ✅ Todas as permissões são justificadas e necessárias
2. ✅ Nenhum dado é coletado desnecessariamente
3. ✅ Privacidade do usuário é respeitada
4. ✅ Funcionalidades são transparentes e documentadas
5. ✅ Código é auditável e seguro
6. ✅ Conformidade com LGPD e GDPR

---

**Data**: Janeiro 2025  
**Desenvolvedor**: ChronoMark Team  
**Versão**: 1.0.0  
**Contato**: suporte@chronomark.com