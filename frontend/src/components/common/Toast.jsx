import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Toast.module.css'; // You'll create this CSS module next
import { CheckCircle, XCircle, Info } from 'lucide-react'; // Icons for different toast types

const Toast = ({ type, message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) {
                onClose();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'info':
            default:
                return <Info size={20} />;
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <div className={styles.toastIcon}>
                {getIcon()}
            </div>
            <p className={styles.toastMessage}>{message}</p>
            {/* Optional: Add a close button if you want users to dismiss manually */}
            {/* <button onClick={() => { setIsVisible(false); if(onClose) onClose(); }} className={styles.closeBtn}>X</button> */}
        </div>
    );
};

Toast.propTypes = {
    type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func, // Optional callback when toast closes
    duration: PropTypes.number, // How long the toast stays visible in ms
};

export default Toast;