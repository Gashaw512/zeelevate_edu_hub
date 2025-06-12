import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css'; // You'll create this CSS module next

const Modal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    const modalRef = useRef(null);

    // Trap focus inside the modal and close on Escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        const focusTrap = () => {
            if (modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                } else if (document.activeElement === firstElement && event.shiftKey) {
                    lastElement.focus();
                    event.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keydown', focusTrap); // For focus trapping
        if (modalRef.current) {
            modalRef.current.focus(); // Focus on modal container when it opens
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keydown', focusTrap);
        };
    }, [onCancel]);


    return (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex="-1">
            <div className={styles.modalContent} ref={modalRef}>
                <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>
                <p className={styles.modalMessage}>{message}</p>
                <div className={styles.modalActions}>
                    <button onClick={onCancel} className={styles.cancelButton}>
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className={styles.confirmButton}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
};

export default Modal;