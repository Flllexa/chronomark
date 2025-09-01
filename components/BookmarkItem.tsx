
import React from 'react';
import type { Bookmark } from '../types';
import { Tag } from './Tag';
import { DeleteIcon, EditIcon, LinkIcon } from './icons';

interface BookmarkItemProps {
    bookmark: Bookmark;
    onDelete: (id: string) => void;
    onEdit: (bookmark: Bookmark) => void;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete, onEdit }) => {
    return (
        <div className="bookmark-item">
            <div className="bookmark-item-header">
                <div className="bookmark-item-content">
                    <h3>{bookmark.title}</h3>
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
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
                    {bookmark.tags.map(tag => <Tag key={tag} text={tag} />)}
                </div>
            )}
        </div>
    );
};
