
import React, { useState } from 'react';
import type { Bookmark } from '../types';
import { Tag } from './Tag';
import { DeleteIcon, EditIcon, LinkIcon } from './icons';

// Function to sanitize URLs and prevent javascript: URLs
const sanitizeUrl = (url: string): { safeUrl: string; isSafe: boolean } => {
    try {
        const urlObj = new URL(url);
        // Check if the URL scheme is dangerous
        if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:' || urlObj.protocol === 'vbscript:') {
            return { safeUrl: '#', isSafe: false };
        }
        return { safeUrl: url, isSafe: true };
    } catch {
        // If URL parsing fails, check if it starts with dangerous protocols
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
            return { safeUrl: '#', isSafe: false };
        }
        // For relative URLs or other formats, return as is
        return { safeUrl: url, isSafe: true };
    }
};

interface BookmarkItemProps {
    bookmark: Bookmark;
    onDelete: (id: string) => void;
    onEdit: (bookmark: Bookmark) => void;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete, onEdit }) => {
    const [showAllTags, setShowAllTags] = useState(false);

    // Verificação de segurança para bookmark undefined
    if (!bookmark || !bookmark.url || !bookmark.title) {
        return (
            <div className="bookmark-item">
                <div className="bookmark-item-content">
                    <p style={{ color: '#ef4444', fontStyle: 'italic' }}>
                        Invalid bookmark data
                    </p>
                </div>
            </div>
        );
    }

    const { safeUrl, isSafe } = sanitizeUrl(bookmark.url);
    const hasMoreTags = bookmark.tags.length > 3;
    const displayedTags = hasMoreTags ? bookmark.tags.slice(0, 3) : bookmark.tags;
    
    return (
        <div className="bookmark-item">
            <div className="bookmark-item-header">
                <div className="bookmark-item-content">
                    <h3>{bookmark.title}</h3>
                    <a 
                        href={safeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={!isSafe ? (e) => e.preventDefault() : undefined}
                        title={!isSafe ? "This URL has been blocked for security reasons" : undefined}
                        className={!isSafe ? "unsafe-url" : ""}
                    >
                        <LinkIcon className="icon"/>
                        <span>{bookmark.url}</span>
                    </a>
                </div>
                <div className="bookmark-item-actions">
                    <button onClick={() => onEdit(bookmark)} title="Edit bookmark">
                        <EditIcon className="icon" />
                    </button>
                    <button onClick={() => onDelete(bookmark.id)} className="delete-btn" title="Delete">
                        <DeleteIcon className="icon" />
                    </button>
                </div>
            </div>
            {bookmark.tags.length > 0 && (
                <div className="bookmark-item-tags">
                    {displayedTags.map(tag => <Tag key={tag} text={tag} />)}
                    {hasMoreTags && (
                        <button 
                            className="show-more-tags-btn"
                            onClick={() => setShowAllTags(true)}
                            title={`Show all ${bookmark.tags.length} tags`}
                        >
                            +{bookmark.tags.length - 3}
                        </button>
                    )}
                </div>
            )}
            
            {/* Modal para mostrar todas as tags */}
            {showAllTags && (
                <div className="tags-modal-overlay" onClick={() => setShowAllTags(false)}>
                    <div className="tags-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tags-modal-header">
                            <h3>All Tags for "{bookmark.title}"</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowAllTags(false)}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="tags-modal-content">
                            {bookmark.tags.map(tag => <Tag key={tag} text={tag} />)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
