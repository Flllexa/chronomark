import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Bookmark } from '../types';
import { BookmarkItem } from './BookmarkItem';

interface VirtualizedBookmarkListProps {
    bookmarks: Bookmark[];
    onDelete: (id: string) => void;
    onEdit: (bookmark: Bookmark) => void;
    itemHeight?: number;
    containerHeight?: number;
}

export const VirtualizedBookmarkList: React.FC<VirtualizedBookmarkListProps> = ({
    bookmarks,
    onDelete,
    onEdit,
    itemHeight = 120, // altura estimada de cada item
    containerHeight = 400 // altura do container
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calcular quantos itens cabem na tela
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    
    // Calcular o índice inicial e final dos itens visíveis
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleItemCount + 2, bookmarks.length); // +2 para buffer

    // Obter apenas os itens visíveis
    const visibleBookmarks = bookmarks.slice(startIndex, endIndex);

    // Calcular o offset para posicionar os itens corretamente
    const offsetY = startIndex * itemHeight;

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // Atualizar scroll quando a lista mudar
    useEffect(() => {
        if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
        }
    }, [bookmarks]);

    if (bookmarks.length === 0) {
        return <div className="bookmark-list-empty">No bookmarks found.</div>;
    }

    return (
        <div 
            ref={containerRef}
            className="virtualized-bookmark-list"
            style={{
                height: containerHeight,
                overflowY: 'auto',
                position: 'relative'
            }}
            onScroll={handleScroll}
        >
            {/* Spacer para manter a altura total */}
            <div style={{ height: bookmarks.length * itemHeight }} />
            
            {/* Container dos itens visíveis */}
            <div 
                className="virtualized-items-container"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${offsetY}px)`
                }}
            >
                {visibleBookmarks.map((bookmark, index) => (
                    <div
                        key={bookmark.id}
                        style={{
                            height: itemHeight,
                            paddingBottom: '0.5rem'
                        }}
                    >
                        <BookmarkItem
                            bookmark={bookmark}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

