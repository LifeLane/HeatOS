import React, { createContext, useContext, useState } from 'react';
import { FortyGuardConnectionState } from '../types';

interface FortyGuardContextType {
  connection: FortyGuardConnectionState;
  reconnect: () => Promise<void>;
  updateEndpoint: (endpoint: string) => void;
  isSyncing: boolean;
}

const initialFortyGuardState: FortyGuardConnectionState = {
  providerName: 'FortyGuard Spatial Thermal Engine',
  engineVersion: 'v4.8.2-commercial',
  status: 'connected',
  meshStatus: 'active_mesh',
  activeNodes: 342,
  totalNodes: 350,
  latencyMs: 38,
  lastSyncTimestamp: '2026-08-19 23:09:14 UTC',
  meshDensity: '14.2 nodes / km²',
  dataThroughput: '4.8 MB/s',
  apiEndpoint: 'https://api.fortyguard.io/v4/spatial/mesh',
  connectedSince: '2026-08-01 00:00:00 UTC',
};

const FortyGuardContext = createContext<FortyGuardContextType | undefined>(undefined);

export const FortyGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<FortyGuardConnectionState>(initialFortyGuardState);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const reconnect = async () => {
    setIsSyncing(true);
    setConnection((prev) => ({ ...prev, status: 'syncing' }));
    
    // Simulate high-density mesh reconnect sequence
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setConnection((prev) => ({
      ...prev,
      status: 'connected',
      meshStatus: 'active_mesh',
      latencyMs: Math.floor(Math.random() * 15) + 32,
      lastSyncTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    }));
    setIsSyncing(false);
  };

  const updateEndpoint = (endpoint: string) => {
    setConnection((prev) => ({ ...prev, apiEndpoint: endpoint }));
  };

  return (
    <FortyGuardContext.Provider
      value={{
        connection,
        reconnect,
        updateEndpoint,
        isSyncing,
      }}
    >
      {children}
    </FortyGuardContext.Provider>
  );
};

export const useFortyGuard = () => {
  const context = useContext(FortyGuardContext);
  if (!context) {
    throw new Error('useFortyGuard must be used within a FortyGuardProvider');
  }
  return context;
};
