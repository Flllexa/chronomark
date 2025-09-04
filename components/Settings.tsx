

import React, { useState, useEffect } from 'react';
import type { Settings as SettingsType, ImportStatus, TagWithCount, BookmarkStats } from '../types';
import { CloseIcon, TagIcon, CloudCheckIcon } from './icons';
import { ToggleSwitch } from './ToggleSwitch';
import { TagManagement } from './TagManagement';

interface SettingsProps {
    settings: SettingsType;
    onUpdateSettings: (newSettings: Partial<SettingsType>) => void;
    onClose: () => void;
    importStatus: ImportStatus;
    onImport: () => void;
    tagsWithCounts: TagWithCount[];
    bookmarkStats: BookmarkStats;
    onRenameTag: (oldName: string, newName: string) => Promise<void>;
    onDeleteTag: (tagName: string) => Promise<void>;
    hasExistingBookmarks: boolean;
}

type SettingsView = 'main' | 'tags';

export const Settings: React.FC<SettingsProps> = ({ 
    settings, 
    onUpdateSettings, 
    onClose, 
    importStatus, 
    onImport,
    tagsWithCounts,
    bookmarkStats,
    onRenameTag,
    onDeleteTag,
    hasExistingBookmarks
}) => {
    const [view, setView] = useState<SettingsView>('main');
    const [driveFolderInfo, setDriveFolderInfo] = useState<string>('');

    const isImporting = importStatus.status !== 'idle';

    useEffect(() => {
        // Get the file ID from storage to show folder info
        const getDriveFolderInfo = async () => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                try {
                    const result = await chrome.storage.local.get(['googleDriveFileId']);
                    if (result.googleDriveFileId) {
                        setDriveFolderInfo('Google Drive > App Data > chronomark_bookmarks.json');
                    } else {
                        setDriveFolderInfo('Not configured yet');
                    }
                } catch (error) {
                    setDriveFolderInfo('Unable to determine location');
                }
            } else {
                setDriveFolderInfo('Chrome extension storage not available');
            }
        };

        getDriveFolderInfo();
    }, []);

    const renderImportStatus = () => {
        if (!isImporting) return null;
        
        let statusClass = '';
        if (importStatus.status === 'success') statusClass = 'success';
        if (importStatus.status === 'error') statusClass = 'error';

        let content = <></>;
        switch (importStatus.status) {
            case 'scanning':
                content = <p>Scanning Chrome bookmarks...</p>;
                break;
            case 'importing':
                if (importStatus.progress) {
                     const { current, total } = importStatus.progress;
                     const title = importStatus.message || '';
                     content = (
                         <p>
                            Importing {current} of {total}...
                            <span className="progress-title">{title}</span>
                        </p>
                     );
                } else {
                    content = <p>Importing bookmarks...</p>;
                }
                break;
            case 'success':
                content = <p>{importStatus.message}</p>;
                break;
            case 'error':
                 content = <p>Error: {importStatus.message}</p>;
                 break;
        }
        return <div className={`import-status ${statusClass}`}>{content}</div>;
    }

    if (view === 'tags') {
        return (
            <TagManagement 
                tags={tagsWithCounts}
                onRename={onRenameTag}
                onDelete={onDeleteTag}
                onBack={() => setView('main')}
            />
        );
    }


    return (
        <div className="settings-view animate-fade-in">
            <div className="settings-header">
                <h2>Settings</h2>
                <button 
                    onClick={onClose} 
                    className="close-btn"
                    title="Close settings"
                >
                    <CloseIcon className="icon" />
                </button>
            </div>

            <div className="settings-body">
                <div className="setting-item">
                    <div>
                        <h3>Automatic Sync</h3>
                        <p>Sync with Google Drive on open and every hour.</p>
                    </div>
                    <ToggleSwitch 
                        checked={settings.autoSync}
                        onChange={(checked) => onUpdateSettings({ autoSync: checked })}
                    />
                </div>

                <div className="setting-item">
                    <div>
                        <h3>Google Drive Location</h3>
                        <p>Your bookmarks are saved in:</p>
                        <div className="drive-folder-info">
                            <CloudCheckIcon className="icon" />
                            <span>{driveFolderInfo}</span>
                        </div>
                    </div>
                </div>

                <div className="setting-item">
                    <div>
                        <h3>Statistics</h3>
                        <p>Your bookmark activity overview:</p>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number">{bookmarkStats.today}</span>
                                <span className="stat-label">Today</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{bookmarkStats.thisWeek}</span>
                                <span className="stat-label">This Week</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{bookmarkStats.thisMonth}</span>
                                <span className="stat-label">This Month</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{bookmarkStats.total}</span>
                                <span className="stat-label">Total Bookmarks</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{bookmarkStats.totalTags}</span>
                                <span className="stat-label">Total Tags</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div 
                    onClick={() => setView('tags')}
                    className="setting-item clickable"
                >
                     <div>
                        <h3>Manage Tags</h3>
                        <p>Rename, merge, or delete existing tags.</p>
                    </div>
                    <TagIcon className="icon" />
                </div>


                <div className="settings-divider">
                    <div className="setting-item">
                        <div className="import-section">
                            <div className="import-header">
                                <h3>Import Bookmarks</h3>
                                {hasExistingBookmarks && (
                                    <div className="info-icon" title="Import is disabled because you already have bookmarks. This prevents duplicates and maintains your current organization.">
                                        ℹ️
                                    </div>
                                )}
                            </div>
                            <p>
                                {hasExistingBookmarks 
                                    ? "Import is disabled to prevent duplicates since you already have bookmarks."
                                    : "Import from Chrome and auto-tag with AI."
                                }
                            </p>
                        </div>
                        <button
                            onClick={onImport}
                            disabled={isImporting || hasExistingBookmarks}
                            className={`btn btn-primary import-btn ${hasExistingBookmarks ? 'disabled-with-reason' : ''}`}
                            title={hasExistingBookmarks ? "Import disabled - you already have bookmarks" : ""}
                        >
                            {isImporting ? 'Importing...' : 'Import from Chrome'}
                        </button>
                    </div>
                    {renderImportStatus()}
                </div>
            </div>
        </div>
    );
};