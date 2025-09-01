// FIX: Added a triple-slash directive to include Chrome extension type definitions.
/// <reference types="chrome" />

interface ChromeBookmark {
    url: string;
    title: string;
}

const traverseBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): ChromeBookmark[] => {
    let results: ChromeBookmark[] = [];
    if (!nodes) return results;

    for (const node of nodes) {
        // A bookmark node must have a URL. Folders do not.
        if (node.url && node.title) {
            results.push({ url: node.url, title: node.title });
        }
        // Recursively process children (if any)
        if (node.children) {
            results = results.concat(traverseBookmarks(node.children));
        }
    }
    return results;
};


export const getChromeBookmarks = (): Promise<ChromeBookmark[]> => {
    return new Promise((resolve, reject) => {
        if (typeof chrome === 'undefined' || !chrome.bookmarks) {
            console.warn("Chrome bookmarks API not available. This is expected outside of the extension environment.");
            return resolve([]);
        }

        try {
            chrome.bookmarks.getTree((bookmarkTreeNodes: chrome.bookmarks.BookmarkTreeNode[]) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message));
                }
                const bookmarks = traverseBookmarks(bookmarkTreeNodes);
                resolve(bookmarks);
            });
        } catch(e) {
            reject(e);
        }
    });
};