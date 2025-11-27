import React, { createContext, useState, useEffect } from 'react';
import { checkBackendConnectivity } from '../config/api';

export const ConnectionStatusContext = createContext({
  isConnected: false,
});

export const ConnectionStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const result = await checkBackendConnectivity();
        if (mounted) setIsConnected(!!result.success);
      } catch {
        if (mounted) setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000); // check every 5s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <ConnectionStatusContext.Provider value={{ isConnected }}>
      {children}
    </ConnectionStatusContext.Provider>
  );
};
