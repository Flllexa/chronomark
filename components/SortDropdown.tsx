
import React from 'react';

export type SortOrder = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc';

interface SortDropdownProps {
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortOrder, onSortChange }) => {
    return (
        <div className="sort-dropdown">
            <select
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value as SortOrder)}
                aria-label="Sort bookmarks"
            >
                <option value="date_desc">Date Added (Newest)</option>
                <option value="date_asc">Date Added (Oldest)</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
            </select>
            <div className="icon-wrapper">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            </div>
        </div>
    );
};
