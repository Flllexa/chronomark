# Exemplos de Integração - ChronoMark

Este diretório contém exemplos práticos de como integrar funcionalidades avançadas na extensão ChronoMark.

## 🤖 BookmarkFormWithAI.tsx

### Descrição
Exemplo completo de como integrar o sistema de sugestões de tags com IA no formulário de bookmarks existente.

### Funcionalidades
- ✅ **Sugestões Automáticas**: Gera tags automaticamente baseado no título e URL
- ✅ **Sistema de Confiança**: Mostra a confiança de cada sugestão (0-100%)
- ✅ **Múltiplas Fontes**: Domínio, palavras-chave, estrutura de URL e análise de conteúdo
- ✅ **Interface Intuitiva**: Botões para adicionar sugestões individuais ou todas de uma vez
- ✅ **Compatibilidade**: Mantém todas as funcionalidades do formulário original

### Como Usar

#### 1. Copiar Arquivos Necessários
```bash
# Copiar o serviço de IA
cp services/smartTaggingService.ts src/services/

# Copiar o exemplo do formulário
cp examples/BookmarkFormWithAI.tsx src/components/
```

#### 2. Substituir o Componente Original
```typescript
// Em vez de importar:
import { BookmarkForm } from './components/BookmarkForm';

// Importe:
import { BookmarkFormWithAI } from './components/BookmarkFormWithAI';
```

#### 3. Usar no Seu Código
```typescript
<BookmarkFormWithAI
    onSave={handleSave}
    onCancel={handleCancel}
    onUpdate={handleUpdate}
    initialData={bookmarkData}
    allTags={existingTags}
/>
```

### Funcionalidades da IA

#### 🌐 Análise de Domínio
- Detecta automaticamente o tipo de site (GitHub, YouTube, etc.)
- Sugere tags baseadas no domínio conhecido

#### 🔍 Palavras-chave
- Extrai palavras-chave relevantes do título
- Filtra palavras comuns e irrelevantes

#### 📁 Estrutura de URL
- Analisa a estrutura da URL para identificar categorias
- Detecta padrões como `/docs/`, `/blog/`, `/api/`

#### 📝 Análise de Conteúdo
- Processa o título para identificar tecnologias e tópicos
- Sugere tags baseadas no contexto do conteúdo

### Interface do Usuário

#### Botão de Sugestão
```
🤖 Sugerir Tags com IA
```
- Aparece quando título e URL estão preenchidos
- Mostra "⏳ Gerando..." durante o processamento

#### Sugestões de IA
```
🤖 Sugestões de IA:                    [Adicionar Todas]
🌐 javascript     85%
🔍 tutorial       72%
📁 documentation  68%
```
- Cada sugestão mostra ícone da fonte, tag e confiança
- Clique individual para adicionar uma tag
- Botão "Adicionar Todas" para aceitar todas as sugestões

### Personalização

#### Modificar Regras de IA
Edite o arquivo `services/smartTaggingService.ts`:

```typescript
// Adicionar novos domínios
const DOMAIN_MAPPINGS = {
    'meusite.com': ['minha-tag', 'categoria'],
    // ...
};

// Adicionar novas palavras-chave
const KEYWORD_MAPPINGS = {
    'minha-palavra': ['tag-relacionada'],
    // ...
};
```

#### Personalizar Interface
Modifique os estilos CSS no final do componente:

```typescript
.ai-suggest-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    // Seus estilos personalizados
}
```

### Integração com APIs Externas

Para usar APIs de IA reais em vez do sistema de regras:

```typescript
// Substituir a função generateAISuggestions
const generateAISuggestions = async () => {
    try {
        // Chamar sua API de IA
        const response = await fetch('/api/suggest-tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url })
        });
        
        const suggestions = await response.json();
        setAiSuggestions(suggestions);
    } catch (error) {
        console.error('Erro na API:', error);
        // Fallback para sistema de regras
        const fallbackSuggestions = SmartTaggingService.suggestTags(title, url);
        setAiSuggestions(fallbackSuggestions);
    }
};
```

### Considerações de Performance

- ✅ **Processamento Local**: Sem latência de rede
- ✅ **Cache Inteligente**: Evita reprocessamento desnecessário
- ✅ **Lazy Loading**: Sugestões geradas apenas quando necessário
- ✅ **Fallback Robusto**: Sistema de regras sempre disponível

### Próximos Passos

1. **Testar o Exemplo**: Copie e teste o componente
2. **Personalizar Regras**: Adicione domínios e palavras-chave específicos
3. **Integrar API Externa**: Se necessário, conecte com serviços de IA
4. **Melhorar Interface**: Customize a aparência conforme seu design

### Suporte

Para dúvidas sobre integração de IA:
- 📖 Consulte: `AI_INTEGRATION_GUIDE.md`
- 🛠️ Execute: `make ai-setup`
- 📝 Veja este exemplo: `examples/BookmarkFormWithAI.tsx`