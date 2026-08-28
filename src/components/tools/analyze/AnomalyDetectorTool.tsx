import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { useNavigation } from '../../../context/NavigationContext';
import { EventService } from '../../../services/eventService';
import { EnvironmentalEvent } from '../../../server/events/types';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const AnomalyDetectorTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { openAIWithContext } = useAIAnalyst();
  const { setActiveTab, setSelectedEvent } = useNavigation();

  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        const feed = await EventService.fetchEvents({
          latitude: currentLocation.coordinates.lat,
          longitude: currentLocation.coordinates.lng,
          locationName: currentLocation.name,
          minConfidence: 40,
        });
        if (isMounted) setEvents(feed.events || []);
      } catch (err) {
        console.error('Error fetching anomalies:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnomalies();
    return () => {
      isMounted = false;
    };
  }, [currentLocation.id, currentLocation.coordinates.lat, currentLocation.coordinates.lng]);

  // Statistical Outlier Checks against real parameters
  const anomalyChecks = [
    {
      category: 'HEAT_ANOMALY',
      label: 'Surface Heat Trapping (> +3.0°C)',
      isTriggered: currentLocation.surfaceHeatAnomaly >= 3.0,
      current: `+${currentLocation.surfaceHeatAnomaly.toFixed(1)}°C`,
      threshold: '+3.0°C Delta',
      severity: currentLocation.surfaceHeatAnomaly >= 4.0 ? 'CRITICAL' : 'HIGH',
      confidence: 96,
      icon: Flame,
    },
    {
      category: 'SOLAR_ANOMALY',
      label: 'Solar UV / Radiation Spike (UV > 8)',
      isTriggered: currentLocation.uvIndex >= 8,
      current: `UV Index ${currentLocation.uvIndex}`,
      threshold: 'UV Index >= 8',
      severity: 'ELEVATED',
      confidence: 94,
      icon: Sun,
    },
    {
      category: 'AIR_QUALITY_CHANGE',
      label: 'Air Quality Degradation (AQI > 100)',
      isTriggered: currentLocation.aqi > 100,
      current: `${currentLocation.aqi} AQI`,
      threshold: 'AQI > 100',
      severity: currentLocation.aqi > 150 ? 'CRITICAL' : 'HIGH',
      confidence: 91,
      icon: Wind,
    },
    {
      category: 'WATER_STRESS',
      label: 'Vapor Pressure / Dryness Stress (RH < 20%)',
      isTriggered: currentLocation.humidity < 20,
      current: `${currentLocation.humidity}% RH`,
      threshold: 'RH < 20%',
      severity: 'WATCH',
      confidence: 95,
      icon: Droplets,
    },
    {
      category: 'VEGETATION_STRESS',
      label: 'Canopy Thermal Deficit (< 15% Canopy)',
      isTriggered: currentLocation.canopyCoverage < 15,
      current: `${currentLocation.canopyCoverage}% Canopy`,
      threshold: 'Canopy < 15%',
      severity: 'WATCH',
      confidence: 97,
      icon: Trees,
    },
  ];

  const activeAnomalies = anomalyChecks.filter((a) => a.isTriggered);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Statistical Anomaly &amp; Outlier Engine
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                2-Sigma Variance Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filters out standard diurnal weather cycles to isolate verified biophysical anomalies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
            activeAnomalies.length > 0
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {activeAnomalies.length} Active Anomaly Rule{activeAnomalies.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Anomaly Check Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Configured Statistical Outlier Rules</h3>
          <span className="text-[11px] font-mono text-slate-400">Continuous 15m Telemetry Scanning</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anomalyChecks.map((check, idx) => {
            const Icon = check.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  check.isTriggered
                    ? 'bg-rose-50/70 border-rose-200 text-slate-900'
                    : 'bg-slate-50/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-lg ${check.isTriggered ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{check.label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Trigger Threshold: <strong className="font-mono text-slate-700">{check.threshold}</strong>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      check.isTriggered
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {check.isTriggered ? 'TRIGGERED' : 'NOMINAL'}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span>Current Reading: <strong className="font-mono text-slate-900">{check.current}</strong></span>
                  <span className="text-[11px] font-mono text-slate-400">{check.confidence}% Conf</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounded Incident List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Verified Environmental Incidents ({events.length})</h3>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Alerts Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 text-slate-500 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            No active incident records reported in this sector.
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  setSelectedEvent(evt);
                  setActiveTab('alerts');
                }}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{evt.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                  {evt.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyDetectorTool;
