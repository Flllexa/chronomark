

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Bookmark, CurrentTab } from '../types';
import { Tag } from './Tag';
import geminiService from '../services/geminiService';
import type { TagSuggestion } from '../services/smartTaggingService';

interface BookmarkFormProps {
    // FIX: Updated `onSave` type to align with `addBookmark` which handles timestamp generation.
    onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    onUpdate?: (bookmark: Bookmark) => void;
    initialData?: Partial<Bookmark & CurrentTab> | null;
    allTags?: string[];
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({ onSave, onCancel, onUpdate, initialData, allTags = [] }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Gemini AI states
    const [geminiStatus, setGeminiStatus] = useState<{available: boolean; reason?: string}>({available: false});
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<TagSuggestion[]>([]);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
    
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formContainerRef.current && !formContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Check Gemini AI availability on component mount
    useEffect(() => {
        const checkGeminiStatus = async () => {
            try {
                const status = await geminiService.checkAvailability();
                setGeminiStatus(status);
            } catch (error) {
                console.error('Error checking Gemini status:', error);
                setGeminiStatus({available: false, reason: 'Error checking availability'});
            }
        };
        checkGeminiStatus();
    }, []);

    // Auto-generate AI suggestions when title and URL are available
    useEffect(() => {
        const autoGenerateAiSuggestions = async () => {
            if (geminiStatus.available && title && url && !isGeneratingTags && !hasGeneratedSuggestions) {
                setIsGeneratingTags(true);
                setAiSuggestions([]);
                
                try {
                    const suggestions = await geminiService.generateTags(title, url);
                    if (suggestions && suggestions.length > 0) {
                        setAiSuggestions(suggestions);
                        setShowAiSuggestions(true);
                        setHasGeneratedSuggestions(true);
                    }
                } catch (error) {
                    console.error('Error auto-generating AI suggestions:', error);
                } finally {
                    setIsGeneratingTags(false);
                }
            }
        };

        // Debounce the auto-generation to avoid too many API calls
        const timeoutId = setTimeout(autoGenerateAiSuggestions, 1000);
        return () => clearTimeout(timeoutId);
    }, [title, url, geminiStatus.available, isGeneratingTags, isEditing, hasGeneratedSuggestions]);

    // Reset suggestions when form is reset or editing changes
    useEffect(() => {
        if (isEditing || !title || !url) {
            setHasGeneratedSuggestions(false);
            setAiSuggestions([]);
            setShowAiSuggestions(false);
        }
    }, [isEditing, title, url]);
    
    const filteredSuggestions = useMemo(() => {
        if (!showSuggestions) return [];
        const lowercasedInput = tagInput.toLowerCase();
        return allTags.filter(tag => 
            !tags.includes(tag) && 
            tag.toLowerCase().includes(lowercasedInput)
        );
    }, [showSuggestions, tagInput, allTags, tags]);

    const handleAddTag = (tag: string) => {
        const newTag = tag.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
        setShowSuggestions(false);
    }

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    };
    
    const handleSuggestionClick = (tag: string) => {
        handleAddTag(tag);
        tagInputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Gemini AI functions
    const generateAiSuggestions = async () => {
        if (!geminiStatus.available || !title || !url) {
            return;
        }

        setIsGeneratingTags(true);
        setAiSuggestions([]);
        
        try {
            const suggestions = await geminiService.generateTags(title, url);
            if (suggestions && suggestions.length > 0) {
                // Filter out tags that are already added
                const newSuggestions = suggestions.filter(suggestion => !tags.includes(suggestion.tag));
                setAiSuggestions(newSuggestions);
                setShowAiSuggestions(true);
            }
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
        } finally {
            setIsGeneratingTags(false);
        }
    };

    const addAiSuggestion = (suggestion: TagSuggestion) => {
        if (!tags.includes(suggestion.tag)) {
            setTags([...tags, suggestion.tag]);
            // Remove the selected suggestion from the list
            setAiSuggestions(aiSuggestions.filter(s => s.tag !== suggestion.tag));
        }
    };

    // Filter AI suggestions to exclude already added tags
    const filteredAiSuggestions = useMemo(() => {
        return aiSuggestions.filter(suggestion => !tags.includes(suggestion.tag));
    }, [aiSuggestions, tags]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && onUpdate && initialData?.id && initialData.createdAt !== undefined) {
            // FIX: Added `updatedAt` to satisfy the `Bookmark` type requirement for the `onUpdate` handler.
            onUpdate({
                id: initialData.id,
                createdAt: initialData.createdAt,
                title,
                url,
                tags,
                updatedAt: Date.now(),
            });
        } else {
            onSave({ title, url, tags });
        }
    };

    return (
        <div ref={formContainerRef}>
            <form onSubmit={handleSubmit} className="bookmark-form animate-fade-in">
                <h2>{isEditing ? 'Edit Bookmark' : 'Save Bookmark'}</h2>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="url">URL</label>
                    <input
                        id="url"
                        type="text"
                        value={url}
                        readOnly
                        className="form-input form-input-readonly"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="tags">Tags (press Enter to add)</label>
                    <div className="tag-input-container">
                        <div 
                            className="tag-input-wrapper"
                            onClick={() => tagInputRef.current?.focus()}
                        >
                        {tags.map(tag => (
                            <Tag key={tag} text={tag} onRemove={() => removeTag(tag)} />
                        ))}
                            <input
                                ref={tagInputRef}
                                id="tags"
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder={tags.length === 0 ? 'Add tags...' : ''}
                                autoComplete="off"
                            />
                        </div>
                         {filteredSuggestions.length > 0 && (
                            <div className="tag-suggestions">
                                <ul>
                                    {filteredSuggestions.map(suggestion => (
                                        <li 
                                            key={suggestion}
                                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* AI Tag Suggestions Section */}
                {geminiStatus.available && (
                    <div className="ai-suggestions-section">
                        {isGeneratingTags && (
                            <div className="ai-generating-status">
                                <span className="ai-generating-text">🔄 Gerando sugestões de tags...</span>
                            </div>
                        )}
                        
                        {showAiSuggestions && filteredAiSuggestions.length > 0 && (
                            <div className="ai-suggestions">
                                <h4 className="ai-suggestions-title">🏷️ Sugestões de Tags</h4>
                                <div className="ai-suggestions-list">
                                    {filteredAiSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => addAiSuggestion(suggestion)}
                                            className="ai-suggestion-btn"
                                            title={`Confiança: ${Math.round(suggestion.confidence * 100)}%`}
                                        >
                                            {suggestion.tag}
                                        </button>
                                    ))}
                                </div>
                                <p className="ai-suggestions-info">
                                    💡 Estas sugestões foram geradas automaticamente por inteligência artificial com base no título e URL do seu favorito. Clique nas tags para adicioná-las.
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {isEditing ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};