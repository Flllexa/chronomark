
import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
    const handleToggle = () => {
        onChange(!checked);
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={handleToggle}
            className={`toggle-switch ${ checked ? 'checked' : 'unchecked' }`}
        >
            <span
                aria-hidden="true"
                className="toggle-switch-handle"
            />
        </button>
    );
};
