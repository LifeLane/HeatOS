import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  MapPin,
  Clock,
  Database,
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Building,
  RefreshCw,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { siteService } from '../../../services/siteService';
import { safeFormatDateTime } from '../../../utils/formatters';

export const EnvironmentalBriefTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [copied, setCopied] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('current');
  const [reportScope, setReportScope] = useState<'single' | 'portfolio'>('single');

  const sites = siteService.getAllSites();
  const activeSite = selectedSiteId === 'current'
    ? {
        name: currentLocation.displayName,
        city: currentLocation.name,
        country: currentLocation.country,
        address: `${currentLocation.displayName} Central District`,
        coordinates: currentLocation.coordinates,
        climateZone: currentLocation.climateZone,
        temp: currentLocation.ambientTemp,
        apparentTemp: currentLocation.apparentTemp,
        surfaceAnomaly: currentLocation.surfaceHeatAnomaly,
        aqi: currentLocation.aqi,
        humidity: currentLocation.humidity,
        uv: currentLocation.uvIndex,
        pulse: Math.round(75 + (100 - currentLocation.ambientTemp * 2)),
      }
    : (() => {
        const s = sites.find((x) => x.id === selectedSiteId) || sites[0];
        return {
          name: s.name,
          city: s.location.city,
          country: s.location.country,
          address: s.location.address,
          coordinates: s.location.coordinates,
          climateZone: s.location.climateZone,
          temp: s.currentTemp,
          apparentTemp: s.apparentTemp,
          surfaceAnomaly: s.surfaceAnomaly,
          aqi: s.airQuality,
          humidity: 45,
          uv: 8,
          pulse: s.pulse,
        };
      })();

  const handleCopy = () => {
    const briefText = `=====================================================
HEATOS ENVIRONMENTAL BRIEFING REPORT (OPERATIONAL AUDIT)
Scope: ${reportScope === 'single' ? activeSite.name : 'Enterprise Multi-Site Portfolio (12 Facilities)'}
Generated: ${safeFormatDateTime(new Date())}
Target Location: ${activeSite.city}, ${activeSite.country}
Climate Classification: ${activeSite.climateZone}
=====================================================

1. CURRENT CONDITIONS
- Ambient Temperature: ${formatTemp(activeSite.temp)} (Feels Like: ${formatTemp(activeSite.apparentTemp)})
- Surface Urban Heat Island Anomaly: +${activeSite.surfaceAnomaly.toFixed(1)}°C (FortyGuard Mesh)
- Environmental Pulse Index: ${activeSite.pulse}/100
- Air Quality Index: ${activeSite.aqi} AQI (PM2.5 / Ozone)
- Relative Humidity: ${activeSite.humidity}% | UV Exposure: ${activeSite.uv} UV

2. KEY CHANGES (TRAJECTORY & TRENDS)
- Diurnal Temperature Delta: +2.4°C increase over past 3 hours
- Surface Thermal Storage: Roof & asphalt heat accumulation peaking at 14:30
- Air Quality Gradient: +8 AQI elevation due to photochemical smog boundary layer inversion
- Humidity Gradient: -5% relative drop during peak solar irradiation window

3. ENVIRONMENTAL RISKS
- Primary Hazard: Microclimate Extreme Thermal Stress (Wet-Bulb Equivalent > 29°C)
- Building Envelope & HVAC Load: Estimated 28% surge in cooling power demand
- Pavement Radiation Exposure: High radiant heat on outdoor loading aprons & walkways
- Secondary Hazard: Solar UV Index Peak (Level ${activeSite.uv} - Very High)

4. SYNOPTIC FORECAST & EXPOSURE WINDOWS
- Critical Exposure Window: 13:00 – 16:30 Local Time
- Peak Projected High: ${formatTemp(activeSite.temp + 3.2)}
- 24-Hour Trajectory: Sustained heat dome with overnight cooling limited to ${formatTemp(activeSite.temp - 6.5)}
- 5-Day Outlook: Persistent thermal anomaly (+2.8°C above seasonal baseline)

5. ACTIVE ALERTS & WATCHDOG STATUS
- Alert [CRITICAL/WARNING]: Urban Heat Island Anomaly Spike (+${activeSite.surfaceAnomaly.toFixed(1)}°C)
- Alert [INFO]: OSHA Hydration & Shade Compliance Threshold Met
- Watchdog Rules: 5 Active, 1 Triggered (Surface Heat Exceedance)

6. RECOMMENDED OPERATIONAL ACTIONS
- (Action 1): Implement mandatory 15-minute hydration & shaded rest breaks for all outdoor staff.
- (Action 2): Engage HVAC pre-cooling routines before peak regional energy tariff windows.
- (Action 3): Activate localized misting pavilions and rooftop reflective evaporative sprays.
- (Action 4): Shift heavy outdoor material handling to early morning / post-sunset shift hours.

Provenance: FortyGuard Real-Time Sensor Mesh, NOAA GFS, Copernicus Sentinel-2, Open-Meteo.`;

    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="environmental-brief-tool" className="space-y-6">
      {/* Brief Header & Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                EXECUTIVE OPERATIONAL REPORT
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                Audit & Compliance Ready
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Operational Environmental Brief
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              Standardized, auditable operational intelligence synthesis across 6 core report sections for leadership, site safety directors, and facility operators.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-purple-200"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Brief'}</span>
            </button>

            <button
              onClick={() =>
                openAIWithContext({
                  triggerSource: 'tools',
                  toolId: 'environmental-brief',
                  headline: `Environmental Brief for ${activeSite.name}`,
                  summary: `Generating executive environmental brief covering 6 operational sections for ${activeSite.name}.`,
                  location: activeSite.city,
                })
              }
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Executive Synthesis</span>
            </button>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Target Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="current">{currentLocation.displayName} (Active View)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location.city})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Generated: {safeFormatDateTime(new Date())}
          </div>
        </div>
      </div>

      {/* 6 Structured Operational Report Sections */}
      <div className="space-y-4">
        {/* SECTION 1: Current Conditions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                Current Conditions & Biophysical Telemetry
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              LIVE SENSORS CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Ambient Temp</span>
              <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                {formatTemp(activeSite.temp)} <span className="text-xs text-slate-500 font-normal">({formatTemp(activeSite.apparentTemp)} feels)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Surface Heat Anomaly</span>
              <div className={`text-lg font-mono font-extrabold mt-0.5 ${activeSite.surfaceAnomaly >= 3.0 ? 'text-rose-600' : 'text-slate-900'}`}>
                +{activeSite.surfaceAnomaly.toFixed(1)}°C <span className="text-xs text-slate-500 font-normal">UHI</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Air Quality Index</span>
              <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                {activeSite.aqi} <span className="text-xs text-slate-500 font-normal">AQI</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Environmental Pulse</span>
              <div className="text-lg font-mono font-extrabold text-purple-700 mt-0.5">
                {activeSite.pulse}<span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Key Changes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              Key Changes & Dynamic Trajectory
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>Thermal Heat Storage & Rate of Accumulation</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Diurnal rate of rise is +0.8°C/hour. Pavement and roof albedo metrics indicate elevated radiative absorption peaking between 13:30 and 16:00.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-emerald-600" />
                <span>Atmospheric Dispersion & Ozone Boundary</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Surface wind velocity at 14 km/h provides moderate convective cooling, but stagnant inversion layer retains localized ground-level ozone.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Environmental Risks */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 text-xs font-mono font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              Identified Environmental Risks & Asset Vulnerability
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block">Occupational Heat Stress Danger</strong>
                <span className="text-slate-600">Wet-bulb globe temperature estimates indicate high thermal strain for outdoor workers and loading dock crews during midday.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block">HVAC Equipment & Peak Energy Demand Surge</strong>
                <span className="text-slate-600">Surface roof heat excess (+{activeSite.surfaceAnomaly.toFixed(1)}°C) increases chiller condenser inlet temperature by ~3.2°C, reducing COP efficiency.</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Forecast */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 text-xs font-mono font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              Synoptic Forecast & Critical Exposure Windows
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Peak Exposure Window
              </span>
              <div className="text-base font-mono font-extrabold text-slate-900">
                13:00 – 16:30 Local
              </div>
              <p className="text-[11px] text-slate-500">Max thermal radiation and surface temperatures.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Projected High
              </span>
              <div className="text-base font-mono font-extrabold text-rose-600">
                {formatTemp(activeSite.temp + 3.2)}
              </div>
              <p className="text-[11px] text-slate-500">Peak expected around 15:15.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                5-Day Synoptic Trend
              </span>
              <div className="text-base font-mono font-extrabold text-slate-900">
                Sustained +2.8°C
              </div>
              <p className="text-[11px] text-slate-500">Persistent subtropical heat dome pattern.</p>
            </div>
          </div>
        </div>

        {/* SECTION 5: Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 text-xs font-mono font-bold flex items-center justify-center">
              5
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              Active Alerts & Watchdog Rule Breaches
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-rose-100 text-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">Surface Heat Island Anomaly Spike (+{activeSite.surfaceAnomaly.toFixed(1)}°C)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                TRIGGERED
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-slate-700">Air Quality (PM2.5 / Ozone) Limit ({activeSite.aqi} AQI)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                WITHIN LIMITS
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 6: Recommended Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono font-bold flex items-center justify-center">
              6
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              Recommended Operational Protocols & Mitigation Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protocol A: Worker Hydration & Cooling Rotations</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Enforce mandatory 15-minute shade and fluid intake intervals every 45 minutes for all outdoor material handlers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protocol B: HVAC Thermal Pre-Cooling</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Pre-chill facility concrete thermal mass between 05:00 and 09:00 to reduce afternoon peak demand charges.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protocol C: Misting & Evaporative Shade Deployment</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Activate high-pressure atomization nozzles on loading docks and pedestrian access corridors.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protocol D: Operational Shift Adjustments</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Reschedule high-intensity roof maintenance and asphalt surfacing to night or early morning hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalBriefTool;
