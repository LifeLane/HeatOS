import React from 'react';
import { LayoutDashboard, CloudSun, TrendingUp, Compass, Bell, Wrench } from 'lucide-react';
import { NavigationTab } from '../../types';
import { useNavigation } from '../../context/NavigationContext';

interface NavItemConfig {
  id: NavigationTab;
  aliases: string[];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', aliases: ['dashboard', 'home'], label: 'Dashboard', icon: LayoutDashboard },
  { id: 'weather', aliases: ['weather'], label: 'Weather', icon: CloudSun },
  { id: 'forecast', aliases: ['forecast'], label: 'Forecast', icon: TrendingUp },
  { id: 'navigation', aliases: ['navigation', 'map'], label: 'Navigation', icon: Compass },
  { id: 'alerts', aliases: ['alerts', 'events'], label: 'Alerts', icon: Bell, badge: 'LIVE' },
  { id: 'tools', aliases: ['tools'], label: 'Tools', icon: Wrench },
];

export const DesktopNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();

  return (
    <nav
      id="desktop-navigation"
      aria-label="Main Navigation"
      className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-2xs"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.aliases.includes(activeTab);

        return (
          <button
            key={item.id}
            id={`desktop-nav-${item.id}`}
            type="button"
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer min-h-[34px] ${
              isActive
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span>{item.label}</span>

            {item.badge && (
              <span
                className={`text-[9px] font-bold px-1.2 py-0.2 rounded uppercase tracking-wider ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation;
