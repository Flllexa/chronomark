// FIX: Added a triple-slash directive to include Chrome extension type definitions.
/// <reference types="chrome" />

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Bookmark, SyncStatus, Settings, ImportStatus, TagWithCount } from '../types';
import * as dbService from '../services/dbService';
import * as googleDriveService from '../services/googleDriveService';
import { GoogleAuthError } from '../services/googleDriveService';
import { syncCoreLogic } from '../services/syncService';
import * as chromeBookmarkService from '../services/chromeBookmarkService';

const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : null;
const SETTINGS_KEY = 'chronoMarkSettings';
const LAST_SYNC_KEY = 'lastSyncTime';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'i', 'you', 'your', 'my', 'me', 'we', 'our', 'us', 'he',
  'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but',
  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for',
  'with', 'about', 'against', 'between', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
  'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', '-',
  '|', 'using', 'get', 'how-to', 'guide'
]);

/**
 * Generates relevant tags from a bookmark title by extracting keywords.
 * @param title The title of the bookmark.
 * @returns An array of up to 3 generated tags.
 */
const generateTagsFromTitle = (title: string): string[] => {
    if (!title) {
        return [];
    }
    const sanitizedTitle = title
        .toLowerCase()
        .replace(/['"“”‘’]/g, '')
        .replace(/[.,!?;:()[\]{}]/g, ' ')
        .replace(/\s+/g, ' ');

    const words = sanitizedTitle.split(' ');
    
    const potentialTags = words
        .map(word => word.trim())
        .filter(word => 
            word.length > 2 &&
            !STOP_WORDS.has(word) &&
            isNaN(Number(word))
        );

    const uniqueTags = [...new Set(potentialTags)];
    return uniqueTags.slice(0, 3);
};


export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle', lastSync: null });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [settings, setSettings] = useState<Settings>({ autoSync: true });
    const [importStatus, setImportStatus] = useState<ImportStatus>({ status: 'idle' });

    const loadBookmarks = useCallback(async () => {
        try {
            await dbService.initDB();
            const localBookmarks = await dbService.getAllBookmarks();
            setBookmarks(localBookmarks.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            console.error("Failed to load bookmarks from DB:", error);
        }
    }, []);

    const loadSettings = useCallback(async () => {
        if (!storage) return;
        const result = await storage.get([SETTINGS_KEY, LAST_SYNC_KEY]);
        if (result[SETTINGS_KEY]) {
            setSettings(result[SETTINGS_KEY]);
        }
        if (result[LAST_SYNC_KEY]) {
            setSyncStatus(prev => ({ ...prev, lastSync: result[LAST_SYNC_KEY] }));
        }
    }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            const token = await googleDriveService.getAuthToken(false);
            setIsAuthenticated(!!token);
        } catch (error) {
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        loadBookmarks();
        loadSettings();
        checkAuthStatus();
    }, [loadBookmarks, loadSettings, checkAuthStatus]);

    const syncWithGoogleDrive = useCallback(async () => {
        setSyncStatus(prev => ({ ...prev, status: 'syncing', message: 'Authenticating...' }));
        try {
            const token = await googleDriveService.getAuthToken(true);
            if (!token) {
                throw new Error("Authentication failed or was cancelled by the user.");
            }
            setIsAuthenticated(true);
            setSyncStatus(prev => ({ ...prev, status: 'syncing', message: 'Syncing data...' }));
            
            const syncTime = await syncCoreLogic(token);
            
            if (storage) {
                await storage.set({ [LAST_SYNC_KEY]: syncTime });
            }
            
            setSyncStatus({ status: 'success', message: 'Sync complete!', lastSync: syncTime });
            await loadBookmarks(); // Reload bookmarks after sync
            setTimeout(() => setSyncStatus(prev => ({...prev, status: 'idle'})), 3000);

        } catch (error) {
            console.error("Sync failed:", error);
            const message = error instanceof GoogleAuthError || (error instanceof Error && error.message.includes('cancelled'))
                ? "Authentication failed."
                : "An unexpected error occurred during sync.";
            setSyncStatus(prev => ({ ...prev, status: 'error', message }));
            setIsAuthenticated(false);
        }
    }, [loadBookmarks]);

    const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        if (storage) {
            await storage.set({ [SETTINGS_KEY]: updatedSettings });
        }
    }, [settings]);

    const addBookmark = useCallback(async (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = Date.now();
        const newBookmark: Bookmark = {
            ...bookmarkData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        };
        await dbService.addBookmark(newBookmark);
        await loadBookmarks();
    }, [loadBookmarks]);

    const updateBookmark = useCallback(async (bookmark: Bookmark) => {
        const bookmarkToUpdate = { ...bookmark, updatedAt: Date.now() };
        await dbService.updateBookmark(bookmarkToUpdate);
        await loadBookmarks();
    }, [loadBookmarks]);

    const deleteBookmark = useCallback(async (id: string) => {
        await dbService.deleteBookmark(id);
        await loadBookmarks();
    }, [loadBookmarks]);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        bookmarks.forEach(bookmark => {
            bookmark.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [bookmarks]);

    const tagsWithCounts = useMemo(() => {
        const counts = new Map<string, number>();
        bookmarks.forEach(bookmark => {
            bookmark.tags.forEach(tag => {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            });
        });
        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [bookmarks]);

    const importFromChrome = useCallback(async () => {
        setImportStatus({ status: 'scanning', message: 'Finding Chrome bookmarks...' });
        try {
            const chromeBookmarks = await chromeBookmarkService.getChromeBookmarks();
            if (chromeBookmarks.length === 0) {
                 setImportStatus({ status: 'success', message: 'No new bookmarks found to import.' });
                 setTimeout(() => setImportStatus({ status: 'idle' }), 3000);
                 return;
            }

            const existingUrls = new Set(bookmarks.map(b => b.url));
            const newChromeBookmarks = chromeBookmarks.filter(b => !existingUrls.has(b.url));
            
            if (newChromeBookmarks.length === 0) {
                 setImportStatus({ status: 'success', message: 'All Chrome bookmarks are already in ChronoMark.' });
                 setTimeout(() => setImportStatus({ status: 'idle' }), 3000);
                 return;
            }

            setImportStatus({ status: 'importing', progress: { current: 0, total: newChromeBookmarks.length } });
            
            for (let i = 0; i < newChromeBookmarks.length; i++) {
                const b = newChromeBookmarks[i];
                setImportStatus({
                    status: 'importing',
                    message: `Tagging: ${b.title}`,
                    progress: { current: i + 1, total: newChromeBookmarks.length }
                });

                const tags = generateTagsFromTitle(b.title);
                const now = Date.now();
                const newBookmark: Bookmark = {
                    id: crypto.randomUUID(),
                    title: b.title,
                    url: b.url,
                    tags,
                    createdAt: now - (newChromeBookmarks.length - i), // Stagger timestamps slightly
                    updatedAt: now - (newChromeBookmarks.length - i),
                };
                await dbService.addBookmark(newBookmark);
            }

            await loadBookmarks();
            setImportStatus({ status: 'success', message: `Successfully imported ${newChromeBookmarks.length} bookmarks.` });
            setTimeout(() => setImportStatus({ status: 'idle' }), 5000);

        } catch (error) {
            console.error("Failed to import Chrome bookmarks:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setImportStatus({ status: 'error', message });
        }
    }, [bookmarks, loadBookmarks]);
    
    const renameTag = useCallback(async (oldName: string, newName: string) => {
        const bookmarksToUpdate: Bookmark[] = [];
        const now = Date.now();
        
        for (const bookmark of bookmarks) {
            if (bookmark.tags.includes(oldName)) {
                const newTags = bookmark.tags
                    .filter(t => t.toLowerCase() !== oldName.toLowerCase()) // remove old tag
                    .concat(newName) // add new tag
                    .filter((value, index, self) => self.findIndex(t => t.toLowerCase() === value.toLowerCase()) === index); // make unique (case-insensitive)
                
                bookmarksToUpdate.push({ ...bookmark, tags: newTags, updatedAt: now });
            }
        }
        await dbService.updateMultipleBookmarks(bookmarksToUpdate);
        await loadBookmarks();
    }, [bookmarks, loadBookmarks]);
    
    const deleteTag = useCallback(async (tagName: string) => {
        const bookmarksToUpdate: Bookmark[] = [];
        const now = Date.now();
         for (const bookmark of bookmarks) {
            if (bookmark.tags.includes(tagName)) {
                bookmarksToUpdate.push({
                    ...bookmark,
                    tags: bookmark.tags.filter(t => t !== tagName),
                    updatedAt: now
                });
            }
        }
        await dbService.updateMultipleBookmarks(bookmarksToUpdate);
        await loadBookmarks();
    }, [bookmarks, loadBookmarks]);

    return {
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
    };
};