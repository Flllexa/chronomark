
export interface Bookmark {
    id: string;
    url: string;
    title: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

export interface CurrentTab {
    url: string;
    title: string;
}

export type SyncStatusState = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncStatus {
    status: SyncStatusState;
    message?: string;
    lastSync?: number | null;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Settings {
    autoSync: boolean;
    theme: ThemeMode;
}

export type ImportStatusState = 'idle' | 'scanning' | 'importing' | 'success' | 'error';

export interface ImportStatus {
    status: ImportStatusState;
    message?: string;
    progress?: {
        current: number;
        total: number;
    };
}

export interface TagWithCount {
    name: string;
    count: number;
}

export interface BookmarkStats {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    totalTags: number;
}