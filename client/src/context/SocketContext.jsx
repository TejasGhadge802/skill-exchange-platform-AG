import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('skill_exchange_token') || currentUser.uid;
    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (import.meta.env.VITE_API_URL) {
        try {
          const url = new URL(import.meta.env.VITE_API_URL, window.location.origin);
          return url.origin;
        } catch {
          return import.meta.env.VITE_API_URL.replace(/\/api(\/v\d+)?\/?$/, '');
        }
      }
      return window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    };
    const socketUrl = getSocketUrl();

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

