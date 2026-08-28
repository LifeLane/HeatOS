import React, { createContext, useContext, useState } from 'react';

export interface AIContextTrigger {
  question?: string;
  contextTitle?: string;
  sourceModule?: string;
  metadata?: Record<string, any>;
}

interface AIAnalystContextType {
  isAIDrawerOpen: boolean;
  setIsAIDrawerOpen: (open: boolean) => void;
  activeContext: AIContextTrigger | null;
  openAIWithContext: (trigger?: AIContextTrigger) => void;
  closeAIDrawer: () => void;
}

const AIAnalystContext = createContext<AIAnalystContextType | undefined>(undefined);

export const AIAnalystProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);
  const [activeContext, setActiveContext] = useState<AIContextTrigger | null>(null);

  const openAIWithContext = (trigger?: AIContextTrigger) => {
    setActiveContext(trigger || null);
    setIsAIDrawerOpen(true);
  };

  const closeAIDrawer = () => {
    setIsAIDrawerOpen(false);
  };

  return (
    <AIAnalystContext.Provider
      value={{
        isAIDrawerOpen,
        setIsAIDrawerOpen,
        activeContext,
        openAIWithContext,
        closeAIDrawer,
      }}
    >
      {children}
    </AIAnalystContext.Provider>
  );
};

export const useAIAnalyst = () => {
  const context = useContext(AIAnalystContext);
  if (!context) {
    throw new Error('useAIAnalyst must be used within an AIAnalystProvider');
  }
  return context;
};
