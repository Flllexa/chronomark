
import React from 'react';
import { CloseIcon } from './icons';

interface TagProps {
    text: string;
    onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({ text, onRemove }) => {
    return (
        <span className="tag">
            {text}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                >
                    <CloseIcon className="icon" />
                </button>
            )}
        </span>
    );
};
