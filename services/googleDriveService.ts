// FIX: Added a triple-slash directive to include Chrome extension type definitions.
/// <reference types="chrome" />

import type { Bookmark } from '../types';
import { SYNC_FILE_NAME, GOOGLE_API_BASE_URL, GOOGLE_API_UPLOAD_URL } from '../constants';

const FILE_ID_KEY = 'googleDriveFileId';

// Custom error for authentication issues
export class GoogleAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GoogleAuthError';
    }
}

// Helper to handle API responses and auth errors
const handleApiResponse = async (response: Response): Promise<Response> => {
    if (response.status === 401 || response.status === 403) {
        // This token is bad. Attempt to clear it from the cache.
        if (typeof chrome !== 'undefined' && chrome.identity) {
            chrome.identity.getAuthToken({ interactive: false }, (token?: string) => {
                if (token) {
                    // Fire-and-forget removal of the invalid token.
                    chrome.identity.removeCachedAuthToken({ token }, () => {});
                }
            });
        }
        throw new GoogleAuthError('Authentication token is invalid or expired.');
    }
    if (!response.ok) {
        // Try to get a meaningful error message from the response body
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error?.message || response.statusText;
        throw new Error(`API Error (${response.status}): ${message}`);
    }
    return response;
};


export const getAuthToken = (interactive: boolean): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
        if (typeof chrome === 'undefined' || !chrome.identity) {
            if (interactive) {
                // Only warn if an interactive login was attempted, to avoid spamming the console on startup.
                console.warn("Chrome identity API not available. This is expected when running outside of a Chrome extension. Sync features will be disabled.");
            }
            return resolve(undefined);
        }
        chrome.identity.getAuthToken({ interactive }, (token) => {
            if (chrome.runtime && chrome.runtime.lastError) {
                if (interactive) {
                    // For an interactive request, failure to get a token is a legitimate error
                    // that we should report to the caller.
                    return reject(new Error(chrome.runtime.lastError.message));
                }
                // For a non-interactive request, it's common for there to be no token,
                // so we resolve with undefined and let the caller decide what to do.
                return resolve(undefined);
            }
            resolve(token);
        });
    });
};

export const clearAuthToken = (): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof chrome === 'undefined' || !chrome.identity) {
            return resolve();
        }

        chrome.identity.getAuthToken({ interactive: false }, (token?: string) => {
            if ((chrome.runtime && chrome.runtime.lastError) || !token) {
                // If there's an error or no token, there's nothing to clear.
                return resolve();
            }

            // Remove the cached token
            chrome.identity.removeCachedAuthToken({ token }, () => {
                const storage = (chrome.storage && chrome.storage.local) ? chrome.storage.local : null;
                if (storage) {
                    // Also clear the file ID as a new user might log in.
                    storage.remove(FILE_ID_KEY, () => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    });
};

const getHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

export const findOrCreateFile = async (token: string): Promise<string> => {
    // Chrome extension storage is preferred for caching the file ID
    const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : null;
    
    if (storage) {
        const result = await storage.get([FILE_ID_KEY]);
        if (result[FILE_ID_KEY]) {
             try {
                const response = await fetch(`${GOOGLE_API_BASE_URL}/files/${result[FILE_ID_KEY]}?fields=id`, {
                    headers: getHeaders(token),
                });
                if(response.ok) return result[FILE_ID_KEY];
                // If not ok (e.g. 404), the file was deleted, so we proceed to find/create it again.
            } catch (e) {
                console.warn("Verification of cached file ID failed, will search again:", e);
            }
        }
    }

    // Search for the file on Google Drive in the appDataFolder
    const query = encodeURIComponent(`name='${SYNC_FILE_NAME}' and trashed=false`);
    const searchResponse = await fetch(`${GOOGLE_API_BASE_URL}/files?q=${query}&spaces=appDataFolder&fields=files(id)`, {
        headers: getHeaders(token)
    }).then(handleApiResponse);

    const searchResult = await searchResponse.json();
    if (searchResult.files && searchResult.files.length > 0) {
        const fileId = searchResult.files[0].id;
         if (storage) {
            await storage.set({ [FILE_ID_KEY]: fileId });
         }
        return fileId;
    }

    // If not found, create it in the appDataFolder
    const createResponse = await fetch(`${GOOGLE_API_BASE_URL}/files`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
            name: SYNC_FILE_NAME,
            mimeType: 'application/json',
            parents: ['appDataFolder']
        })
    }).then(handleApiResponse);

    const newFile = await createResponse.json();
    if (storage) {
        await storage.set({ [FILE_ID_KEY]: newFile.id });
    }
    return newFile.id;
};


export const downloadBookmarks = async (token: string, fileId: string): Promise<Bookmark[]> => {
    const response = await fetch(`${GOOGLE_API_BASE_URL}/files/${fileId}?alt=media`, {
        headers: getHeaders(token)
    });

    // Special handling for 404 on download - it means an empty file, not an error.
    if (response.status === 404) return [];
    
    await handleApiResponse(response);
    
    const text = await response.text();
    if (!text) return [];

    try {
        const bookmarks = JSON.parse(text);
        // Basic validation
        if (Array.isArray(bookmarks)) {
            return bookmarks;
        }
        console.warn("Downloaded content is not an array of bookmarks.");
        return [];
    } catch (e) {
        console.error("Failed to parse remote bookmarks:", e);
        return [];
    }
};

export const uploadBookmarks = async (token: string, fileId: string, bookmarks: Bookmark[]): Promise<void> => {
    const metadata = { mimeType: 'application/json' };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' }));
    
    await fetch(`${GOOGLE_API_UPLOAD_URL}/files/${fileId}?uploadType=multipart`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: form,
    }).then(handleApiResponse);
};