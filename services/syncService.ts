import type { Bookmark } from '../types';
import * as dbService from './dbService';
import * as googleDriveService from './googleDriveService';

export const syncCoreLogic = async (token: string): Promise<number> => {
    await dbService.initDB();

    const fileId = await googleDriveService.findOrCreateFile(token);
    const remoteBookmarks = await googleDriveService.downloadBookmarks(token, fileId);
    const localBookmarks = await dbService.getAllBookmarks();

    const allBookmarksMap = new Map<string, { local?: Bookmark; remote?: Bookmark }>();

    // Populate map with local bookmarks
    for (const bookmark of localBookmarks) {
        allBookmarksMap.set(bookmark.id, { local: bookmark });
    }

    // Populate map with remote bookmarks, merging with existing local ones
    for (const bookmark of remoteBookmarks) {
        const existing = allBookmarksMap.get(bookmark.id) || {};
        allBookmarksMap.set(bookmark.id, { ...existing, remote: bookmark });
    }

    const mergedBookmarks: Bookmark[] = [];
    for (const { local, remote } of allBookmarksMap.values()) {
        if (local && !remote) {
            // Exists only locally, keep it
            mergedBookmarks.push(local);
        } else if (!local && remote) {
            // Exists only remotely, keep it
            mergedBookmarks.push(remote);
        } else if (local && remote) {
            // Exists in both, compare timestamps.
            // The `updatedAt` field is crucial. If it's missing on old data,
            // we fall back to `createdAt` to handle legacy items.
            const localTimestamp = local.updatedAt || local.createdAt;
            const remoteTimestamp = remote.updatedAt || remote.createdAt;

            if (localTimestamp > remoteTimestamp) {
                mergedBookmarks.push(local); // Local is newer
            } else {
                mergedBookmarks.push(remote); // Remote is newer or they are equal
            }
        }
    }

    // Upload the correctly merged list to Google Drive
    await googleDriveService.uploadBookmarks(token, fileId, mergedBookmarks);

    // Update local IndexedDB with the merged list. This is more efficient
    // and safer than updating item by item.
    await dbService.clearBookmarks();
    if (mergedBookmarks.length > 0) {
        // updateMultipleBookmarks uses a single transaction to 'put' all items.
        await dbService.updateMultipleBookmarks(mergedBookmarks);
    }
    
    return Date.now();
};