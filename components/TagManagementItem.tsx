
import React, { useState, useRef, useEffect } from 'react';
import type { TagWithCount } from '../types';
import { EditIcon, DeleteIcon, SaveIcon, CloseIcon } from './icons';
import { useModal } from '../hooks/useModal';
import { Modal } from './Modal';

interface TagManagementItemProps {
    tag: TagWithCount;
    onRename: (oldName: string, newName: string) => Promise<void>;
    onDelete: (tagName: string) => Promise<void>;
    allTagNames: string[];
}

export const TagManagementItem: React.FC<TagManagementItemProps> = ({ tag, onRename, onDelete, allTagNames }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tagName, setTagName] = useState(tag.name);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { modalState, closeModal, showConfirm } = useModal();

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleSave = async () => {
        const newName = tagName.trim();
        if (!newName || newName === tag.name) {
            setIsEditing(false);
            setTagName(tag.name);
            return;
        }

        const isMerging = allTagNames.some(t => t.toLowerCase() === newName.toLowerCase() && t.toLowerCase() !== tag.name.toLowerCase());
        if (isMerging) {
            const confirmed = await showConfirm(
                `The tag "${newName}" already exists. Do you want to merge "${tag.name}" into it? This will update all affected bookmarks.`,
                'Merge Tags',
                'warning'
            );
            if (!confirmed) {
                return;
            }
        }
        
        setIsSaving(true);
        await onRename(tag.name, newName);
        setIsSaving(false);
        setIsEditing(false);
    };
    
    const handleDelete = async () => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete the tag "${tag.name}" from all bookmarks? This cannot be undone.`,
            'Delete Tag',
            'error'
        );
        
        if (confirmed) {
            setIsDeleting(true);
            try {
                await onDelete(tag.name);
                // On success, this component will be unmounted by the parent.
                // The 'finally' block handles cases where the unmount doesn't happen, preventing a stuck UI.
            } catch (error) {
                console.error(`Failed to delete tag '${tag.name}':`, error);
            } finally {
                // This ensures the button is always re-enabled, even if the parent component fails to update for some reason.
                // Setting state on an unmounted component is a safe no-op in modern React.
                setIsDeleting(false);
            }
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        setTagName(tag.name);
    }
    
    return (
        <>
            <div className="tag-management-item">
                <div className="tag-management-item-content">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            disabled={isSaving}
                        />
                    ) : (
                        <>
                            <p className="tag-name">{tag.name}</p>
                            <p className="tag-count">{tag.count} bookmark{tag.count !== 1 ? 's' : ''}</p>
                        </>
                    )}
                </div>
                
                <div className="tag-management-item-actions">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleSave} 
                                className="save-btn" 
                                title="Save" 
                                disabled={isSaving || !tagName.trim()}
                                onMouseDown={e => e.preventDefault()}
                            >
                                <SaveIcon className="icon" />
                            </button>
                             <button 
                                onClick={handleCancel} 
                                className="cancel-btn" 
                                title="Cancel"
                                onMouseDown={e => e.preventDefault()}
                            >
                                <CloseIcon className="icon" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} disabled={isDeleting} className="edit-btn" title="Rename tag">
                                <EditIcon className="icon" />
                            </button>
                            <button onClick={handleDelete} disabled={isDeleting} className="delete-btn" title="Delete tag">
                                <DeleteIcon className="icon" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                onConfirm={modalState.onConfirm}
                onCancel={modalState.onCancel}
                showCancel={modalState.showCancel}
            />
        </>
    );
};
