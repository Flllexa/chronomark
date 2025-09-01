
import React from 'react';
import type { TagWithCount } from '../types';
import { TagManagementItem } from './TagManagementItem';
import { BackIcon } from './icons';

interface TagManagementProps {
    tags: TagWithCount[];
    onRename: (oldName: string, newName: string) => Promise<void>;
    onDelete: (tagName: string) => Promise<void>;
    onBack: () => void;
}

export const TagManagement: React.FC<TagManagementProps> = ({ tags, onRename, onDelete, onBack }) => {
    return (
        <div className="settings-view animate-fade-in">
             <div className="tag-management-header">
                 <button onClick={onBack} className="back-btn" title="Back to settings">
                    <BackIcon className="icon" />
                 </button>
                <h2>Manage Tags</h2>
            </div>

            {tags.length === 0 ? (
                <p className="tag-management-empty">No tags to manage.</p>
            ) : (
                <div className="tag-management-list">
                    {tags.map(tag => (
                        <TagManagementItem 
                            key={tag.name}
                            tag={tag}
                            onRename={onRename}
                            onDelete={onDelete}
                            allTagNames={tags.map(t => t.name)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
