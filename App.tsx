
// FIX: Moved the triple-slash directive to be the absolute first line in the file.
/// <reference types="chrome" />

import React, { useState, useMemo, useEffect } from 'react';
import { BookmarkForm } from './components/BookmarkForm';
import { AdvancedVirtualizedList } from './components/AdvancedVirtualizedList';
import { SearchBar } from './components/SearchBar';
import { SyncStatus } from './components/SyncStatus';
import { Settings } from './components/Settings';
import { useBookmarks } from './hooks/useBookmarks';
import type { Bookmark, CurrentTab } from './types';
import { AddIcon, SettingsIcon, EditIcon } from './components/icons';
import { SortDropdown, type SortOrder } from './components/SortDropdown';

const App: React.FC = () => {
    const { 
        bookmarks, 
        addBookmark, 
        deleteBookmark, 
        updateBookmark,
        syncWithGoogleDrive,
        syncStatus,
        isAuthenticated,
        settings,
        updateSettings,
        importStatus,
        importFromChrome,
        allTags,
        tagsWithCounts,
        renameTag,
        deleteTag,
    } = useBookmarks();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
    const [isAdding, setIsAdding] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
    const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null);

    // Fetch current tab when opening the Add flow
    useEffect(() => {
        if (isAdding) {
             if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                    if (tabs[0] && tabs[0].url && tabs[0].title) {
                        setCurrentTab({ url: tabs[0].url, title: tabs[0].title });
                    }
                });
            } else {
                // Fallback for development outside extension
                setCurrentTab({ url: 'http://example.com', title: 'Example Page' });
            }
        }
    }, [isAdding]);

    // Also fetch current tab on mount so the FAB icon can reflect the correct state in the list view
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                if (tabs[0] && tabs[0].url && tabs[0].title) {
                    setCurrentTab({ url: tabs[0].url, title: tabs[0].title });
                }
            });
        } else {
            // Fallback for development outside extension
            setCurrentTab((prev) => prev ?? { url: 'http://example.com', title: 'Example Page' });
        }
        // We only want to run this on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sortedAndFilteredBookmarks = useMemo(() => {
        const filtered = bookmarks.filter(bookmark =>
            bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                case 'date_asc':
                    return a.createdAt - b.createdAt;
                case 'date_desc':
                default:
                    return b.createdAt - a.createdAt;
            }
        });
    }, [bookmarks, searchTerm, sortOrder]);

    // FIX: Corrected the type of the bookmark parameter to match the `addBookmark` function signature.
    const handleSaveBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
        addBookmark(bookmark);
        setIsAdding(false);
    };

    const handleUpdateBookmark = (bookmark: Bookmark) => {
        updateBookmark(bookmark);
        setEditingBookmark(null);
    }

    const handleStartEditing = (bookmark: Bookmark) => {
        setIsAdding(false);
        setShowSettings(false);
        setEditingBookmark(bookmark);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingBookmark(null);
    };

    // Small URL normalizer to align with the form logic
    const normalizeUrl = (url?: string | null) => {
        if (!url) return '';
        try {
            // Lowercase and remove trailing slash for simple normalization
            return url.trim().toLowerCase().replace(/\/$/, '');
        } catch {
            return url.trim().toLowerCase();
        }
    };

    // Determine if the current tab already exists among bookmarks
    const existingBookmarkForCurrentTab = useMemo(() => {
        const current = normalizeUrl(currentTab?.url);
        if (!current) return null;
        return bookmarks.find(b => normalizeUrl(b.url) === current) || null;
    }, [bookmarks, currentTab]);

    const renderMainView = () => {
        if (isAdding || editingBookmark) {
            const initialData = editingBookmark ? editingBookmark : currentTab;
            return (
                <BookmarkForm
                    onSave={handleSaveBookmark}
                    onUpdate={handleUpdateBookmark}
                    onCancel={handleCancel}
                    initialData={initialData}
                    allTags={allTags}
                    existingBookmarks={bookmarks}
                />
            );
        }

        if (showSettings) {
            return (
                <Settings 
                    settings={settings}
                    onUpdateSettings={updateSettings}
                    onClose={() => setShowSettings(false)}
                    importStatus={importStatus}
                    onImport={importFromChrome}
                    tagsWithCounts={tagsWithCounts}
                    onRenameTag={renameTag}
                    onDeleteTag={deleteTag}
                    hasExistingBookmarks={bookmarks.length > 0}
                />
            );
        }

        return (
            <div className="home-view">
                <div className="main-controls">
                    <div className="search-bar-container">
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                    </div>
                    <SortDropdown sortOrder={sortOrder} onSortChange={setSortOrder} />
                </div>
                <AdvancedVirtualizedList
                    bookmarks={sortedAndFilteredBookmarks}
                    onDelete={deleteBookmark}
                    onEdit={handleStartEditing}
                    containerHeight={400}
                    estimatedItemHeight={120}
                />
                <button
                    onClick={() => {
                        if (existingBookmarkForCurrentTab) {
                            // Edit existing bookmark
                            setEditingBookmark(existingBookmarkForCurrentTab);
                            setIsAdding(false);
                        } else {
                            // Add new bookmark
                            setIsAdding(true);
                            setEditingBookmark(null);
                        }
                        setShowSettings(false);
                    }}
                    className="add-bookmark-btn"
                    title={existingBookmarkForCurrentTab ? `Edit bookmark: ${existingBookmarkForCurrentTab.title}` : 'Add current tab'}
                >
                    {/* Show Edit icon if the current tab already exists */}
                    {existingBookmarkForCurrentTab ? (
                        <EditIcon className="icon" />
                    ) : (
                        <AddIcon className="icon" />
                    )}

                </button>
            </div>
        );
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>ChronoMark</h1>
                <div className="header-controls">
                    <SyncStatus
                        status={syncStatus}
                        isAuthenticated={isAuthenticated}
                        onSync={syncWithGoogleDrive}
                    />
                    <button onClick={() => {
                        setShowSettings(!showSettings);
                        setIsAdding(false);
                        setEditingBookmark(null);
                    }} className="settings-btn" title="Settings">
                        <SettingsIcon className="icon" />
                    </button>
                </div>
            </header>
            <main>
                {renderMainView()}
            </main>
        </div>
    );
};

export default App;