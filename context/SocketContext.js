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
    const s = io(url, { path: '/socket-io', transports: ['websocket'] });
    setSocket(s);
    s.on('connect_error', () => {
      // retry silently; socket.io has built-in backoff
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


