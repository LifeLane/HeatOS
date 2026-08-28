import React from 'react';
import {
  Layers,
  Map,
  Activity,
  Bell,
  Sparkles,
  Sliders,
  Home,
  Bookmark,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { NavigationTab } from '../../types';

export const NavigationBar: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Living Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'monitor', label: 'My Places', icon: <Bookmark className="w-4 h-4 text-emerald-500" />, badge: 'MONITOR' },
    { id: 'map', label: 'Spatial Map', icon: <Map className="w-4 h-4" /> },
    { id: 'pulse', label: 'Telemetry Pulse', icon: <Activity className="w-4 h-4" />, badge: 'LIVE' },
    { id: 'events', label: 'Incidents & Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Interventions', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'more', label: 'Settings & Mesh', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Global Navigation Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default NavigationBar;
