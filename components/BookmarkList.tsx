
import React from 'react';
import type { Bookmark } from '../types';
import { BookmarkItem } from './BookmarkItem';

interface BookmarkListProps {
    bookmarks: Bookmark[];
    onDelete: (id: string) => void;
    onEdit: (bookmark: Bookmark) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete, onEdit }) => {
    if (bookmarks.length === 0) {
        return <div className="bookmark-list-empty">No bookmarks found.</div>;
    }

    return (
        <div className="bookmark-list">
            {bookmarks.map(bookmark => (
                <BookmarkItem
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
};
