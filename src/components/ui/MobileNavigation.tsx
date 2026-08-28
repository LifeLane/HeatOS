import React from 'react';
import { LayoutDashboard, CloudSun, TrendingUp, Compass, Bell, Wrench } from 'lucide-react';
import { NavigationTab } from '../../types';
import { useNavigation } from '../../context/NavigationContext';

interface MobileNavItem {
  id: NavigationTab;
  aliases: string[];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { id: 'dashboard', aliases: ['dashboard', 'home'], label: 'Dash', icon: LayoutDashboard },
  { id: 'weather', aliases: ['weather'], label: 'Weather', icon: CloudSun },
  { id: 'forecast', aliases: ['forecast'], label: 'Forecast', icon: TrendingUp },
  { id: 'navigation', aliases: ['navigation', 'map'], label: 'Nav', icon: Compass },
  { id: 'alerts', aliases: ['alerts', 'events'], label: 'Alerts', icon: Bell, badge: 'LIVE' },
  { id: 'tools', aliases: ['tools'], label: 'Tools', icon: Wrench },
];

export const MobileNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-6 items-center justify-around h-14 px-1 max-w-lg mx-auto w-full">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.aliases.includes(activeTab);

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-all duration-150 cursor-pointer ${
                isActive ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute inset-x-1 top-1 bottom-1 bg-blue-50 rounded-lg -z-10 border border-blue-100/70" />
              )}

              <div className="relative">
                <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110 text-[#2563EB]' : 'text-slate-500'}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 ring-1 ring-white" />
                )}
              </div>
              <span className={`text-[9.5px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-[#2563EB]' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
