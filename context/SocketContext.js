'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const connecting = useRef(false);

  useEffect(() => {
    if (socket || connecting.current) return;
    connecting.current = true;

    const url = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || 3000}` : '';
    const s = io(url, { 
      path: '/socket-io', 
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });
    
    setSocket(s);
    
    s.on('connect', () => {
      console.log('Socket connected');
    });
    
    s.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      // Fallback to polling if websocket fails
      if (s.io.opts.transports.includes('websocket')) {
        s.io.opts.transports = ['polling'];
      }
    });
    
    return () => {
      s.disconnect();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}


