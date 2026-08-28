import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CloudSun,
  TrendingUp,
  Map,
  Bell,
  Activity,
  Sparkles,
  Flame,
  Wrench,
  ShieldCheck,
  Sliders,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Play
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { NavigationTab } from '../../types';

export interface NavDestination {
  id: NavigationTab;
  aliases: string[];
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  count?: string;
}

const NAV_GROUPS = [
  {
    label: 'OPERATE',
    items: [
      { id: 'dashboard', aliases: ['dashboard', 'home'], label: 'Dashboard', icon: LayoutDashboard },
      { id: 'weather', aliases: ['weather'], label: 'Weather', icon: CloudSun },
      { id: 'forecast', aliases: ['forecast'], label: 'Forecast', icon: TrendingUp },
      { id: 'navigation', aliases: ['map'], label: 'Living Map', icon: Map },
    ]
  },
  {
    label: 'MONITOR',
    items: [
      { id: 'alerts', aliases: ['alerts', 'events'], label: 'Alerts', icon: Bell },
      { id: 'monitor', aliases: ['monitor'], label: 'Monitors', icon: Activity },
      { id: 'pulse', aliases: ['pulse'], label: 'Environmental Pulse', icon: Flame },
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { id: 'ai', aliases: ['ai'], label: 'AI Analyst', icon: Sparkles },
    ]
  },
  {
    label: 'TOOLS',
    items: [
      { id: 'tools', aliases: ['tools'], label: 'Workbench', icon: Wrench },
    ]
  }
];

const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSettingsModalOpen, setIsDemoTourOpen } = useNavigation();
  const { openSubscriptionModal } = useSubscription();

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('heatos_sidebar_collapsed');
    if (stored === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('heatos_sidebar_collapsed', String(next));
      return next;
    });
  };

  const isTabActive = (item: any) => {
    return activeTab === item.id || item.aliases.includes(activeTab);
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200/80 shadow-xs z-30 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
              HeatOS
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Environmental OS
            </span>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="px-3">
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isTabActive(item);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => setActiveTab(item.id as NavigationTab)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-[#2563EB] font-semibold border border-blue-200/70 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 ${
                          active
                            ? 'text-[#2563EB] scale-105'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* DEMO section */}
        <div className="px-3">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              DEMO
            </div>
          )}
          <div className="space-y-1">
             <button
              id="sidebar-demo-tour-btn"
              type="button"
              onClick={() => setIsDemoTourOpen(true)}
              title={isCollapsed ? 'Commercial Demo' : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/70 transition-all duration-150 group cursor-pointer shadow-2xs`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Guided Tour</span>}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Configuration Area */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-2">
        {!isCollapsed && (
          <div
            onClick={() => openSubscriptionModal()}
            className="p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB]">
                  Enterprise
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
              <span>FortyGuard Mesh</span>
              <span className="font-mono font-bold text-emerald-700">LIVE</span>
            </div>
          </div>
        )}

        <button
          id="sidebar-settings-btn"
          type="button"
          onClick={() => setIsSettingsModalOpen(true)}
          title={isCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-400" />
            {!isCollapsed && <span>Settings</span>}
          </div>
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
