import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Thermometer,
  Layers,
  MoreVertical,
  Flame,
  Menu,
  Sliders
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import LiveStatusPill from './LiveStatusPill';

const AppHeader: React.FC = () => {
  const {
    currentLocation,
    tempUnit,
    toggleTempUnit,
    formatTemp,
    connectionStatus,
    statusLabel,
    lastTelemetryTime,
    isLoadingEnvironmental,
    refreshEnvironmentalData,
  } = useLocation();

  const { setIsDemoTourOpen, setIsFabricModalOpen, setIsLocationModalOpen, setIsSettingsModalOpen } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openAIWithContext } = useAIAnalyst();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsMobileMenuOpen]);

  const handleRefresh = async () => {
    await refreshEnvironmentalData();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-14 flex items-center px-4">
      <div className="flex-1 flex items-center justify-between min-w-0">
        
        {/* Mobile Logo / Brand */}
        <div className="md:hidden flex items-center gap-2 mr-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
            HeatOS
          </span>
        </div>

        {/* Desktop Title / Context */}
        <div className="hidden md:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">ENVIRONMENTAL INTELLIGENCE</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <LiveStatusPill
              status={connectionStatus}
              statusLabel={statusLabel}
              lastUpdated={lastTelemetryTime}
              onClick={handleRefresh}
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center justify-end gap-2 flex-1 sm:flex-none min-w-0">
          {/* Location Selector */}
          <button
            id="header-location-selector"
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs group"
            title="Change Location"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0 group-hover:scale-105 transition-transform" />
            <span className="max-w-[100px] sm:max-w-[150px] truncate">
              {currentLocation.displayName || currentLocation.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
          </button>

          {/* Quick Refresh Button */}
          <button
            id="header-refresh-btn"
            type="button"
            onClick={handleRefresh}
            className="hidden xs:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-all cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingEnvironmental ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>

          {/* Ask AI Contextual */}
          <button
            id="header-ask-ai-btn"
            type="button"
            onClick={() =>
              openAIWithContext(
                `Analyze current environmental telemetry in ${currentLocation.name}: Ambient ${formatTemp(
                  currentLocation.ambientTemp
                )}, Surface Anomaly +${currentLocation.surfaceHeatAnomaly.toFixed(
                  1
                )}°C, AQI ${currentLocation.aqi}. Status: ${statusLabel}.`
              )
            }
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Ask HeatOS AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>ASK HEATOS</span>
          </button>

          {/* Temperature Toggle */}
          <button
            id="header-temp-toggle-btn"
            type="button"
            onClick={toggleTempUnit}
            className="hidden sm:flex px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-mono text-xs font-bold transition-colors cursor-pointer"
            title={`Switch to °${tempUnit === 'C' ? 'F' : 'C'}`}
          >
            °{tempUnit}
          </button>

          {/* Quick Settings Button */}
          <button
            id="header-settings-btn"
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs group"
            title="System Settings"
          >
            <Sliders className="w-3.5 h-3.5 text-[#2563EB] group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Mobile Menu */}
          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button
              id="header-mobile-menu-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-blue-700 bg-blue-50/60 hover:bg-blue-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>System Settings</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleRefresh();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoadingEnvironmental ? 'animate-spin' : ''}`} />
                  <span>Refresh Telemetry</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsDemoTourOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo Tour</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAIWithContext(
                      `Analyze current environmental telemetry in ${currentLocation.name}: Ambient ${formatTemp(
                        currentLocation.ambientTemp
                      )}, Surface Anomaly +${currentLocation.surfaceHeatAnomaly.toFixed(
                        1
                      )}°C, AQI ${currentLocation.aqi}. Status: ${statusLabel}.`
                    );
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Ask AI Analyst</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsFabricModalOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Data Sources</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    toggleTempUnit();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unit Mode</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">°{tempUnit}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
