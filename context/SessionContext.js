'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { fetchSession } from '@/utils/session';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadSession = async () => {
    const sessionUser = await fetchSession();
    setUser(sessionUser);
  };

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser, refreshSession: loadSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
