/**
 * Gemini AI Service for Bookmark Tag Suggestions
 * Uses the user's authenticated Google account (OAuth) to access Gemini API
 * No server proxy needed - runs directly in the extension
 */

import SmartTaggingService, { TagSuggestion } from './smartTaggingService';

interface GeminiConfig {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
        finishReason: string;
        safetyRatings: Array<{
            category: string;
            probability: string;
        }>;
    }>;
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

class GeminiService {
    private static instance: GeminiService;
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    private readonly defaultConfig: GeminiConfig = {
        model: 'gemini-1.5-flash',
        maxTokens: 100,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
    };

    private constructor() {}

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    /**
     * Get OAuth token from Chrome identity API
     */
    private async getAuthToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!chrome.identity) {
                reject(new Error('Chrome identity API not available'));
                return;
            }

            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`Auth error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                if (!token) {
                    reject(new Error('No auth token available'));
                    return;
                }
                
                resolve(token);
            });
        });
    }

    /**
     * Make authenticated request to Gemini API
     */
    private async makeGeminiRequest(
        prompt: string,
        config: GeminiConfig = {}
    ): Promise<GeminiResponse> {
        const token = await this.getAuthToken();
        const finalConfig = { ...this.defaultConfig, ...config };
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                maxOutputTokens: finalConfig.maxTokens,
                temperature: finalConfig.temperature,
                topP: finalConfig.topP,
                topK: finalConfig.topK
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };

        const response = await fetch(
            `${this.baseUrl}/models/${finalConfig.model}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Generate bookmark tags using Gemini AI
     */
    public async generateTags(
        title: string,
        url: string,
        config?: GeminiConfig
    ): Promise<TagSuggestion[]> {
        try {
            const prompt = this.createTagPrompt(title, url);
            const response = await this.makeGeminiRequest(prompt, config);
            
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No response from Gemini API');
            }

            const content = response.candidates[0].content;
            if (!content.parts || content.parts.length === 0) {
                throw new Error('Empty response from Gemini API');
            }

            const text = content.parts[0].text;
            return this.parseTagResponse(text);
            
        } catch (error) {
            console.error('Gemini tag generation error:', error);
            throw error;
        }
    }

    /**
     * Create optimized prompt for tag generation
     */
    private createTagPrompt(title: string, url: string): string {
        const domain = this.extractDomain(url);
        
        return `Analyze this bookmark and suggest 3-5 relevant tags:

Title: "${title}"
URL: ${url}
Domain: ${domain}

Rules:
1. Generate concise, lowercase tags (1-2 words each)
2. Focus on: technology, category, purpose, domain type
3. Avoid generic words like "website", "page", "link"
4. Consider the domain and title context
5. Return ONLY a JSON array of objects with this format:

[{"tag": "example-tag", "confidence": 0.85, "reason": "Brief explanation"}]

Response:`;
    }

    /**
     * Parse Gemini response into TagSuggestion format
     */
    private parseTagResponse(text: string): TagSuggestion[] {
        try {
            // Clean the response text
            const cleanText = text.trim()
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .replace(/^Response:\s*/g, '');

            const parsed = JSON.parse(cleanText);
            
            if (!Array.isArray(parsed)) {
                throw new Error('Response is not an array');
            }

            return parsed.map((item: any, index: number): TagSuggestion => {
                if (!item.tag || typeof item.tag !== 'string') {
                    throw new Error(`Invalid tag at index ${index}`);
                }

                return {
                    tag: item.tag.toLowerCase().trim(),
                    confidence: typeof item.confidence === 'number' 
                        ? Math.max(0, Math.min(1, item.confidence))
                        : 0.7,
                    source: 'ai_gemini' as const,
                    reason: typeof item.reason === 'string' 
                        ? item.reason.trim() 
                        : 'AI generated suggestion'
                };
            }).filter(suggestion => 
                suggestion.tag.length > 0 && 
                suggestion.tag.length <= 30
            );
            
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            console.error('Raw response:', text);
            
            // Fallback: try to extract tags from plain text
            return this.extractTagsFromText(text);
        }
    }

    /**
     * Fallback method to extract tags from plain text response
     */
    private extractTagsFromText(text: string): TagSuggestion[] {
        const lines = text.split('\n').filter(line => line.trim());
        const tags: TagSuggestion[] = [];
        
        for (const line of lines) {
            // Look for patterns like "- tag" or "1. tag" or just "tag"
            const match = line.match(/(?:[-*]\s*|\d+\.\s*)?([a-zA-Z][a-zA-Z0-9-_]{1,29})/g);
            if (match) {
                for (const tagMatch of match) {
                    const tag = tagMatch.replace(/^(?:[-*]\s*|\d+\.\s*)/, '').toLowerCase().trim();
                    if (tag && tag.length > 1 && tag.length <= 30) {
                        tags.push({
                            tag,
                            confidence: 0.6,
                            source: 'ai_gemini',
                            reason: 'Extracted from AI response'
                        });
                    }
                }
            }
        }
        
        return tags.slice(0, 5); // Limit to 5 tags
    }

    /**
     * Extract domain from URL
     */
    private extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch {
            return 'unknown';
        }
    }

    /**
     * Check if user is authenticated and Gemini API is available
     */
    public async checkAvailability(): Promise<{
        available: boolean;
        reason?: string;
    }> {
        try {
            // Check if Chrome identity API is available
            if (!chrome.identity) {
                return {
                    available: false,
                    reason: 'Chrome identity API not available'
                };
            }

            // Try to get auth token
            await this.getAuthToken();
            
            return { available: true };
            
        } catch (error) {
            return {
                available: false,
                reason: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get usage statistics (if available)
     */
    public getUsageStats(): {
        requestCount: number;
        lastUsed: number | null;
    } {
        const stats = localStorage.getItem('gemini_usage_stats');
        if (stats) {
            try {
                return JSON.parse(stats);
            } catch {
                // Ignore parsing errors
            }
        }
        
        return {
            requestCount: 0,
            lastUsed: null
        };
    }

    /**
     * Update usage statistics
     */
    private updateUsageStats(): void {
        const stats = this.getUsageStats();
        stats.requestCount += 1;
        stats.lastUsed = Date.now();
        
        try {
            localStorage.setItem('gemini_usage_stats', JSON.stringify(stats));
        } catch {
            // Ignore storage errors
        }
    }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance();

/**
 * Main function to suggest tags using Gemini AI
 * Falls back to local rules if Gemini is unavailable
 */
export async function suggestTagsWithGemini(
    title: string,
    url: string,
    config?: GeminiConfig
): Promise<TagSuggestion[]> {
    try {
        // Check availability first
        const availability = await geminiService.checkAvailability();
        if (!availability.available) {
            console.warn('Gemini not available:', availability.reason);
            // Import and use fallback service
            const SmartTaggingService = await import('./smartTaggingService');
            return SmartTaggingService.default.suggestTags(title, url);
        }

        // Generate tags with Gemini
        const geminiTags = await geminiService.generateTags(title, url, config);
        
        // If we get good results, return them
        if (geminiTags.length > 0) {
            return geminiTags;
        }
        
        // Fallback to local rules if no tags generated
        console.warn('No tags from Gemini, using fallback');
        const SmartTaggingService = await import('./smartTaggingService');
            return SmartTaggingService.default.suggestTags(title, url);
        
    } catch (error) {
        console.error('Error in Gemini tag suggestion:', error);
        
        // Always fallback to local rules on error
        try {
            const SmartTaggingService = await import('./smartTaggingService');
            return SmartTaggingService.default.suggestTags(title, url);
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return [];
        }
    }
}

export default geminiService;
