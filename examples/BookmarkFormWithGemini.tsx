import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import type { TagSuggestion } from '../services/smartTaggingService';

interface BookmarkFormWithGeminiProps {
  onSave: (bookmark: { title: string; url: string; tags: string[] }) => void;
  initialData?: {
    title?: string;
    url?: string;
    tags?: string[];
  };
}

interface GeminiStatus {
  available: boolean;
  reason?: string;
}

const BookmarkFormWithGemini: React.FC<BookmarkFormWithGeminiProps> = ({
  onSave,
  initialData = {}
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [url, setUrl] = useState(initialData.url || '');
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [newTag, setNewTag] = useState('');
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus>({
    available: false
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check Gemini availability on component mount
  useEffect(() => {
    checkGeminiStatus();
  }, []);

  const checkGeminiStatus = async () => {
    try {
      const availability = await geminiService.checkAvailability();
      setGeminiStatus({
        available: availability.available,
        reason: availability.reason
      });
    } catch (error) {
      console.error('Error checking Gemini status:', error);
      setGeminiStatus({
        available: false,
        reason: 'Error checking status'
      });
    }
  };

  const generateSuggestions = async () => {
    if (!title.trim() && !url.trim()) {
      alert('Please enter a title or URL first');
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    
    try {
      const tagSuggestions = await geminiService.generateTags(
        title || 'Untitled',
        url || ''
      );
      
      setSuggestions(tagSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSuggestedTag = (suggestion: TagSuggestion) => {
    addTag(suggestion.tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('Please fill in both title and URL');
      return;
    }
    
    onSave({
      title: title.trim(),
      url: url.trim(),
      tags
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai_gemini': return '🤖';
      case 'domain': return '🌐';
      case 'keyword': return '🔤';
      case 'url_structure': return '🔗';
      case 'content_analysis': return '📝';
      default: return '💡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#22c55e'; // green
    if (confidence >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="bookmark-form-container">
      <form onSubmit={handleSubmit} className="bookmark-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter bookmark title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">URL:</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="form-group">
          <div className="tags-header">
            <label>Tags:</label>
            <div className="ai-controls">
              <div className="gemini-status">
                {geminiStatus.available ? (
                  <span className="status-indicator available">
                    🤖 Gemini Ready
                  </span>
                ) : (
                  <span className="status-indicator unavailable">
                    ❌ Gemini Unavailable
                    {geminiStatus.reason && (
                      <span className="status-reason">({geminiStatus.reason})</span>
                    )}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={generateSuggestions}
                disabled={isLoadingSuggestions || (!title.trim() && !url.trim())}
                className="suggest-button"
              >
                {isLoadingSuggestions ? '🔄 Generating...' : '✨ Suggest Tags'}
              </button>
            </div>
          </div>

          <div className="tag-input-container">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(newTag);
                }
              }}
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim()}
              className="add-tag-button"
            >
              Add
            </button>
          </div>

          <div className="current-tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {showSuggestions && (
            <div className="suggestions-container">
              <div className="suggestions-header">
                <h4>AI Suggestions</h4>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="close-suggestions"
                >
                  ×
                </button>
              </div>
              
              {isLoadingSuggestions ? (
                <div className="loading-suggestions">
                  <div className="spinner"></div>
                  <span>Generating intelligent tag suggestions...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <button
                        type="button"
                        onClick={() => addSuggestedTag(suggestion)}
                        disabled={tags.includes(suggestion.tag)}
                        className={`suggestion-button ${
                          tags.includes(suggestion.tag) ? 'already-added' : ''
                        }`}
                      >
                        <span className="suggestion-content">
                          <span className="suggestion-tag">{suggestion.tag}</span>
                          <span className="suggestion-meta">
                            <span className="source-icon">
                              {getSourceIcon(suggestion.source)}
                            </span>
                            <span 
                              className="confidence-score"
                              style={{ color: getConfidenceColor(suggestion.confidence) }}
                            >
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </span>
                        </span>
                        {suggestion.reason && (
                          <span className="suggestion-reason">
                            {suggestion.reason}
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-suggestions">
                  <p>No suggestions available. Try entering more descriptive title or URL.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            Save Bookmark
          </button>
        </div>
      </form>

      <style>{`
        .bookmark-form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .bookmark-form {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .tags-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ai-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gemini-status {
          font-size: 14px;
        }

        .status-indicator {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-indicator.available {
          background: #dcfce7;
          color: #166534;
        }

        .status-indicator.unavailable {
          background: #fef2f2;
          color: #dc2626;
        }

        .status-reason {
          font-size: 11px;
          opacity: 0.8;
          margin-left: 4px;
        }

        .suggest-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .suggest-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .suggest-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .tag-input-container {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .tag-input-container input {
          flex: 1;
        }

        .add-tag-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .add-tag-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .current-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tag {
          background: #f3f4f6;
          color: #374151;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .remove-tag {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .remove-tag:hover {
          color: #ef4444;
        }

        .suggestions-container {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: #f9fafb;
        }

        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .suggestions-header h4 {
          margin: 0;
          color: #374151;
          font-size: 16px;
        }

        .close-suggestions {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
        }

        .loading-suggestions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          justify-content: center;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .suggestion-item {
          width: 100%;
        }

        .suggestion-button {
          width: 100%;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .suggestion-button:hover:not(:disabled) {
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }

        .suggestion-button.already-added {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f3f4f6;
        }

        .suggestion-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .suggestion-tag {
          font-weight: 500;
          color: #374151;
        }

        .suggestion-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .source-icon {
          font-size: 14px;
        }

        .confidence-score {
          font-size: 12px;
          font-weight: 600;
        }

        .suggestion-reason {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .no-suggestions {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .form-actions {
          margin-top: 24px;
        }

        .save-button {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .save-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default BookmarkFormWithGemini;