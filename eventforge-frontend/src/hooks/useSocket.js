import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const pushNotification = useNotificationStore((s) => s.push);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('notification', (n) => {
      pushNotification(n);
      toast(n.text, { icon: '🔔' });
    });

    return () => socket.disconnect();
  }, [isAuthenticated, token, pushNotification]);

  return socketRef;
};
