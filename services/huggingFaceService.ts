/**
 * Hugging Face Integration Service
 * Provides AI-powered tag suggestions using Hugging Face Inference API
 * 
 * Security Features:
 * - No API keys exposed in extension code
 * - Proxy backend pattern for secure API access
 * - Fallback to local rules when API unavailable
 */

import SmartTaggingService, { TagSuggestion } from './smartTaggingService';

interface HuggingFaceConfig {
    proxyEndpoint?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

interface HuggingFaceResponse {
    suggestions: string[];
    confidence: number[];
    error?: string;
}

/**
 * Hugging Face AI Service for intelligent tag suggestions
 * Uses proxy backend to keep API keys secure
 */
export class HuggingFaceService {
    private config: HuggingFaceConfig;
    private isAvailable: boolean = false;
    
    constructor(config: HuggingFaceConfig = {}) {
        this.config = {
            proxyEndpoint: config.proxyEndpoint || '/api/huggingface/suggest-tags',
            model: config.model || 'microsoft/DialoGPT-medium',
            maxTokens: config.maxTokens || 50,
            temperature: config.temperature || 0.7
        };
        
        this.checkAvailability();
    }
    
    /**
     * Check if Hugging Face service is available
     */
    private async checkAvailability(): Promise<void> {
        try {
            const response = await fetch(`${this.config.proxyEndpoint}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            this.isAvailable = response.ok;
        } catch (error) {
            console.warn('Hugging Face service not available:', error);
            this.isAvailable = false;
        }
    }
    
    /**
     * Generate tag suggestions using Hugging Face AI
     * Falls back to local rules if API is unavailable
     */
    async suggestTags(title: string, url: string): Promise<TagSuggestion[]> {
        // Always try local rules first for immediate response
        const localSuggestions = SmartTaggingService.suggestTags(title, url);
        
        if (!this.isAvailable) {
            console.info('Using local AI rules (Hugging Face unavailable)');
            return localSuggestions;
        }
        
        try {
            const aiSuggestions = await this.callHuggingFaceAPI(title, url);
            
            // Combine AI suggestions with local rules
            const combinedSuggestions = this.combineSuggestions(
                localSuggestions, 
                aiSuggestions
            );
            
            return combinedSuggestions;
            
        } catch (error) {
            console.error('Hugging Face API error:', error);
            console.info('Falling back to local AI rules');
            return localSuggestions;
        }
    }
    
    /**
     * Call Hugging Face API through secure proxy
     */
    private async callHuggingFaceAPI(title: string, url: string): Promise<TagSuggestion[]> {
        const prompt = this.buildPrompt(title, url);
        
        const response = await fetch(this.config.proxyEndpoint!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                model: this.config.model,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            })
        });
        
        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }
        
        const data: HuggingFaceResponse = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return this.parseAISuggestions(data);
    }
    
    /**
     * Build optimized prompt for tag suggestion
     */
    private buildPrompt(title: string, url: string): string {
        const domain = new URL(url).hostname;
        
        return `Generate relevant tags for this bookmark:
Title: "${title}"
URL: ${url}
Domain: ${domain}

Suggest 3-5 concise, relevant tags (single words or short phrases) that would help categorize and find this bookmark later. Focus on:
- Technology/programming languages if applicable
- Content type (tutorial, documentation, tool, etc.)
- Subject matter or industry
- Functionality or purpose

Tags:`;
    }
    
    /**
     * Parse AI response into TagSuggestion format
     */
    private parseAISuggestions(data: HuggingFaceResponse): TagSuggestion[] {
        const suggestions: TagSuggestion[] = [];
        
        data.suggestions.forEach((tag, index) => {
            const cleanTag = this.cleanTag(tag);
            if (cleanTag && this.isValidTag(cleanTag)) {
                suggestions.push({
                    tag: cleanTag,
                    confidence: data.confidence[index] || 0.8,
                    source: 'ai_huggingface',
                    reason: 'Generated by Hugging Face AI model'
                });
            }
        });
        
        return suggestions;
    }
    
    /**
     * Clean and normalize tag from AI response
     */
    private cleanTag(tag: string): string {
        return tag
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Remove multiple hyphens
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    }
    
    /**
     * Validate if tag meets quality criteria
     */
    private isValidTag(tag: string): boolean {
        return tag.length >= 2 && 
               tag.length <= 30 && 
               !/^\d+$/.test(tag) && // Not just numbers
               !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(tag);
    }
    
    /**
     * Combine AI suggestions with local rules
     * Prioritizes AI suggestions but keeps high-confidence local ones
     */
    private combineSuggestions(
        localSuggestions: TagSuggestion[], 
        aiSuggestions: TagSuggestion[]
    ): TagSuggestion[] {
        const combined = [...aiSuggestions];
        const aiTags = new Set(aiSuggestions.map(s => s.tag));
        
        // Add high-confidence local suggestions that aren't duplicated
        localSuggestions
            .filter(local => local.confidence >= 0.8 && !aiTags.has(local.tag))
            .forEach(local => {
                combined.push({
                    ...local,
                    confidence: local.confidence * 0.9 // Slightly lower than AI
                });
            });
        
        // Sort by confidence and limit to top 8 suggestions
        return combined
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 8);
    }
    
    /**
     * Get service status information
     */
    getStatus(): { available: boolean; endpoint: string; model: string } {
        return {
            available: this.isAvailable,
            endpoint: this.config.proxyEndpoint || 'not configured',
            model: this.config.model || 'default'
        };
    }
}

// Singleton instance
let huggingFaceService: HuggingFaceService | null = null;

/**
 * Get or create Hugging Face service instance
 */
export function getHuggingFaceService(config?: HuggingFaceConfig): HuggingFaceService {
    if (!huggingFaceService) {
        huggingFaceService = new HuggingFaceService(config);
    }
    return huggingFaceService;
}

/**
 * Quick function to get AI-powered tag suggestions
 * Automatically falls back to local rules if needed
 */
export async function suggestTagsWithAI(
    title: string, 
    url: string, 
    config?: HuggingFaceConfig
): Promise<TagSuggestion[]> {
    const service = getHuggingFaceService(config);
    return await service.suggestTags(title, url);
}

export default HuggingFaceService;