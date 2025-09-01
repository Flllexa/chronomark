
import React from 'react';
// FIX: Aliased the imported SyncStatus type to avoid a name collision with the component.
import type { SyncStatus as SyncStatusType } from '../types';
import { GoogleIcon, SyncIcon, CheckCircleIcon, ExclamationCircleIcon, CloudCheckIcon } from './icons';

interface SyncStatusProps {
    status: SyncStatusType;
    isAuthenticated: boolean;
    onSync: () => void;
}

const formatRelativeTime = (timestamp: number): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.round((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const diffInMinutes = Math.round(diffInSeconds / 60);
    if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');

    const diffInHours = Math.round(diffInMinutes / 60);
    if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');

    const diffInDays = Math.round(diffInHours / 24);
    return rtf.format(-diffInDays, 'day');
};


export const SyncStatus: React.FC<SyncStatusProps> = ({ status, isAuthenticated, onSync }) => {
    const isSyncing = status.status === 'syncing';

    if (!isAuthenticated) {
        return (
            <button
                onClick={onSync}
                disabled={isSyncing}
                className="login-btn"
                title="Login with Google and Sync"
            >
                <GoogleIcon className="icon" />
                <span>{isSyncing ? 'Connecting...' : 'Login & Sync'}</span>
            </button>
        );
    }

    const renderStatus = () => {
        const statusClass = status.status; // 'idle', 'syncing', 'success', 'error'
        switch (status.status) {
            case 'syncing':
                return <div className={`sync-status-text ${statusClass}`}>Syncing...</div>;
            case 'success':
                return <div className={`sync-status-text ${statusClass}`}><span><CheckCircleIcon className="icon"/> Synced</span></div>;
            case 'error':
                 return <div className={`sync-status-text ${statusClass}`} title={status.message}><span><ExclamationCircleIcon className="icon" /> Sync failed</span></div>;
            case 'idle':
            default:
                if (status.lastSync) {
                    return <div className="sync-status-text">Last synced: {formatRelativeTime(status.lastSync)}</div>;
                }
                return <div className="sync-status-text">Ready to sync</div>;
        }
    };

    const isSynced = status.status === 'success' || (status.status === 'idle' && status.lastSync);
    
    return (
        <div className="sync-status">
            {renderStatus()}
            <button
                onClick={onSync}
                disabled={isSyncing}
                className={`sync-btn ${isSynced ? 'synced' : ''}`}
                title={isSynced ? "All synced! Click to sync again" : "Sync with Google Drive"}
            >
                {isSynced ? (
                    <CloudCheckIcon className="icon" />
                ) : (
                    <SyncIcon className={`icon ${isSyncing ? 'spinning' : ''}`} />
                )}
            </button>
        </div>
    );
};
