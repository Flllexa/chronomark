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

// Check if we're running in Microsoft Edge
const isEdge = (): boolean => {
    return typeof navigator !== 'undefined' && navigator.userAgent.includes('Edg/');
};

// Check if browser supports chrome.identity API
const supportsIdentityAPI = (): boolean => {
    return typeof chrome !== 'undefined' && !!chrome.identity;
};

// Check if browser supports getAuthToken (Chrome style)
const supportsGetAuthToken = (): boolean => {
    return supportsIdentityAPI() && !isEdge();
};

// Edge OAuth flow using launchWebAuthFlow
const getAuthTokenEdge = (interactive: boolean): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
        if (!interactive) {
            // Edge doesn't support silent token refresh, return undefined for non-interactive
            return resolve(undefined);
        }

        const clientId = '214396245139-gqr3jjsrand4a0920kogdr2poikuo9rr.apps.googleusercontent.com';
        const scopes = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
        
        // For extensions, we need to use the exact redirect URI that's registered
        // Try to get the standard redirect URI first, then fallback to extension format
        let redirectUri;
        try {
            redirectUri = chrome.identity.getRedirectURL();
            console.log('Using chrome.identity.getRedirectURL():', redirectUri);
        } catch (error) {
            console.log('getRedirectURL failed, using manual format');
            redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
        }
        
        // Alternative: Use the standard OAuth redirect for web apps if extension redirect fails
        // This would need to be registered in Google Cloud Console
        if (!redirectUri || redirectUri.includes('undefined')) {
            redirectUri = 'urn:ietf:wg:oauth:2.0:oob';  // Out-of-band redirect for installed apps
            console.log('Using out-of-band redirect');
        }
        
        // Debug log
        console.log('Edge OAuth - Redirect URI:', redirectUri);
        console.log('Edge OAuth - Extension ID:', chrome.runtime.id);
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}&` +
            `response_type=token&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `access_type=online&` +
            `include_granted_scopes=true&` +
            `prompt=consent`;

        console.log('Edge OAuth - Auth URL:', authUrl);

        chrome.identity.launchWebAuthFlow(
            {
                url: authUrl,
                interactive: true
            },
            (responseUrl) => {
                console.log('Edge OAuth - Response URL:', responseUrl);
                console.log('Edge OAuth - Runtime error:', chrome.runtime.lastError);

                if (chrome.runtime.lastError) {
                    return reject(new Error(`OAuth Error: ${chrome.runtime.lastError.message}`));
                }

                if (!responseUrl) {
                    return reject(new Error('Authorization was cancelled or no response received'));
                }

                // Handle different response formats
                let accessToken = null;

                // Try URL fragment first (standard OAuth implicit flow)
                if (responseUrl.includes('#')) {
                    const urlFragment = responseUrl.split('#')[1];
                    if (urlFragment) {
                        const params = new URLSearchParams(urlFragment);
                        accessToken = params.get('access_token');
                    }
                }

                // Try URL query parameters (some OAuth flows)
                if (!accessToken && responseUrl.includes('?')) {
                    const urlQuery = responseUrl.split('?')[1];
                    if (urlQuery) {
                        const params = new URLSearchParams(urlQuery);
                        accessToken = params.get('access_token');
                    }
                }

                // Try to extract from the full URL if needed
                if (!accessToken) {
                    const accessTokenMatch = responseUrl.match(/access_token=([^&]+)/);
                    if (accessTokenMatch) {
                        accessToken = decodeURIComponent(accessTokenMatch[1]);
                    }
                }
                
                if (!accessToken) {
                    console.log('Edge OAuth - Full response URL for debugging:', responseUrl);
                    return reject(new Error('No access token found in OAuth response'));
                }

                console.log('Edge OAuth - Success! Token received');
                resolve(accessToken);
            }
        );
    });
};

// Helper to handle API responses and auth errors
const handleApiResponse = async (response: Response): Promise<Response> => {
    if (response.status === 401 || response.status === 403) {
        // This token is bad. Clear it from the cache.
        if (supportsGetAuthToken()) {
            const clearToken = () => {
                return new Promise<void>((resolve) => {
                    chrome.identity.getAuthToken({ interactive: false }, (token?: string) => {
                        if (token) {
                            chrome.identity.removeCachedAuthToken({ token }, () => resolve());
                        } else {
                            resolve();
                        }
                    });
                });
            };
            await clearToken();
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
        if (!supportsIdentityAPI()) {
            if (interactive) {
                console.warn("Chrome identity API not available. This is expected when running outside of a Chrome extension. Sync features will be disabled.");
            }
            return resolve(undefined);
        }

        // Use Edge-compatible flow for Microsoft Edge
        if (isEdge()) {
            return getAuthTokenEdge(interactive).then(resolve).catch(reject);
        }

        // Use Chrome's getAuthToken for Chrome and other Chromium browsers
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
        if (!supportsIdentityAPI()) {
            return resolve();
        }

        // For Edge, we just clear local storage since tokens aren't cached
        if (isEdge()) {
            const storage = (chrome.storage && chrome.storage.local) ? chrome.storage.local : null;
            if (storage) {
                storage.remove(FILE_ID_KEY, () => {
                    resolve();
                });
            } else {
                resolve();
            }
            return;
        }

        // Chrome token clearing
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

    // Search for the file on Google Drive in the user's root folder
    const query = encodeURIComponent(`name='${SYNC_FILE_NAME}' and trashed=false`);
    const searchResponse = await fetch(`${GOOGLE_API_BASE_URL}/files?q=${query}&fields=files(id)`, {
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

    // If not found, create it in the user's root folder
    const createResponse = await fetch(`${GOOGLE_API_BASE_URL}/files`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
            name: SYNC_FILE_NAME,
            mimeType: 'application/json'
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