/**
 * BookmarkForm with Hugging Face AI Integration
 * Enhanced version that uses Hugging Face API for intelligent tag suggestions
 * Falls back to local rules when API is unavailable
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Bookmark, CurrentTab } from '../types';
import { Tag } from '../components/Tag';
import { suggestTagsWithAI } from '../services/huggingFaceService';
import type { TagSuggestion } from '../services/smartTaggingService';

interface BookmarkFormWithHuggingFaceProps {
    onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    onUpdate?: (bookmark: Bookmark) => void;
    initialData?: Partial<Bookmark & CurrentTab> | null;
    allTags?: string[];
    huggingFaceConfig?: {
        proxyEndpoint?: string;
        model?: string;
        maxTokens?: number;
        temperature?: number;
    };
}

export const BookmarkFormWithHuggingFace: React.FC<BookmarkFormWithHuggingFaceProps> = ({ 
    onSave, 
    onCancel, 
    onUpdate, 
    initialData, 
    allTags = [],
    huggingFaceConfig
}) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // AI-specific states
    const [aiSuggestions, setAiSuggestions] = useState<TagSuggestion[]>([]);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const [aiStatus, setAiStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
    const [lastError, setLastError] = useState<string | null>(null);
    
    const tagInputRef = useRef<HTMLInputElement>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);

    const isEditing = useMemo(() => !!(initialData && 'id' in initialData && initialData.id), [initialData]);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setUrl(initialData.url || '');
            setTags(initialData.tags || []);
        }
    }, [initialData]);

    // Auto-generate suggestions when title and URL are filled (only for new bookmarks)
    useEffect(() => {
        if (title && url && !isEditing && aiStatus !== 'unavailable') {
            const timeoutId = setTimeout(() => {
                generateAISuggestions();
            }, 1000); // Debounce for 1 second
            
            return () => clearTimeout(timeoutId);
        }
    }, [title, url, isEditing, aiStatus]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formContainerRef.current && !formContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setShowAiSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const filteredSuggestions = useMemo(() => {
        if (!showSuggestions) return [];
        const lowercasedInput = tagInput.toLowerCase();
        return allTags.filter(tag => 
            tag.toLowerCase().includes(lowercasedInput) && 
            !tags.includes(tag)
        ).slice(0, 10);
    }, [showSuggestions, tagInput, allTags, tags]);

    /**
     * Generate AI-powered tag suggestions using Hugging Face
     */
    const generateAISuggestions = async () => {
        if (!title || !url) return;
        
        setIsGeneratingTags(true);
        setLastError(null);
        
        try {
            const suggestions = await suggestTagsWithAI(title, url, huggingFaceConfig);
            
            // Filter out tags that are already added
            const newSuggestions = suggestions.filter(suggestion => 
                !tags.includes(suggestion.tag)
            );
            
            setAiSuggestions(newSuggestions);
            setShowAiSuggestions(newSuggestions.length > 0);
            
            // Update AI status based on suggestions source
            const hasAISuggestions = newSuggestions.some(s => s.source === 'ai_huggingface');
            setAiStatus(hasAISuggestions ? 'available' : 'unavailable');
            
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            setLastError(error instanceof Error ? error.message : 'Unknown error');
            setAiStatus('unavailable');
            
            // Clear any existing AI suggestions on error
            setAiSuggestions([]);
            setShowAiSuggestions(false);
        } finally {
            setIsGeneratingTags(false);
        }
    };

    /**
     * Add a suggested tag from AI
     */
    const addAISuggestion = (suggestion: TagSuggestion) => {
        if (!tags.includes(suggestion.tag)) {
            setTags(prev => [...prev, suggestion.tag]);
            
            // Remove the suggestion from the list
            setAiSuggestions(prev => 
                prev.filter(s => s.tag !== suggestion.tag)
            );
            
            // Hide suggestions if no more available
            if (aiSuggestions.length <= 1) {
                setShowAiSuggestions(false);
            }
        }
    };

    /**
     * Add all AI suggestions at once
     */
    const addAllAISuggestions = () => {
        const newTags = aiSuggestions
            .map(s => s.tag)
            .filter(tag => !tags.includes(tag));
        
        setTags(prev => [...prev, ...newTags]);
        setAiSuggestions([]);
        setShowAiSuggestions(false);
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags(prev => [...prev, trimmedTag]);
        }
        setTagInput('');
        setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagInput(value);
        setShowSuggestions(value.length > 0);
        setShowAiSuggestions(false); // Hide AI suggestions when typing
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (tagInput.trim()) {
                addTag(tagInput);
            }
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;

        const bookmarkData = {
            title: title.trim(),
            url: url.trim(),
            tags
        };

        if (isEditing && initialData && 'id' in initialData) {
            onUpdate?.({
                ...initialData as Bookmark,
                ...bookmarkData,
                updatedAt: Date.now()
            });
        } else {
            onSave(bookmarkData);
        }
    };

    /**
     * Get confidence color based on value
     */
    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 0.8) return '#10b981'; // Green
        if (confidence >= 0.6) return '#f59e0b'; // Yellow
        return '#6b7280'; // Gray
    };

    /**
     * Get icon based on suggestion source
     */
    const getSourceIcon = (source: TagSuggestion['source']): string => {
        switch (source) {
            case 'ai_huggingface': return '🤖';
            case 'domain': return '🌐';
            case 'keyword': return '🔍';
            case 'url_structure': return '📁';
            case 'content_analysis': return '📝';
            default: return '🏷️';
        }
    };

    /**
     * Get source label for display
     */
    const getSourceLabel = (source: TagSuggestion['source']): string => {
        switch (source) {
            case 'ai_huggingface': return 'Hugging Face AI';
            case 'domain': return 'Domain Analysis';
            case 'keyword': return 'Keyword Match';
            case 'url_structure': return 'URL Pattern';
            case 'content_analysis': return 'Content Analysis';
            default: return 'Unknown';
        }
    };

    /**
     * Get AI status indicator
     */
    const getAIStatusIndicator = () => {
        switch (aiStatus) {
            case 'available':
                return { icon: '🟢', text: 'AI Available', color: '#10b981' };
            case 'unavailable':
                return { icon: '🟡', text: 'Local Rules Only', color: '#f59e0b' };
            default:
                return { icon: '⚪', text: 'Checking...', color: '#6b7280' };
        }
    };

    const statusIndicator = getAIStatusIndicator();

    return (
        <div className="bookmark-form-container" ref={formContainerRef}>
            <form onSubmit={handleSubmit} className="bookmark-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bookmark title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="url">URL</label>
                    <input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="tags-header">
                        <label htmlFor="tags">Tags</label>
                        <div className="ai-status" style={{ color: statusIndicator.color }}>
                            {statusIndicator.icon} {statusIndicator.text}
                        </div>
                    </div>
                    
                    {/* Added tags */}
                    <div className="tags-container">
                        {tags.map(tag => (
                            <Tag
                                key={tag}
                                text={tag}
                                onRemove={() => removeTag(tag)}
                            />
                        ))}
                    </div>

                    {/* Tag input */}
                    <input
                        ref={tagInputRef}
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagInputKeyDown}
                        onFocus={() => {
                            if (tagInput) setShowSuggestions(true);
                            if (aiSuggestions.length > 0) setShowAiSuggestions(true);
                        }}
                        placeholder="Type a tag and press Enter"
                    />

                    {/* AI controls */}
                    <div className="ai-controls">
                        <button
                            type="button"
                            onClick={generateAISuggestions}
                            disabled={!title || !url || isGeneratingTags}
                            className="ai-suggest-button"
                        >
                            {isGeneratingTags ? (
                                <>⏳ Generating with AI...</>
                            ) : (
                                <>🤖 Get AI Suggestions</>
                            )}
                        </button>
                        
                        {lastError && (
                            <div className="error-message">
                                ⚠️ {lastError}
                            </div>
                        )}
                    </div>

                    {/* AI suggestions */}
                    {showAiSuggestions && aiSuggestions.length > 0 && (
                        <div className="ai-suggestions">
                            <div className="ai-suggestions-header">
                                <span>🤖 AI Suggestions:</span>
                                <button
                                    type="button"
                                    onClick={addAllAISuggestions}
                                    className="add-all-button"
                                >
                                    Add All ({aiSuggestions.length})
                                </button>
                            </div>
                            <div className="ai-suggestions-list">
                                {aiSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="ai-suggestion-item"
                                        onClick={() => addAISuggestion(suggestion)}
                                        title={`${getSourceLabel(suggestion.source)}${suggestion.reason ? ': ' + suggestion.reason : ''}`}
                                    >
                                        <span className="suggestion-icon">
                                            {getSourceIcon(suggestion.source)}
                                        </span>
                                        <span className="suggestion-tag">
                                            {suggestion.tag}
                                        </span>
                                        <span 
                                            className="suggestion-confidence"
                                            style={{ 
                                                backgroundColor: getConfidenceColor(suggestion.confidence),
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                fontSize: '0.75em'
                                            }}
                                        >
                                            {Math.round(suggestion.confidence * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular tag suggestions */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="tag-suggestions">
                            <div className="suggestions-header">📋 Existing tags:</div>
                            <div className="suggestions-list">
                                {filteredSuggestions.map(tag => (
                                    <div
                                        key={tag}
                                        className="suggestion-item"
                                        onClick={() => addTag(tag)}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="save-button">
                        {isEditing ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>

            <style>{`
                .tags-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .ai-status {
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .ai-controls {
                    margin: 10px 0;
                }
                
                .ai-suggest-button {
                    background: linear-gradient(135deg, #ff7b00 0%, #ff8f00 100%);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                    margin-right: 10px;
                }
                
                .ai-suggest-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(255, 123, 0, 0.4);
                }
                
                .ai-suggest-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .error-message {
                    color: #dc2626;
                    font-size: 12px;
                    margin-top: 4px;
                    padding: 4px 8px;
                    background: #fef2f2;
                    border-radius: 4px;
                    border: 1px solid #fecaca;
                }
                
                .ai-suggestions {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                }
                
                .ai-suggestions-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #374151;
                }
                
                .add-all-button {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .ai-suggestions-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .ai-suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    padding: 6px 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .ai-suggestion-item:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                }
                
                .suggestion-icon {
                    font-size: 14px;
                }
                
                .suggestion-tag {
                    font-size: 14px;
                    color: #374151;
                }
                
                .tag-suggestions {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 8px;
                    margin-top: 4px;
                }
                
                .suggestions-header {
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 6px;
                }
                
                .suggestions-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                
                .suggestion-item {
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background-color 0.2s;
                }
                
                .suggestion-item:hover {
                    background: #f3f4f6;
                }
            `}</style>
        </div>
    );
};

export default BookmarkFormWithHuggingFace;