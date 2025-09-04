/**
 * Example of SmartTaggingService integration in BookmarkForm
 * This file shows how to add AI suggestions to the existing form
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Bookmark, CurrentTab } from '../types';
import { Tag } from '../components/Tag';
import SmartTaggingService, { TagSuggestion } from '../services/smartTaggingService';

interface BookmarkFormWithAIProps {
    onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    onUpdate?: (bookmark: Bookmark) => void;
    initialData?: Partial<Bookmark & CurrentTab> | null;
    allTags?: string[];
}

export const BookmarkFormWithAI: React.FC<BookmarkFormWithAIProps> = ({ 
    onSave, 
    onCancel, 
    onUpdate, 
    initialData, 
    allTags = [] 
}) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // AI states
    const [aiSuggestions, setAiSuggestions] = useState<TagSuggestion[]>([]);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    
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

    // Auto-generate suggestions when title and URL are filled
    useEffect(() => {
        if (title && url && !isEditing) {
            generateAISuggestions();
        }
    }, [title, url, isEditing]);

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
     * Generate tag suggestions using AI
     */
    const generateAISuggestions = async () => {
        if (!title || !url) return;
        
        setIsGeneratingTags(true);
        
        try {
            // Use the smart rules system
            const suggestions = SmartTaggingService.suggestTags(title, url);
            
            // Filter tags that are already added
            const newSuggestions = suggestions.filter(suggestion => 
                !tags.includes(suggestion.tag)
            );
            
            setAiSuggestions(newSuggestions);
            setShowAiSuggestions(newSuggestions.length > 0);
            
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
        } finally {
            setIsGeneratingTags(false);
        }
    };

    /**
     * Add a tag suggested by AI
     */
    const addAISuggestion = (suggestion: TagSuggestion) => {
        if (!tags.includes(suggestion.tag)) {
            setTags(prev => [...prev, suggestion.tag]);
            
            // Remove the suggestion from the list
            setAiSuggestions(prev => 
                prev.filter(s => s.tag !== suggestion.tag)
            );
            
            // Hide suggestions if there are no more
            if (aiSuggestions.length <= 1) {
                setShowAiSuggestions(false);
            }
        }
    };

    /**
     * Add all AI suggestions
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
     * Get badge color based on confidence
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
            case 'domain': return '🌐';
            case 'keyword': return '🔍';
            case 'url_structure': return '📁';
            case 'content_analysis': return '📝';
            default: return '🤖';
        }
    };

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
                    <label htmlFor="tags">Tags</label>
                    
                    {/* Already added tags */}
                    <div className="tags-container">
                        {tags.map(tag => (
                            <Tag
                                key={tag}
                                text={tag}
                                onRemove={() => removeTag(tag)}
                            />
                        ))}
                    </div>

                    {/* Input to add tags */}
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

                    {/* Button to generate AI suggestions */}
                    <div className="ai-controls">
                        <button
                            type="button"
                            onClick={generateAISuggestions}
                            disabled={!title || !url || isGeneratingTags}
                            className="ai-suggest-button"
                        >
                            {isGeneratingTags ? (
                                <>⏳ Generating...</>
                            ) : (
                                <>🤖 Suggest Tags with AI</>
                            )}
                        </button>
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
                                    Add All
                                </button>
                            </div>
                            <div className="ai-suggestions-list">
                                {aiSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="ai-suggestion-item"
                                        onClick={() => addAISuggestion(suggestion)}
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

                    {/* Suggestions based on existing tags */}
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
                .ai-controls {
                    margin: 10px 0;
                }
                
                .ai-suggest-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .ai-suggest-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                
                .ai-suggest-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
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

export default BookmarkFormWithAI;