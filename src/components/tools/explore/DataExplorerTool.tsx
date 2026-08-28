import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  Play,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';
import { DiagnosticSuiteReport } from '../../../services/environmentalDataService';

interface DataVariable {
  id: string;
  name: string;
  dimension: string;
  value: string;
  unit: string;
  source: string;
  confidence: number;
  freshness: string;
  tier: 'L1 RAW' | 'L2 CALIBRATED' | 'L3 DERIVED' | 'L4 MODEL';
}

export const DataExplorerTool: React.FC = () => {
  const {
    currentLocation,
    formatTemp,
    tempUnit,
    lastTelemetryTime,
    normalizedState,
    inspectProvenance,
    runDiagnostics,
    diagnosticReport,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDimension, setSelectedDimension] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'catalog' | 'diagnostics'>('catalog');
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [localDiagReport, setLocalDiagReport] = useState<DiagnosticSuiteReport | null>(diagnosticReport);

  const handleRunDiagnostics = async () => {
    setIsRunningDiag(true);
    try {
      const rep = await runDiagnostics();
      setLocalDiagReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningDiag(false);
    }
  };

  const variables: DataVariable[] = [
    {
      id: 'temperature',
      name: 'Ambient Surface-Air Temperature (T2M)',
      dimension: 'Heat',
      value: `${currentLocation.ambientTemp.toFixed(1)}`,
      unit: '°C',
      source: 'FortyGuard Thermal Spline',
      confidence: 98,
      freshness: '1m sync',
      tier: 'L2 CALIBRATED',
    },
    {
      id: 'surfaceHeatAnomaly',
      name: 'Urban Heat Island Surface Anomaly (ΔT)',
      dimension: 'Heat',
      value: `+${currentLocation.surfaceHeatAnomaly.toFixed(1)}`,
      unit: '°C',
      source: 'FortyGuard Microclimate Mesh',
      confidence: 96,
      freshness: '1m sync',
      tier: 'L3 DERIVED',
    },
    {
      id: 'heatIndex',
      name: 'Apparent Heat Index (HI)',
      dimension: 'Heat',
      value: `${currentLocation.apparentTemp.toFixed(1)}`,
      unit: '°C',
      source: 'NOAA Rothfusz Regression',
      confidence: 95,
      freshness: '15m sync',
      tier: 'L3 DERIVED',
    },
    {
      id: 'wetBulb',
      name: 'Psychrometric Wet-Bulb Temperature (Tw)',
      dimension: 'Heat',
      value: `${(normalizedState?.currentConditions.wetBulb.value ?? 18.4).toFixed(1)}`,
      unit: '°C',
      source: 'Stull (2011) Formulation',
      confidence: 94,
      freshness: '15m sync',
      tier: 'L3 DERIVED',
    },
    {
      id: 'airQuality',
      name: 'Air Quality Index (US AQI)',
      dimension: 'Air',
      value: `${currentLocation.aqi}`,
      unit: 'AQI',
      source: 'Open-Meteo & EPA AirNow',
      confidence: 93,
      freshness: '30m sync',
      tier: 'L2 CALIBRATED',
    },
    {
      id: 'humidity',
      name: 'Relative Surface Humidity (RH)',
      dimension: 'Water',
      value: `${currentLocation.humidity}`,
      unit: '%',
      source: 'NOAA GFS Surface Stations',
      confidence: 94,
      freshness: '15m sync',
      tier: 'L1 RAW',
    },
    {
      id: 'dewPoint',
      name: 'Surface Dew Point Temperature (Td)',
      dimension: 'Water',
      value: `${(normalizedState?.currentConditions.dewPoint.value ?? 15.2).toFixed(1)}`,
      unit: '°C',
      source: 'Magnus-Tetens Equation',
      confidence: 95,
      freshness: '15m sync',
      tier: 'L3 DERIVED',
    },
    {
      id: 'wind',
      name: 'Surface Wind Speed & Gusts (10m)',
      dimension: 'Wind',
      value: `${normalizedState?.currentConditions.wind.value.speedKmh ?? 14}`,
      unit: 'km/h',
      source: 'NOAA NWS Synoptic Surface',
      confidence: 95,
      freshness: '15m sync',
      tier: 'L1 RAW',
    },
    {
      id: 'solar',
      name: 'Solar Global Horizontal Irradiance (GHI)',
      dimension: 'Solar',
      value: `${currentLocation.solarIrradiance}`,
      unit: 'W/m²',
      source: 'Copernicus Atmospheric CAMS',
      confidence: 96,
      freshness: '15m sync',
      tier: 'L2 CALIBRATED',
    },
    {
      id: 'uvIndex',
      name: 'Ultraviolet Solar Radiation Index (UV)',
      dimension: 'Solar',
      value: `${currentLocation.uvIndex}`,
      unit: 'UV',
      source: 'NOAA Solar Forecast Grid',
      confidence: 95,
      freshness: '15m sync',
      tier: 'L2 CALIBRATED',
    },
    {
      id: 'canopy',
      name: 'Urban Tree Canopy Buffer Percentage',
      dimension: 'Nature',
      value: `${currentLocation.canopyCoverage}`,
      unit: '%',
      source: 'ESA Sentinel-2 Multispectral',
      confidence: 92,
      freshness: 'Static/Seasonal',
      tier: 'L3 DERIVED',
    },
  ];

  const filteredVariables = variables.filter((v) => {
    const matchesDimension = selectedDimension === 'ALL' || v.dimension === selectedDimension;
    const matchesSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dimension.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDimension && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            HeatOS Normalized Environmental Architecture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized data catalog, multi-tier caching, provenance records, and live resilience diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Catalog
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Resilience Tests</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <>
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search variables by metric name, source, or dimension..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Heat', 'Air', 'Water', 'Wind', 'Solar', 'Nature'].map((dim) => (
                <button
                  key={dim}
                  onClick={() => setSelectedDimension(dim)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDimension === dim
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dim}
                </button>
              ))}
            </div>
          </div>

          {/* Variables Table / Cards */}
          <div className="space-y-2.5">
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                onClick={() => inspectProvenance(variable.id, `${variable.value} ${variable.unit}`)}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {variable.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {variable.tier}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>Source: <span className="font-semibold text-slate-700">{variable.source}</span></span>
                    <span>•</span>
                    <span>Cadence: {variable.freshness}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{variable.confidence}% Confidence</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-slate-900">
                      {variable.value}
                    </span>
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      {variable.unit}
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold group-hover:underline">
                    Provenance →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'diagnostics' && (
        <div className="space-y-5">
          {/* Diagnostics Control Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold tracking-tight">
                  Data Architecture Resilience Diagnostic Engine
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Executes 7 strict integration test suites validating timeouts, exponential backoff, caching, location isolation, and fallback telemetry.
              </p>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiag}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isRunningDiag ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Test Matrix...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run 7 Diagnostic Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results Matrix */}
          {localDiagReport ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">
                    Diagnostic Matrix Status: {localDiagReport.passed ? 'ALL PASSED (7/7)' : 'DEGRADED'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700">
                  Executed at {new Date(localDiagReport.executedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {localDiagReport.tests.map((test, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{test.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          test.passed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {test.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{test.description}</p>
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {test.observedOutcome}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Database className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                No diagnostic test suite run yet for the active session.
              </p>
              <button
                onClick={handleRunDiagnostics}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Click here to run the 7 resilience test scenarios
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataExplorerTool;
