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
        
        return `You are a bookmark tagging expert. Analyze this bookmark and generate EXACTLY between 5 to 10 relevant tags.

Bookmark Information:
Title: "${title}"
URL: ${url}
Domain: ${domain}

IMPORTANT REQUIREMENTS:
1. You MUST generate AT LEAST 5 tags and AT MOST 10 tags
2. Each tag should be concise, lowercase, 5-10 words maximum
3. Focus on: technology stack, category, purpose, domain type, content type
4. Include both specific and general tags for better organization
5. Avoid generic words like "website", "page", "link", "site"
6. Consider the domain context and title meaning
7. If unsure, generate more tags rather than fewer (aim for 7-8 tags)

Example categories to consider:
- Technology: react, javascript, python, api, database
- Purpose: tutorial, documentation, tool, reference, news
- Category: development, design, productivity, education, entertainment
- Domain type: github, stackoverflow, medium, youtube, official

Return ONLY a valid JSON array with this exact format:
[{"tag": "example-tag", "confidence": 0.85, "reason": "Brief explanation"}]

Generate your response now:`;
    }

    /**
     * Parse Gemini response into TagSuggestion format
     */
    private parseTagResponse(text: string): TagSuggestion[] {
        try {
            // Clean the response text
            let cleanText = text.trim()
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .replace(/^Response:\s*/g, '');

            // Fix common JSON issues
            cleanText = this.fixMalformedJson(cleanText);

            const parsed = JSON.parse(cleanText);
            
            if (!Array.isArray(parsed)) {
                throw new Error('Response is not an array');
            }

            const suggestions = parsed.map((item: any, index: number): TagSuggestion => {
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
            ).filter((suggestion, index, array) => 
                array.findIndex(s => s.tag === suggestion.tag) === index // Remove duplicates
            );

            // Strict validation for tag count - must have at least 5 tags
            if (suggestions.length < 5) {
                console.error(`CRITICAL: Gemini generated only ${suggestions.length} tags, expected 5-10:`, suggestions.map(s => s.tag));
                console.error('Raw Gemini response:', text);
                // Return empty array to trigger fallback
                return [];
            }
            
            if (suggestions.length > 10) {
                console.warn(`Gemini generated ${suggestions.length} tags, limiting to 10`);
                return suggestions.slice(0, 10);
            }
            
            console.log(`Successfully generated ${suggestions.length} tags:`, suggestions.map(s => s.tag));
            return suggestions;
            
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            console.error('Raw response:', text);
            
            // Fallback: try to extract tags from plain text
            return this.extractTagsFromText(text);
        }
    }

    /**
     * Fix common JSON malformation issues
     */
    private fixMalformedJson(text: string): string {
        try {
            // Remove any trailing incomplete objects/arrays
            let fixed = text.trim();
            
            // If it starts with [ but doesn't end with ], try to fix it
            if (fixed.startsWith('[') && !fixed.endsWith(']')) {
                // Find the last complete object
                let lastCompleteIndex = -1;
                let braceCount = 0;
                let inString = false;
                let escapeNext = false;
                
                for (let i = 0; i < fixed.length; i++) {
                    const char = fixed[i];
                    
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }
                    
                    if (char === '"' && !escapeNext) {
                        inString = !inString;
                        continue;
                    }
                    
                    if (!inString) {
                        if (char === '{') {
                            braceCount++;
                        } else if (char === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                lastCompleteIndex = i;
                            }
                        }
                    }
                }
                
                if (lastCompleteIndex > -1) {
                    fixed = fixed.substring(0, lastCompleteIndex + 1) + ']';
                }
            }
            
            // Fix unterminated strings by adding closing quotes
            if (fixed.includes('"') && !this.isValidJson(fixed)) {
                const lines = fixed.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const quoteCount = (line.match(/"/g) || []).length;
                    if (quoteCount % 2 !== 0 && line.includes(':')) {
                        // Add closing quote at the end of the line
                        lines[i] = line + '"';
                    }
                }
                fixed = lines.join('\n');
            }
            
            return fixed;
        } catch (error) {
            console.warn('Error fixing malformed JSON:', error);
            return text;
        }
    }

    /**
     * Check if a string is valid JSON
     */
    private isValidJson(text: string): boolean {
        try {
            JSON.parse(text);
            return true;
        } catch {
            return false;
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
        
        // Enhanced fallback: if we don't have enough tags, generate more
        if (tags.length < 5) {
            const commonTechWords = ['javascript', 'react', 'python', 'api', 'tutorial', 'documentation', 'tool', 'reference', 'development', 'web'];
            const commonCategories = ['productivity', 'education', 'news', 'entertainment', 'business', 'technology', 'design', 'programming'];
            
            // Extract words from the text
            const extractedWords = text.toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2 && word.length < 20)
                .filter(word => !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'will', 'have', 'has'].includes(word));
            
            // Combine extracted words with some common fallback tags
            const allPossibleTags = [...new Set([...extractedWords, ...commonTechWords, ...commonCategories])];
            
            // Add more tags to reach at least 5
            const neededTags = 5 - tags.length;
            const additionalTags = allPossibleTags.slice(0, neededTags).map(word => ({
                tag: word,
                confidence: extractedWords.includes(word) ? 0.5 : 0.3,
                source: 'ai_gemini' as const,
                reason: extractedWords.includes(word) ? 'Extracted from bookmark' : 'Common fallback tag'
            }));
            
            tags.push(...additionalTags);
        }
        
        return tags.slice(0, 10); // Limit to 10 tags
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
