import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Bookmark } from '../types';
import { BookmarkItem } from './BookmarkItem';

interface AdvancedVirtualizedListProps {
    bookmarks: Bookmark[];
    onDelete: (id: string) => void;
    onEdit: (bookmark: Bookmark) => void;
    containerHeight?: number;
    estimatedItemHeight?: number;
}

interface ItemPosition {
    id: string;
    top: number;
    height: number;
}

export const AdvancedVirtualizedList: React.FC<AdvancedVirtualizedListProps> = ({
    bookmarks,
    onDelete,
    onEdit,
    containerHeight = 400,
    estimatedItemHeight = 120
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [itemPositions, setItemPositions] = useState<ItemPosition[]>([]);
    const [measuredItems, setMeasuredItems] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Calcular posições dos itens
    const calculateItemPositions = useCallback(() => {
        const positions: ItemPosition[] = [];
        let currentTop = 0;

        bookmarks.forEach(bookmark => {
            const measuredItem = measuredItems.has(bookmark.id);
            const height = measuredItem ? 
                itemRefs.current.get(bookmark.id)?.offsetHeight || estimatedItemHeight :
                estimatedItemHeight;

            positions.push({
                id: bookmark.id,
                top: currentTop,
                height
            });

            currentTop += height;
        });

        setItemPositions(positions);
    }, [bookmarks, measuredItems, estimatedItemHeight]);

    // Encontrar itens visíveis
    const visibleItems = useMemo(() => {
        if (itemPositions.length === 0) return [];

        // Get actual container height if containerHeight is 0
        const actualContainerHeight = containerHeight || (containerRef.current?.clientHeight || 400);

        const startIndex = itemPositions.findIndex(pos => pos.top + pos.height > scrollTop);
        const endIndex = itemPositions.findIndex(pos => pos.top > scrollTop + actualContainerHeight);

        const start = Math.max(0, startIndex === -1 ? 0 : startIndex);
        const end = endIndex === -1 ? itemPositions.length : endIndex + 1;

        return itemPositions.slice(start, end)
            .map(pos => {
                const bookmark = bookmarks.find(b => b.id === pos.id);
                return bookmark ? { ...pos, bookmark } : null;
            })
            .filter(Boolean) as Array<{ id: string; top: number; height: number; bookmark: Bookmark }>;
    }, [itemPositions, scrollTop, containerHeight, bookmarks]);

    // Medir altura real dos itens
    const measureItem = useCallback((id: string, element: HTMLDivElement) => {
        const height = element.offsetHeight;
        if (height > 0 && !measuredItems.has(id)) {
            setMeasuredItems(prev => new Set(prev).add(id));
            itemRefs.current.set(id, element);
        }
    }, [measuredItems]);

    // Handlers
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const handleItemRef = useCallback((id: string) => (element: HTMLDivElement | null) => {
        if (element) {
            measureItem(id, element);
        }
    }, [measureItem]);

    // Efeitos
    useEffect(() => {
        calculateItemPositions();
    }, [calculateItemPositions]);

    useEffect(() => {
        if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
            // If containerHeight is 0, use the actual container height
            if (containerHeight === 0) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.height > 0) {
                    // Update the scroll calculation with actual height
                    setScrollTop(containerRef.current.scrollTop);
                }
            }
        }
    }, [bookmarks, containerHeight]);

    if (bookmarks.length === 0) {
        return <div className="bookmark-list-empty">No bookmarks found.</div>;
    }

    const totalHeight = itemPositions.length > 0 ? 
        itemPositions[itemPositions.length - 1].top + itemPositions[itemPositions.length - 1].height : 
        bookmarks.length * estimatedItemHeight;

    const actualHeight = containerHeight || '100%';
    
    return (
        <div 
            ref={containerRef}
            className="advanced-virtualized-list"
            style={{
                height: actualHeight,
                overflowY: 'auto',
                position: 'relative'
            }}
            onScroll={handleScroll}
        >
            {/* Spacer para manter a altura total */}
            <div style={{ height: totalHeight }} />
            
            {/* Container dos itens visíveis */}
            <div 
                className="virtualized-items-container"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0
                }}
            >
                {visibleItems.map(({ id, top, height, bookmark }) => (
                    <div
                        key={id}
                        ref={handleItemRef(id)}
                        style={{
                            position: 'absolute',
                            top: top,
                            left: 0,
                            right: 0,
                            height: height
                        }}
                    >
                        {bookmark && (
                            <BookmarkItem
                                bookmark={bookmark}
                                onDelete={onDelete}
                                onEdit={onEdit}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
