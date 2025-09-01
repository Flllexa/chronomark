import { useState, useCallback } from 'react';

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel: boolean;
}

export const useModal = () => {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: true
    });

    const closeModal = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showAlert = useCallback((message: string, title: string = 'Information', type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
        return new Promise<void>((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type,
                confirmText: 'OK',
                cancelText: 'Cancel',
                showCancel: false,
                onConfirm: () => resolve(),
                onCancel: () => resolve()
            });
        });
    }, []);

    const showConfirm = useCallback((message: string, title: string = 'Confirmation', type: 'warning' | 'error' = 'warning') => {
        return new Promise<boolean>((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type,
                confirmText: 'Yes',
                cancelText: 'No',
                showCancel: true,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }, []);

    const showCustomModal = useCallback((
        title: string,
        message: string,
        options: {
            type?: 'info' | 'warning' | 'error' | 'success';
            confirmText?: string;
            cancelText?: string;
            showCancel?: boolean;
            onConfirm?: () => void;
            onCancel?: () => void;
        } = {}
    ) => {
        setModalState({
            isOpen: true,
            title,
            message,
            type: options.type || 'info',
            confirmText: options.confirmText || 'OK',
            cancelText: options.cancelText || 'Cancel',
            showCancel: options.showCancel !== false,
            onConfirm: options.onConfirm,
            onCancel: options.onCancel
        });
    }, []);

    return {
        modalState,
        closeModal,
        showAlert,
        showConfirm,
        showCustomModal
    };
};
