import React, { createContext, useContext, useState } from 'react';
import { NavigationTab, SpatialZone, EnvironmentalEvent, ToolCategory } from '../types';

interface NavigationContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeToolId: string | null;
  setActiveToolId: (toolId: string | null) => void;
  activeToolCategory: ToolCategory | null;
  setActiveToolCategory: (category: ToolCategory | null) => void;
  openTool: (toolId: string, category?: ToolCategory) => void;
  closeTool: () => void;
  selectedZone: SpatialZone | null;
  setSelectedZone: (zone: SpatialZone | null) => void;
  selectedEvent: EnvironmentalEvent | null;
  setSelectedEvent: (event: EnvironmentalEvent | null) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isFortyGuardModalOpen: boolean;
  setIsFortyGuardModalOpen: (open: boolean) => void;
  isFabricModalOpen: boolean;
  setIsFabricModalOpen: (open: boolean) => void;
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  isDemoTourOpen: boolean;
  setIsDemoTourOpen: (open: boolean) => void;
  accessibilitySettings: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavigationTab>('home');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeToolCategory, setActiveToolCategory] = useState<ToolCategory | null>(null);
  const [selectedZone, setSelectedZone] = useState<SpatialZone | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EnvironmentalEvent | null>(null);
  
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isFortyGuardModalOpen, setIsFortyGuardModalOpen] = useState<boolean>(false);
  const [isFabricModalOpen, setIsFabricModalOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const openTool = (toolId: string, category?: ToolCategory) => {
    setActiveToolId(toolId);
    if (category) {
      setActiveToolCategory(category);
    }
    setActiveTab('tools');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const closeTool = () => {
    setActiveToolId(null);
  };

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  });

  const toggleReducedMotion = () => {
    setAccessibilitySettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const toggleHighContrast = () => {
    setAccessibilitySettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleLargeText = () => {
    setAccessibilitySettings((prev) => ({ ...prev, largeText: !prev.largeText }));
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeToolId,
        setActiveToolId,
        activeToolCategory,
        setActiveToolCategory,
        openTool,
        closeTool,
        selectedZone,
        setSelectedZone,
        selectedEvent,
        setSelectedEvent,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isFortyGuardModalOpen,
        setIsFortyGuardModalOpen,
        isFabricModalOpen,
        setIsFabricModalOpen,
        isInspectorOpen,
        setIsInspectorOpen,
        isDemoTourOpen,
        setIsDemoTourOpen,
        accessibilitySettings,
        toggleReducedMotion,
        toggleHighContrast,
        toggleLargeText,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
