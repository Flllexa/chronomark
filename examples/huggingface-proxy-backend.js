/**
 * Hugging Face Proxy Backend Example
 * Secure proxy server that handles Hugging Face API calls
 * Keeps API keys safe on the server side
 * 
 * Usage:
 * 1. Deploy this to your server (Vercel, Netlify, Railway, etc.)
 * 2. Set HUGGINGFACE_API_KEY environment variable
 * 3. Configure extension to use this endpoint
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['chrome-extension://*'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// Hugging Face API configuration
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';

if (!HF_API_KEY) {
    console.error('❌ HUGGINGFACE_API_KEY environment variable is required');
    process.exit(1);
}

/**
 * Health check endpoint
 */
app.get('/api/huggingface/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'huggingface-proxy',
        timestamp: new Date().toISOString()
    });
});

/**
 * Main tag suggestion endpoint
 */
app.post('/api/huggingface/suggest-tags', async (req, res) => {
    try {
        const { prompt, model = 'microsoft/DialoGPT-medium', max_tokens = 50, temperature = 0.7 } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        // Call Hugging Face API
        const suggestions = await callHuggingFaceAPI({
            prompt,
            model,
            max_tokens,
            temperature
        });
        
        res.json({
            suggestions: suggestions.tags,
            confidence: suggestions.confidence,
            model: model,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Hugging Face API Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate suggestions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Alternative endpoint using text classification
 */
app.post('/api/huggingface/classify-tags', async (req, res) => {
    try {
        const { title, url } = req.body;
        
        if (!title || !url) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }
        
        const text = `${title} ${new URL(url).hostname}`;
        
        const response = await fetch(`${HF_API_URL}/facebook/bart-large-mnli`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    candidate_labels: [
                        'programming', 'tutorial', 'documentation', 'tool', 'article',
                        'video', 'course', 'reference', 'blog', 'news', 'social',
                        'shopping', 'entertainment', 'productivity', 'design'
                    ]
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convert classification results to tag suggestions
        const suggestions = data.labels
            .slice(0, 5) // Top 5 classifications
            .map((label, index) => ({
                tag: label,
                confidence: data.scores[index],
                source: 'ai_huggingface'
            }));
        
        res.json({
            suggestions: suggestions.map(s => s.tag),
            confidence: suggestions.map(s => s.confidence),
            model: 'facebook/bart-large-mnli',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Classification Error:', error);
        res.status(500).json({ 
            error: 'Failed to classify content',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Call Hugging Face text generation API
 */
async function callHuggingFaceAPI({ prompt, model, max_tokens, temperature }) {
    const response = await fetch(`${HF_API_URL}/${model}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: max_tokens,
                temperature: temperature,
                return_full_text: false
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Parse generated text to extract tags
    const generatedText = data[0]?.generated_text || '';
    const tags = parseTagsFromText(generatedText);
    
    return {
        tags: tags.slice(0, 5), // Limit to 5 tags
        confidence: tags.map(() => 0.8) // Default confidence
    };
}

/**
 * Parse tags from generated text
 */
function parseTagsFromText(text) {
    // Extract potential tags from the generated text
    const lines = text.split('\n');
    const tags = [];
    
    for (const line of lines) {
        // Look for comma-separated tags
        if (line.includes(',')) {
            const lineTags = line.split(',').map(tag => tag.trim().toLowerCase());
            tags.push(...lineTags);
        }
        // Look for bullet points or dashes
        else if (line.match(/^[-*•]\s*(.+)$/)) {
            const tag = line.replace(/^[-*•]\s*/, '').trim().toLowerCase();
            tags.push(tag);
        }
        // Look for individual words that could be tags
        else {
            const words = line.split(/\s+/).filter(word => 
                word.length > 2 && 
                word.length < 20 && 
                /^[a-zA-Z-]+$/.test(word)
            );
            tags.push(...words.map(w => w.toLowerCase()));
        }
    }
    
    // Clean and deduplicate tags
    const cleanTags = [...new Set(tags)]
        .filter(tag => tag && tag.length > 1 && tag.length < 30)
        .filter(tag => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(tag));
    
    return cleanTags;
}

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /api/huggingface/health',
            'POST /api/huggingface/suggest-tags',
            'POST /api/huggingface/classify-tags'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hugging Face Proxy Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/huggingface/health`);
    console.log(`🤖 Tag suggestions: POST http://localhost:${PORT}/api/huggingface/suggest-tags`);
    console.log(`🏷️  Tag classification: POST http://localhost:${PORT}/api/huggingface/classify-tags`);
});

module.exports = app;