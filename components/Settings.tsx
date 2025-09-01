

import React, { useState, useEffect } from 'react';
import type { Settings as SettingsType, ImportStatus, TagWithCount } from '../types';
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
    onRenameTag: (oldName: string, newName: string) => Promise<void>;
    onDeleteTag: (tagName: string) => Promise<void>;
}

type SettingsView = 'main' | 'tags';

export const Settings: React.FC<SettingsProps> = ({ 
    settings, 
    onUpdateSettings, 
    onClose, 
    importStatus, 
    onImport,
    tagsWithCounts,
    onRenameTag,
    onDeleteTag
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
                        <div>
                            <h3>Import Bookmarks</h3>
                            <p>Import from Chrome and auto-tag with AI.</p>
                        </div>
                        <button
                            onClick={onImport}
                            disabled={isImporting}
                            className="btn btn-primary import-btn"
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