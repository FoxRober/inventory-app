"use client";

import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
