import React, { useState } from 'react';
import { MapPin, Settings, ChevronDown, Radio, Sparkles, Thermometer, Flame, RefreshCw } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useNavigation } from '../../context/NavigationContext';
import IconButton from './IconButton';
import DesktopNavigation from './DesktopNavigation';
import LiveStatusPill from '../common/LiveStatusPill';

export const Header: React.FC = () => {
  const {
    currentLocation,
    tempUnit,
    toggleTempUnit,
    isLive,
    toggleLive,
    lastTelemetryTime,
    connectionStatus,
    statusLabel,
    refreshEnvironmentalData,
    isLoadingEnvironmental,
  } = useLocation();
  const { connection } = useFortyGuard();
  const { setIsLocationModalOpen, setIsSettingsModalOpen } = useNavigation();
  const [isLivePopoverOpen, setIsLivePopoverOpen] = useState(false);

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-2.5">
        {/* Left Side: Brand Mark (Text Logo hidden as requested) + Location Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Sleek Brand Mark */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-blue-700 flex items-center justify-center shadow-2xs text-white">
            <Flame className="w-4 h-4 text-orange-300" />
          </div>

          {/* Location Trigger */}
          <button
            id="header-location-selector"
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer min-h-[34px]"
            aria-label={`Change current location from ${currentLocation.displayName}`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
            <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[180px]">
              {currentLocation.name}
              <span className="hidden sm:inline">, {currentLocation.country}</span>
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-xl">
          <DesktopNavigation />
        </div>

        {/* Right Side: LIVE Telemetry Status + Tools + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Unit Toggle (°C / °F) */}
          <button
            id="header-unit-toggle"
            type="button"
            onClick={toggleTempUnit}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer min-h-[34px]"
            title={`Switch to ${tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
            aria-label="Toggle Temperature Units"
          >
            <Thermometer className="w-3.5 h-3.5 text-slate-500" />
            <span>°{tempUnit}</span>
          </button>

          {/* Environmental Status Pill */}
          <div className="relative">
            <LiveStatusPill
              id="header-live-badge"
              status={connectionStatus}
              statusLabel={statusLabel}
              lastUpdated={lastTelemetryTime}
              onClick={() => setIsLivePopoverOpen(!isLivePopoverOpen)}
            />

            {/* LIVE Telemetry Details Popover */}
            {isLivePopoverOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95"
                role="region"
                aria-label="Live Telemetry Information"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Environmental State</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                    {statusLabel}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Source Engine:</span>
                    <span className="font-semibold text-slate-800">FortyGuard Spatial Mesh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Nodes:</span>
                    <span className="font-mono font-bold text-slate-800">{currentLocation.activeSensors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Telemetry:</span>
                    <span className="font-mono text-slate-700">{lastTelemetryTime}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      refreshEnvironmentalData(true);
                      setIsLivePopoverOpen(false);
                    }}
                    className="flex-1 py-1.5 text-center text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingEnvironmental ? 'animate-spin' : ''}`} />
                    Refresh Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleLive();
                      setIsLivePopoverOpen(false);
                    }}
                    className="py-1.5 px-2.5 text-center text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {isLive ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Refresh Button */}
          <button
            id="header-refresh-btn"
            type="button"
            onClick={() => refreshEnvironmentalData(true)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Refresh Environmental Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEnvironmental ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>

          {/* Settings Button */}
          <IconButton
            id="header-settings-btn"
            icon={<Settings className="w-3.5 h-3.5" />}
            aria-label="Application Settings and System Configuration"
            size="sm"
            variant="outline"
            onClick={() => setIsSettingsModalOpen(true)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
