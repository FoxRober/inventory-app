"use client";

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationType } from '@/context/NotificationContext';
import './Toast.css';

interface ToastProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="toast-icon text-success" size={20} />,
    error: <AlertCircle className="toast-icon text-danger" size={20} />,
    info: <Info className="toast-icon text-info" size={20} />,
    warning: <AlertTriangle className="toast-icon text-warning" size={20} />,
  };

  return (
    <div className={`toast-item glass ${type}`}>
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
