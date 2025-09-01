(() => {
  // constants.ts
  var DB_NAME = "ChronoMarkDB";
  var DB_VERSION = 1;
  var BOOKMARKS_STORE_NAME = "bookmarks";
  var SYNC_FILE_NAME = "chronomark_bookmarks.json";
  var GOOGLE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
  var GOOGLE_API_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3";

  // services/dbService.ts
  var db;
  var initDB = () => {
    return new Promise((resolve, reject) => {
      if (db) return resolve(true);
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => {
        console.error("Database error:", request.error);
        reject(false);
      };
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(true);
      };
      request.onupgradeneeded = (event) => {
        const dbInstance = event.target.result;
        if (!dbInstance.objectStoreNames.contains(BOOKMARKS_STORE_NAME)) {
          dbInstance.createObjectStore(BOOKMARKS_STORE_NAME, { keyPath: "id" });
        }
      };
    });
  };
  var getAllBookmarks = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOOKMARKS_STORE_NAME], "readonly");
      const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  var updateMultipleBookmarks = (bookmarksToUpdate) => {
    return new Promise((resolve, reject) => {
      if (bookmarksToUpdate.length === 0) {
        return resolve();
      }
      const transaction = db.transaction([BOOKMARKS_STORE_NAME], "readwrite");
      const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
      for (const bookmark of bookmarksToUpdate) {
        store.put(bookmark);
      }
    });
  };
  var clearBookmarks = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOOKMARKS_STORE_NAME], "readwrite");
      const store = transaction.objectStore(BOOKMARKS_STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // services/googleDriveService.ts
  var FILE_ID_KEY = "googleDriveFileId";
  var GoogleAuthError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "GoogleAuthError";
    }
  };
  var handleApiResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
      if (typeof chrome !== "undefined" && chrome.identity) {
        const clearToken = () => {
          return new Promise((resolve) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
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
      throw new GoogleAuthError("Authentication token is invalid or expired.");
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.error?.message || response.statusText;
      throw new Error(`API Error (${response.status}): ${message}`);
    }
    return response;
  };
  var getAuthToken = (interactive) => {
    return new Promise((resolve, reject) => {
      if (typeof chrome === "undefined" || !chrome.identity) {
        if (interactive) {
          console.warn("Chrome identity API not available. This is expected when running outside of a Chrome extension. Sync features will be disabled.");
        }
        return resolve(void 0);
      }
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          if (interactive) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          return resolve(void 0);
        }
        resolve(token);
      });
    });
  };
  var getHeaders = (token) => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  });
  var findOrCreateFile = async (token) => {
    const storage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
    if (storage) {
      const result = await storage.get([FILE_ID_KEY]);
      if (result[FILE_ID_KEY]) {
        try {
          const response = await fetch(`${GOOGLE_API_BASE_URL}/files/${result[FILE_ID_KEY]}?fields=id`, {
            headers: getHeaders(token)
          });
          if (response.ok) return result[FILE_ID_KEY];
        } catch (e) {
          console.warn("Verification of cached file ID failed, will search again:", e);
        }
      }
    }
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
    const createResponse = await fetch(`${GOOGLE_API_BASE_URL}/files`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({
        name: SYNC_FILE_NAME,
        mimeType: "application/json"
      })
    }).then(handleApiResponse);
    const newFile = await createResponse.json();
    if (storage) {
      await storage.set({ [FILE_ID_KEY]: newFile.id });
    }
    return newFile.id;
  };
  var downloadBookmarks = async (token, fileId) => {
    const response = await fetch(`${GOOGLE_API_BASE_URL}/files/${fileId}?alt=media`, {
      headers: getHeaders(token)
    });
    if (response.status === 404) return [];
    await handleApiResponse(response);
    const text = await response.text();
    if (!text) return [];
    try {
      const bookmarks = JSON.parse(text);
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
  var uploadBookmarks = async (token, fileId, bookmarks) => {
    const metadata = { mimeType: "application/json" };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", new Blob([JSON.stringify(bookmarks, null, 2)], { type: "application/json" }));
    await fetch(`${GOOGLE_API_UPLOAD_URL}/files/${fileId}?uploadType=multipart`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: form
    }).then(handleApiResponse);
  };

  // services/syncService.ts
  var syncCoreLogic = async (token) => {
    await initDB();
    const fileId = await findOrCreateFile(token);
    const remoteBookmarks = await downloadBookmarks(token, fileId);
    const localBookmarks = await getAllBookmarks();
    const allBookmarksMap = /* @__PURE__ */ new Map();
    for (const bookmark of localBookmarks) {
      allBookmarksMap.set(bookmark.id, { local: bookmark });
    }
    for (const bookmark of remoteBookmarks) {
      const existing = allBookmarksMap.get(bookmark.id) || {};
      allBookmarksMap.set(bookmark.id, { ...existing, remote: bookmark });
    }
    const mergedBookmarks = [];
    for (const { local, remote } of allBookmarksMap.values()) {
      if (local && !remote) {
        mergedBookmarks.push(local);
      } else if (!local && remote) {
        mergedBookmarks.push(remote);
      } else if (local && remote) {
        const localTimestamp = local.updatedAt || local.createdAt;
        const remoteTimestamp = remote.updatedAt || remote.createdAt;
        if (localTimestamp > remoteTimestamp) {
          mergedBookmarks.push(local);
        } else {
          mergedBookmarks.push(remote);
        }
      }
    }
    await uploadBookmarks(token, fileId, mergedBookmarks);
    await clearBookmarks();
    if (mergedBookmarks.length > 0) {
      await updateMultipleBookmarks(mergedBookmarks);
    }
    return Date.now();
  };

  // background.ts
  var SYNC_ALARM_NAME = "chronoMarkSyncAlarm";
  var SETTINGS_KEY = "chronoMarkSettings";
  var performSync = async () => {
    console.log("ChronoMark: Checking conditions for background sync...");
    const storage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
    if (!storage) {
      console.log("ChronoMark: Storage API not available. Skipping sync.");
      return;
    }
    const result = await storage.get([SETTINGS_KEY]);
    const settings = result[SETTINGS_KEY] || { autoSync: true };
    if (!settings.autoSync) {
      console.log("ChronoMark: Auto-sync is disabled. Skipping sync.");
      return;
    }
    const token = await getAuthToken(false);
    if (!token) {
      console.log("ChronoMark: Not authenticated. Skipping sync.");
      return;
    }
    try {
      console.log("ChronoMark: Starting background sync...");
      const syncTime = await syncCoreLogic(token);
      await storage.set({ lastSyncTime: syncTime });
      console.log("ChronoMark: Background sync successful at", new Date(syncTime).toLocaleTimeString());
    } catch (error) {
      console.error("ChronoMark: Background sync failed.", error);
    }
  };
  var setupAlarm = () => {
    if (typeof chrome !== "undefined" && chrome.alarms) {
      chrome.alarms.get(SYNC_ALARM_NAME, (alarm) => {
        if (!alarm) {
          chrome.alarms.create(SYNC_ALARM_NAME, { periodInMinutes: 60 });
          console.log("ChronoMark: Sync alarm created.");
        }
      });
    }
  };
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onInstalled.addListener(() => {
      console.log("ChronoMark: Extension installed/updated.");
      setupAlarm();
    });
    chrome.runtime.onStartup.addListener(() => {
      console.log("ChronoMark: Browser started.");
      setupAlarm();
    });
  }
  if (typeof chrome !== "undefined" && chrome.alarms) {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === SYNC_ALARM_NAME) {
        performSync();
      }
    });
  }
})();
