import React, { createContext, useContext } from 'react';

// Mock implementation, a real implementation would involve state and effects.
const SessionContext = createContext({ isAdmin: true });

export const useSession = () => useContext(SessionContext);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const value = { isAdmin: true }; // For now, user is always admin
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};