import React from 'react';
import DesktopSidebar from '../common/DesktopSidebar';
import AppHeader from '../common/AppHeader';
import MobileBottomNav from '../common/MobileBottomNav';
import { useNavigation } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { DataProvenanceModal } from '../common/DataProvenanceModal';

interface AppShellProps {
  children: React.ReactNode;
  moduleTitle?: string;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  moduleTitle,
  className = '',
}) => {
  const { accessibilitySettings } = useNavigation();
  const { activeProvenanceMetric, closeProvenanceModal, getMetricProvenance } = useLocation();

  const activeProvenance = activeProvenanceMetric
    ? getMetricProvenance(activeProvenanceMetric.key)
    : null;

  return (
    <div
      id="heatos-root-shell"
      className={`min-h-screen flex bg-[#FBFBFA] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden ${
        accessibilitySettings?.highContrast ? 'contrast-125' : ''
      } ${className}`}
    >
      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-6">
        {/* Compact Sticky Header */}
        <AppHeader moduleTitle={moduleTitle} />

        {/* Main Content Area */}
        <main
          id="heatos-main-content"
          className="flex-1 p-3 sm:p-5 max-w-7xl mx-auto w-full overflow-x-hidden"
          role="main"
        >
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Global Data Provenance Inspection Modal */}
      {activeProvenanceMetric && (
        <DataProvenanceModal
          isOpen={Boolean(activeProvenanceMetric)}
          onClose={closeProvenanceModal}
          provenance={activeProvenance}
          metricValue={activeProvenanceMetric.formattedValue}
        />
      )}
    </div>
  );
};

export default AppShell;
