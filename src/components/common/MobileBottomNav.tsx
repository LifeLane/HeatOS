import React from 'react';
import {
  LayoutDashboard,
  CloudSun,
  TrendingUp,
  Compass,
  Bell,
  Wrench,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { NavigationTab } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();

  // Exactly 6 primary destinations for mobile bottom nav as specified
  const navItems: {
    id: NavigationTab;
    aliases: string[];
    label: string;
    icon: React.FC<{ className?: string }>;
    badgeDot?: boolean;
  }[] = [
    {
      id: 'dashboard',
      aliases: ['dashboard', 'home'],
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'weather',
      aliases: ['weather'],
      label: 'Right Now',
      icon: CloudSun,
    },
    {
      id: 'forecast',
      aliases: ['forecast'],
      label: 'Forecast',
      icon: TrendingUp,
    },
    {
      id: 'navigation',
      aliases: ['navigation', 'map'],
      label: 'Map',
      icon: Compass,
    },
    {
      id: 'alerts',
      aliases: ['alerts', 'events'],
      label: 'Events',
      icon: Bell,
      badgeDot: true,
    },
    {
      id: 'tools',
      aliases: ['tools'],
      label: 'Workbench',
      icon: Wrench,
    },
  ];

  const isTabActive = (item: typeof navItems[0]) => {
    return item.aliases.includes(activeTab);
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-6 items-center justify-around h-14 px-0.5 sm:px-1 max-w-md mx-auto w-full">
        {navItems.map((item) => {
          const active = isTabActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center h-full min-w-0 min-h-[44px] py-1 px-0.5 transition-all duration-150 cursor-pointer select-none group ${
                active ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute inset-x-0.5 top-1 bottom-1 bg-blue-50/90 rounded-lg -z-10 transition-all duration-200 border border-blue-100/70 shadow-2xs" />
              )}

              {/* Icon with gentle animated scale & active dot */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-4 h-4 xs:w-4.5 xs:h-4.5 transition-transform duration-200 ${
                    active ? 'scale-110 text-[#2563EB]' : 'scale-100 text-slate-500 group-hover:scale-105'
                  }`}
                />
                {item.badgeDot && !active && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 ring-1 ring-white" />
                )}
              </div>

              {/* Label: Ultra-compact, non-wrapping font with controlled sizing */}
              <span
                className={`text-[8.5px] xs:text-[9.5px] leading-tight tracking-tight mt-0.5 whitespace-nowrap transition-all duration-150 ${
                  active ? 'font-black text-[#2563EB]' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
