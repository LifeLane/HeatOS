import React from 'react';
import { LocationProvider } from './context/LocationContext';
import { FortyGuardProvider } from './context/FortyGuardContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { MonitoringProvider } from './context/MonitoringContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AIAnalystProvider } from './context/AIAnalystContext';
import { ExplanationProvider } from './context/ExplanationContext';

import AppHeader from './components/common/AppHeader';
import DesktopSidebar from './components/common/DesktopSidebar';
import MobileBottomNav from './components/common/MobileBottomNav';
import MetricExplanation from './components/common/MetricExplanation';

import DashboardView from './components/views/DashboardView';
import WeatherView from './components/views/WeatherView';
import ForecastView from './components/views/ForecastView';
import MapView from './components/views/MapView';
import AlertsView from './components/views/AlertsView';
import PulseView from './components/views/PulseView';
import SettingsView from './components/views/SettingsView';
import { MonitoringView } from './components/views/MonitoringView';
import InsightsView from './components/views/InsightsView';
import ToolsView from './components/views/ToolsView';

import ZoneInspectorDrawer from './components/common/ZoneInspectorDrawer';
import LocationModal from './components/modals/LocationModal';
import FortyGuardModal from './components/modals/FortyGuardModal';
import ProfileSettingsModal from './components/modals/ProfileSettingsModal';
import { OpenDataFabricModal } from './components/modals/OpenDataFabricModal';
import { AlertDetailModal } from './components/modals/AlertDetailModal';
import { EnvironmentalBriefModal } from './components/modals/EnvironmentalBriefModal';
import { SubscriptionModal } from './components/modals/SubscriptionModal';
import { ContextualAIAnalystDrawer } from './components/modals/ContextualAIAnalystDrawer';
import { CommercialDemoTour } from './components/common/CommercialDemoTour';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isFabricModalOpen,
    setIsFabricModalOpen,
    isDemoTourOpen,
    setIsDemoTourOpen,
  } = useNavigation();

  // Scroll to top immediately whenever active module / tab changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex bg-[#FBFBFA] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden w-full min-w-0">
      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-8 overflow-x-hidden">
        {/* Compact Sticky Header */}
        <AppHeader />

        {/* Dynamic Route Router */}
        <main className="flex-1 p-2.5 xs:p-3 sm:p-5 md:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
          {(activeTab === 'dashboard' || activeTab === 'home') && <DashboardView />}
          {activeTab === 'weather' && <WeatherView />}
          {activeTab === 'forecast' && <ForecastView />}
          {(activeTab === 'navigation' || activeTab === 'map') && <MapView />}
          {(activeTab === 'alerts' || activeTab === 'events') && <AlertsView />}
          {activeTab === 'pulse' && <PulseView />}
          {activeTab === 'monitor' && <MonitoringView />}
          {activeTab === 'ai' && <InsightsView />}
          {activeTab === 'tools' && <ToolsView />}
          {(activeTab === 'settings' || activeTab === 'more') && <SettingsView />}
        </main>

        {/* Mobile Sticky Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Global Modals, Drawers & Assistants */}
      <MetricExplanation />
      <SubscriptionModal />
      <CommercialDemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
      />
      <ContextualAIAnalystDrawer />
      <ZoneInspectorDrawer />
      <LocationModal />
      <FortyGuardModal />
      <ProfileSettingsModal />
      <AlertDetailModal />
      <EnvironmentalBriefModal />
      
      <OpenDataFabricModal
        isOpen={isFabricModalOpen}
        onClose={() => setIsFabricModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LocationProvider>
      <FortyGuardProvider>
        <NavigationProvider>
          <MonitoringProvider>
            <SubscriptionProvider>
              <AIAnalystProvider>
                <ExplanationProvider>
                  <MainContent />
                </ExplanationProvider>
              </AIAnalystProvider>
            </SubscriptionProvider>
          </MonitoringProvider>
        </NavigationProvider>
      </FortyGuardProvider>
    </LocationProvider>
  );
}
