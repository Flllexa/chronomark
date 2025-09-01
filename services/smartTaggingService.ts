/**
 * Smart Tagging Service - Sistema de IA baseado em regras
 * Gera tags inteligentes sem necessidade de APIs externas
 */

export interface TagSuggestion {
  tag: string;
  confidence: number;
  source: 'domain' | 'keyword' | 'url_structure' | 'content_analysis' | 'ai_huggingface' | 'ai_gemini';
  reason?: string;
}

export class SmartTaggingService {
  // Mapeamento de domínios para tags
  private static readonly DOMAIN_TAGS: Record<string, string[]> = {
    // Desenvolvimento
    'github.com': ['desenvolvimento', 'código', 'git', 'open-source'],
    'gitlab.com': ['desenvolvimento', 'código', 'git', 'devops'],
    'stackoverflow.com': ['programação', 'desenvolvimento', 'ajuda', 'comunidade'],
    'codepen.io': ['frontend', 'css', 'javascript', 'demo'],
    'jsfiddle.net': ['javascript', 'frontend', 'teste', 'demo'],
    
    // Documentação
    'developer.mozilla.org': ['documentação', 'web', 'javascript', 'css'],
    'docs.microsoft.com': ['documentação', 'microsoft', 'desenvolvimento'],
    'reactjs.org': ['react', 'javascript', 'frontend', 'documentação'],
    'nodejs.org': ['nodejs', 'javascript', 'backend', 'documentação'],
    
    // Aprendizado
    'youtube.com': ['vídeo', 'educação', 'entretenimento'],
    'udemy.com': ['curso', 'educação', 'aprendizado'],
    'coursera.org': ['curso', 'educação', 'universidade'],
    'edx.org': ['curso', 'educação', 'mooc'],
    'khanacademy.org': ['educação', 'matemática', 'gratuito'],
    
    // Artigos e Blogs
    'medium.com': ['artigo', 'blog', 'leitura'],
    'dev.to': ['desenvolvimento', 'artigo', 'comunidade'],
    'hashnode.com': ['blog', 'desenvolvimento', 'artigo'],
    'substack.com': ['newsletter', 'artigo', 'assinatura'],
    
    // Profissional
    'linkedin.com': ['profissional', 'carreira', 'networking'],
    'glassdoor.com': ['emprego', 'carreira', 'salário'],
    'indeed.com': ['emprego', 'vaga', 'carreira'],
    
    // Design
    'dribbble.com': ['design', 'ui/ux', 'inspiração'],
    'behance.net': ['design', 'portfólio', 'criativo'],
    'figma.com': ['design', 'ui/ux', 'prototipagem'],
    'canva.com': ['design', 'gráfico', 'template'],
    
    // Ferramentas
    'notion.so': ['produtividade', 'organização', 'notas'],
    'trello.com': ['produtividade', 'kanban', 'projeto'],
    'slack.com': ['comunicação', 'equipe', 'trabalho'],
    'discord.com': ['comunicação', 'comunidade', 'chat'],
    
    // E-commerce
    'amazon.com': ['compras', 'e-commerce', 'produto'],
    'mercadolivre.com.br': ['compras', 'e-commerce', 'brasil'],
    'shopify.com': ['e-commerce', 'loja', 'negócio'],
    
    // Notícias
    'reddit.com': ['comunidade', 'discussão', 'notícias'],
    'hackernews.com': ['tecnologia', 'notícias', 'startup'],
    'techcrunch.com': ['tecnologia', 'startup', 'notícias'],
  };

  // Palavras-chave para tags
  private static readonly KEYWORD_TAGS: Record<string, string[]> = {
    // Tecnologias
    'react': ['react', 'javascript', 'frontend'],
    'vue': ['vue', 'javascript', 'frontend'],
    'angular': ['angular', 'typescript', 'frontend'],
    'nodejs': ['nodejs', 'javascript', 'backend'],
    'python': ['python', 'programação', 'backend'],
    'java': ['java', 'programação', 'backend'],
    'typescript': ['typescript', 'javascript', 'desenvolvimento'],
    'docker': ['docker', 'devops', 'container'],
    'kubernetes': ['kubernetes', 'devops', 'orquestração'],
    'aws': ['aws', 'cloud', 'amazon'],
    'azure': ['azure', 'cloud', 'microsoft'],
    'gcp': ['gcp', 'cloud', 'google'],
    
    // Conceitos
    'tutorial': ['tutorial', 'educação', 'aprendizado'],
    'guide': ['guia', 'documentação', 'ajuda'],
    'api': ['api', 'desenvolvimento', 'integração'],
    'database': ['banco-de-dados', 'sql', 'dados'],
    'machine-learning': ['ml', 'ia', 'dados'],
    'artificial-intelligence': ['ia', 'ml', 'tecnologia'],
    'blockchain': ['blockchain', 'crypto', 'web3'],
    'cryptocurrency': ['crypto', 'bitcoin', 'blockchain'],
    
    // Ações
    'download': ['download', 'arquivo', 'software'],
    'install': ['instalação', 'setup', 'configuração'],
    'setup': ['configuração', 'instalação', 'tutorial'],
    'deploy': ['deploy', 'produção', 'devops'],
    'test': ['teste', 'qa', 'desenvolvimento'],
    'debug': ['debug', 'erro', 'desenvolvimento'],
    
    // Formatos
    'pdf': ['pdf', 'documento', 'leitura'],
    'video': ['vídeo', 'multimedia', 'educação'],
    'podcast': ['podcast', 'áudio', 'educação'],
    'ebook': ['ebook', 'livro', 'leitura'],
    'course': ['curso', 'educação', 'aprendizado'],
  };

  // Padrões de URL para tags
  private static readonly URL_PATTERNS: Array<{ pattern: RegExp; tags: string[] }> = [
    { pattern: /\/docs?\//i, tags: ['documentação', 'referência'] },
    { pattern: /\/blog\//i, tags: ['blog', 'artigo'] },
    { pattern: /\/tutorial\//i, tags: ['tutorial', 'educação'] },
    { pattern: /\/guide\//i, tags: ['guia', 'ajuda'] },
    { pattern: /\/api\//i, tags: ['api', 'documentação'] },
    { pattern: /\/download\//i, tags: ['download', 'software'] },
    { pattern: /\/pricing\//i, tags: ['preço', 'comercial'] },
    { pattern: /\/about\//i, tags: ['sobre', 'empresa'] },
    { pattern: /\/contact\//i, tags: ['contato', 'suporte'] },
    { pattern: /\/careers?\//i, tags: ['carreira', 'emprego'] },
    { pattern: /\/news\//i, tags: ['notícias', 'atualização'] },
    { pattern: /\/support\//i, tags: ['suporte', 'ajuda'] },
  ];

  /**
   * Sugere tags para um bookmark baseado no título e URL
   */
  static suggestTags(title: string, url: string): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    const seenTags = new Set<string>();

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const fullText = `${title} ${url}`.toLowerCase();

      // 1. Tags baseadas no domínio
      const domainTags = this.DOMAIN_TAGS[domain] || [];
      domainTags.forEach(tag => {
        if (!seenTags.has(tag)) {
          suggestions.push({
            tag,
            confidence: 0.9,
            source: 'domain'
          });
          seenTags.add(tag);
        }
      });

      // 2. Tags baseadas em palavras-chave
      Object.entries(this.KEYWORD_TAGS).forEach(([keyword, tags]) => {
        if (fullText.includes(keyword.toLowerCase())) {
          tags.forEach(tag => {
            if (!seenTags.has(tag)) {
              suggestions.push({
                tag,
                confidence: 0.8,
                source: 'keyword'
              });
              seenTags.add(tag);
            }
          });
        }
      });

      // 3. Tags baseadas na estrutura da URL
      this.URL_PATTERNS.forEach(({ pattern, tags }) => {
        if (pattern.test(url)) {
          tags.forEach(tag => {
            if (!seenTags.has(tag)) {
              suggestions.push({
                tag,
                confidence: 0.7,
                source: 'url_structure'
              });
              seenTags.add(tag);
            }
          });
        }
      });

      // 4. Análise de conteúdo do título
      const contentTags = this.analyzeContent(title);
      contentTags.forEach(tag => {
        if (!seenTags.has(tag)) {
          suggestions.push({
            tag,
            confidence: 0.6,
            source: 'content_analysis'
          });
          seenTags.add(tag);
        }
      });

    } catch (error) {
      console.warn('Erro ao analisar URL:', error);
    }

    // Ordenar por confiança e retornar top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Analisa o conteúdo do título para extrair tags
   */
  private static analyzeContent(title: string): string[] {
    const tags: string[] = [];
    const titleLower = title.toLowerCase();

    // Detectar linguagens de programação
    const languages = ['javascript', 'python', 'java', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'];
    languages.forEach(lang => {
      if (titleLower.includes(lang)) {
        tags.push(lang, 'programação');
      }
    });

    // Detectar frameworks
    const frameworks = ['react', 'vue', 'angular', 'express', 'django', 'flask', 'spring', 'laravel'];
    frameworks.forEach(framework => {
      if (titleLower.includes(framework)) {
        tags.push(framework, 'framework');
      }
    });

    // Detectar tipos de conteúdo
    if (titleLower.includes('how to') || titleLower.includes('como')) {
      tags.push('tutorial', 'guia');
    }
    if (titleLower.includes('best practices') || titleLower.includes('melhores práticas')) {
      tags.push('boas-práticas', 'guia');
    }
    if (titleLower.includes('introduction') || titleLower.includes('introdução')) {
      tags.push('introdução', 'iniciante');
    }

    return [...new Set(tags)];
  }

  /**
   * Obtém apenas as tags (sem metadados)
   */
  static getSimpleTags(title: string, url: string): string[] {
    return this.suggestTags(title, url).map(suggestion => suggestion.tag);
  }

  /**
   * Adiciona novos domínios e suas tags ao sistema
   */
  static addDomainMapping(domain: string, tags: string[]): void {
    this.DOMAIN_TAGS[domain] = tags;
  }

  /**
   * Adiciona novas palavras-chave e suas tags ao sistema
   */
  static addKeywordMapping(keyword: string, tags: string[]): void {
    this.KEYWORD_TAGS[keyword] = tags;
  }
}

// Exportar para uso em outros módulos
export default SmartTaggingService;