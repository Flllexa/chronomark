
import React from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
    searchTerm: string;
    onSearch: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch }) => {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
            />
            <div className="icon-wrapper">
                <SearchIcon className="icon" />
            </div>
        </div>
    );
};
