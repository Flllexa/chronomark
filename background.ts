// FIX: Added a triple-slash directive to include Chrome extension type definitions.
/// <reference types="chrome" />

import { syncCoreLogic } from './services/syncService';
import * as googleDriveService from './services/googleDriveService';

const SYNC_ALARM_NAME = 'chronoMarkSyncAlarm';
const SETTINGS_KEY = 'chronoMarkSettings';

// Function to perform the sync
const performSync = async () => {
    console.log('ChronoMark: Checking conditions for background sync...');
    
    // 1. Check if auto-sync is enabled in settings
    const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : null;
    if (!storage) {
        console.log('ChronoMark: Storage API not available. Skipping sync.');
        return;
    }

    const result = await storage.get([SETTINGS_KEY]);
    const settings = result[SETTINGS_KEY] || { autoSync: true };

    if (!settings.autoSync) {
        console.log('ChronoMark: Auto-sync is disabled. Skipping sync.');
        return;
    }

    // 2. Check for an active auth token
    const token = await googleDriveService.getAuthToken(false);
    if (!token) {
        console.log('ChronoMark: Not authenticated. Skipping sync.');
        return;
    }

    // 3. Perform the sync
    try {
        console.log('ChronoMark: Starting background sync...');
        const syncTime = await syncCoreLogic(token);
        await storage.set({ lastSyncTime: syncTime });
        console.log('ChronoMark: Background sync successful at', new Date(syncTime).toLocaleTimeString());
    } catch (error) {
        console.error('ChronoMark: Background sync failed.', error);
    }
};

// Function to setup the alarm
const setupAlarm = () => {
    if (typeof chrome !== 'undefined' && chrome.alarms) {
        chrome.alarms.get(SYNC_ALARM_NAME, (alarm?: chrome.alarms.Alarm) => {
            // Create the alarm if it doesn't exist
            if (!alarm) {
                // Sync every hour
                chrome.alarms.create(SYNC_ALARM_NAME, { periodInMinutes: 60 });
                console.log('ChronoMark: Sync alarm created.');
            }
        });
    }
};


// Listen for when the extension is first installed or updated
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onInstalled.addListener(() => {
        console.log('ChronoMark: Extension installed/updated.');
        setupAlarm();
    });

    // Listen for browser startup
    chrome.runtime.onStartup.addListener(() => {
        console.log('ChronoMark: Browser started.');
        setupAlarm();
    });
}


// Listen for the alarm
if (typeof chrome !== 'undefined' && chrome.alarms) {
    chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
        if (alarm.name === SYNC_ALARM_NAME) {
            performSync();
        }
    });
}