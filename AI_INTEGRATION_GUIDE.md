# 🤖 Guia de Integração com IA Sem Chaves de API

## 📋 **Métodos para Integrar IA Sem Expor Chaves**

### 🔒 **Problema Atual**
A extensão ChronoMark atualmente não usa IA (arquivo `geminiService.ts` foi removido), mas há várias formas de integrar inteligência artificial sem expor chaves de API diretamente no código da extensão.

---

## 🌐 **Método 1: Proxy Backend (Recomendado)**

### ✅ **Vantagens:**
- Chaves de API ficam seguras no servidor
- Controle total sobre uso e limites
- Possibilidade de cache e otimização
- Múltiplos provedores de IA

### 🏗️ **Implementação:**

#### **1. Criar Servidor Proxy**
```javascript
// server.js (Node.js + Express)
const express = require('express');
const app = express();

// Chave fica segura no servidor
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/suggest-tags', async (req, res) => {
  const { title, url } = req.body;
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Sugira 3-5 tags para este bookmark: Título: ${title}, URL: ${url}`
          }]
        }]
      })
    });
    
    const data = await response.json();
    res.json({ tags: extractTags(data) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar tags' });
  }
});
```

#### **2. Integrar na Extensão**
```typescript
// services/aiService.ts
export class AIService {
  private static readonly API_BASE = 'https://seu-servidor.com/api';
  
  static async suggestTags(title: string, url: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_BASE}/suggest-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url })
      });
      
      const data = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Erro ao sugerir tags:', error);
      return [];
    }
  }
}
```

---

## 🆓 **Método 2: APIs Gratuitas Sem Autenticação**

### 🌟 **Opções Disponíveis:**

#### **1. Hugging Face Inference API (Gratuita)**
```typescript
// services/huggingFaceService.ts
export class HuggingFaceService {
  private static readonly API_URL = 'https://api-inference.huggingface.co/models';
  
  static async classifyContent(text: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_URL}/facebook/bart-large-mnli`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            candidate_labels: ['tecnologia', 'educação', 'entretenimento', 'negócios', 'saúde']
          }
        })
      });
      
      const data = await response.json();
      return data.labels?.slice(0, 3) || [];
    } catch (error) {
      return [];
    }
  }
}
```

#### **2. OpenAI-Compatible APIs Gratuitas**
```typescript
// services/freeAIService.ts
export class FreeAIService {
  // Groq (gratuito com limite)
  private static readonly GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
  
  static async generateTags(title: string, url: string): Promise<string[]> {
    const prompt = `Baseado no título "${title}" e URL "${url}", sugira 3-5 tags relevantes em português. Responda apenas com as tags separadas por vírgula.`;
    
    try {
      const response = await fetch(this.GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Usar token público ou proxy
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100
        })
      });
      
      const data = await response.json();
      const tags = data.choices[0]?.message?.content?.split(',').map(t => t.trim()) || [];
      return tags.slice(0, 5);
    } catch (error) {
      return [];
    }
  }
}
```

---

## 🔧 **Método 3: IA Local no Navegador**

### 🧠 **Web AI APIs (Experimental)**
```typescript
// services/localAIService.ts
export class LocalAIService {
  private static model: any = null;
  
  static async initializeModel() {
    try {
      // Usar WebLLM ou similar
      const { WebLLM } = await import('@mlc-ai/web-llm');
      this.model = new WebLLM();
      await this.model.reload('Llama-2-7b-chat-hf-q4f16_1');
    } catch (error) {
      console.error('Erro ao carregar modelo local:', error);
    }
  }
  
  static async suggestTags(title: string, url: string): Promise<string[]> {
    if (!this.model) return [];
    
    const prompt = `Sugira tags para: ${title} (${url})`;
    
    try {
      const response = await this.model.chat(prompt);
      return this.extractTags(response);
    } catch (error) {
      return [];
    }
  }
  
  private static extractTags(response: string): string[] {
    // Extrair tags da resposta
    return response.split(',').map(tag => tag.trim()).slice(0, 5);
  }
}
```

---

## 🎯 **Método 4: IA Baseada em Regras (Sem API)**

### 🔍 **Sistema Inteligente Local**
```typescript
// services/smartTaggingService.ts
export class SmartTaggingService {
  private static readonly DOMAIN_TAGS = {
    'github.com': ['desenvolvimento', 'código', 'tecnologia'],
    'stackoverflow.com': ['programação', 'desenvolvimento', 'ajuda'],
    'youtube.com': ['vídeo', 'entretenimento', 'educação'],
    'medium.com': ['artigo', 'blog', 'leitura'],
    'linkedin.com': ['profissional', 'carreira', 'networking']
  };
  
  private static readonly KEYWORD_TAGS = {
    'tutorial': ['educação', 'aprendizado'],
    'api': ['desenvolvimento', 'tecnologia'],
    'react': ['frontend', 'javascript', 'desenvolvimento'],
    'python': ['programação', 'desenvolvimento'],
    'design': ['ui/ux', 'criativo']
  };
  
  static suggestTags(title: string, url: string): string[] {
    const tags = new Set<string>();
    
    // Tags baseadas no domínio
    const domain = new URL(url).hostname;
    const domainTags = this.DOMAIN_TAGS[domain] || [];
    domainTags.forEach(tag => tags.add(tag));
    
    // Tags baseadas em palavras-chave
    const text = `${title} ${url}`.toLowerCase();
    Object.entries(this.KEYWORD_TAGS).forEach(([keyword, keywordTags]) => {
      if (text.includes(keyword)) {
        keywordTags.forEach(tag => tags.add(tag));
      }
    });
    
    // Tags baseadas na estrutura da URL
    if (url.includes('/docs/')) tags.add('documentação');
    if (url.includes('/blog/')) tags.add('blog');
    if (url.includes('/tutorial/')) tags.add('tutorial');
    
    return Array.from(tags).slice(0, 5);
  }
}
```

---

## 🚀 **Implementação na Extensão ChronoMark**

### 📝 **1. Atualizar BookmarkForm.tsx**
```typescript
// components/BookmarkForm.tsx
import { SmartTaggingService } from '../services/smartTaggingService';

const BookmarkForm = () => {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  
  const handleSuggestTags = async () => {
    if (!title || !url) return;
    
    // Método 1: IA Local (sem API)
    const localTags = SmartTaggingService.suggestTags(title, url);
    setSuggestedTags(localTags);
    
    // Método 2: API Externa (opcional)
    try {
      const aiTags = await AIService.suggestTags(title, url);
      if (aiTags.length > 0) {
        setSuggestedTags(prev => [...new Set([...prev, ...aiTags])]);
      }
    } catch (error) {
      // Falha silenciosa - usar apenas tags locais
    }
  };
  
  return (
    <div>
      {/* Formulário existente */}
      <button onClick={handleSuggestTags}>🤖 Sugerir Tags</button>
      
      {suggestedTags.length > 0 && (
        <div className="suggested-tags">
          <p>Tags sugeridas:</p>
          {suggestedTags.map(tag => (
            <button key={tag} onClick={() => addTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 📝 **2. Adicionar ao Makefile**
```makefile
# Configurar integração com IA
ai-setup:
	@echo "🤖 CONFIGURAÇÃO DE IA - CHRONOMARK"
	@echo "═══════════════════════════════════════"
	@echo ""
	@echo "📋 MÉTODOS DISPONÍVEIS:"
	@echo "1. 🔒 Proxy Backend (Recomendado)"
	@echo "2. 🆓 APIs Gratuitas (HuggingFace, Groq)"
	@echo "3. 🧠 IA Local (WebLLM)"
	@echo "4. 🎯 Regras Inteligentes (Sem API)"
	@echo ""
	@echo "📄 Guia completo: AI_INTEGRATION_GUIDE.md"
```

---

## 🔒 **Considerações de Segurança**

### ✅ **Boas Práticas:**
1. **Nunca** incluir chaves de API no código da extensão
2. **Sempre** usar HTTPS para comunicação
3. **Validar** todas as entradas do usuário
4. **Implementar** rate limiting no proxy
5. **Usar** fallbacks locais quando APIs falham

### 🚨 **Evitar:**
- Chaves hardcoded no código
- APIs sem autenticação em produção
- Dados sensíveis em logs
- Requests sem timeout

---

## 📊 **Comparação de Métodos**

| Método | Custo | Segurança | Performance | Complexidade |
|--------|-------|-----------|-------------|-------------|
| Proxy Backend | Baixo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| APIs Gratuitas | Grátis | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| IA Local | Grátis | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Regras Locais | Grátis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |

---

## 🎯 **Recomendação Final**

**Para ChronoMark, recomendo começar com:**

1. **🎯 Sistema de Regras Locais** (implementação imediata)
2. **🆓 API Gratuita** como fallback (HuggingFace)
3. **🔒 Proxy Backend** para funcionalidades avançadas (futuro)

Esta abordagem oferece:
- ✅ Funcionalidade imediata sem APIs
- ✅ Melhoria gradual com IA externa
- ✅ Segurança total das chaves
- ✅ Experiência do usuário consistente

---

**💡 Próximos passos: Use `make ai-setup` para ver opções de configuração**