
import type { Bookmark } from '../types';
import { DB_NAME, DB_VERSION, BOOKMARKS_STORE_NAME } from '../constants';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (db) return resolve(true);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', request.error);
            reject(false);
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(true);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(BOOKMARKS_STORE_NAME)) {
                dbInstance.createObjectStore(BOOKMARKS_STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const addBookmark = (bookmark: Bookmark): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([BOOKMARKS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
        const request = store.add(bookmark);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAllBookmarks = (): Promise<Bookmark[]> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([BOOKMARKS_STORE_NAME], 'readonly');
        const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteBookmark = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([BOOKMARKS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const updateBookmark = (bookmark: Bookmark): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([BOOKMARKS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
        const request = store.put(bookmark);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const updateMultipleBookmarks = (bookmarksToUpdate: Bookmark[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (bookmarksToUpdate.length === 0) {
            return resolve();
        }
        const transaction = db.transaction([BOOKMARKS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
        
        for (const bookmark of bookmarksToUpdate) {
            store.put(bookmark);
        }
    });
};


export const clearBookmarks = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([BOOKMARKS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}