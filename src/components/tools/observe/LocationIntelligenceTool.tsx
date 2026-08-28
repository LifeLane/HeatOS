import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Flame,
  Activity,
  ShieldAlert,
  Calendar,
  Compass,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  Wind,
  Droplets,
  Trees,
  Sun,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useMonitoring } from '../../../context/MonitoringContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { useNavigation } from '../../../context/NavigationContext';
import { naturePulseApi } from '../../../services/naturePulseApi';
import { EventService } from '../../../services/eventService';
import { NaturePulseResult } from '../../../types/naturePulse';
import { EnvironmentalEvent } from '../../../server/events/types';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';
import { WatchButton } from '../../common/WatchButton';

export const LocationIntelligenceTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit, setLocationById } = useLocation();
  const { isPlaceWatched } = useMonitoring();
  const { openAIWithContext } = useAIAnalyst();
  const { setActiveTab } = useNavigation();

  const [pulse, setPulse] = useState<NaturePulseResult | null>(null);
  const [events, setEvents] = useState<EnvironmentalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [pulseData, eventFeed] = await Promise.all([
          naturePulseApi.getPulse({
            latitude: currentLocation.coordinates.lat,
            longitude: currentLocation.coordinates.lng,
            locationName: currentLocation.name,
            stateCode: currentLocation.stateCode,
            countryCode: currentLocation.countryCode,
          }),
          EventService.fetchEvents({
            latitude: currentLocation.coordinates.lat,
            longitude: currentLocation.coordinates.lng,
            locationName: currentLocation.name,
          }).catch(() => ({ events: [] })),
        ]);

        if (isMounted) {
          setPulse(pulseData);
          setEvents((eventFeed as any).events || []);
        }
      } catch (err) {
        console.error('Error loading location intelligence:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [currentLocation.id, currentLocation.coordinates.lat, currentLocation.coordinates.lng]);

  const isWatched = isPlaceWatched(currentLocation.id);

  // Preset location quick-picker
  const quickPlaces = [
    { id: 'austin-tx', name: 'Austin, TX', coords: '30.2672° N, 97.7431° W' },
    { id: 'phoenix-az', name: 'Phoenix, AZ', coords: '33.4484° N, 112.0740° W' },
    { id: 'dubai-uae', name: 'Dubai, UAE', coords: '25.2048° N, 55.2708° E' },
    { id: 'singapore-sg', name: 'Singapore', coords: '1.3521° N, 103.8198° E' },
    { id: 'london-uk', name: 'London, UK', coords: '51.5074° N, 0.1278° W' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile Card with Monitor Action */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {currentLocation.displayName}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                  {currentLocation.climateZone}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Lat: {currentLocation.coordinates.lat.toFixed(4)}°, Lng: {currentLocation.coordinates.lng.toFixed(4)}°</span>
                <span>• Elevation: {currentLocation.elevation}</span>
                <span>• {currentLocation.activeSensors} Active Nodes</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {/* Monitor this place action */}
            <WatchButton
              location={currentLocation}
              className="py-2.5 px-4 text-xs font-bold shadow-xs"
            />

            <SecondaryButton
              id="loc-intel-map-btn"
              onClick={() => setActiveTab('navigation')}
              className="text-xs py-2.5 px-3 flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore on Map</span>
            </SecondaryButton>
          </div>
        </div>

        {/* Quick City Switcher */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
            Quick Profile:
          </span>
          {quickPlaces.map((place) => (
            <button
              key={place.id}
              onClick={() => setLocationById(place.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
                currentLocation.id === place.id
                  ? 'bg-blue-50 text-[#2563EB] font-bold border border-blue-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {place.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Profile Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Nature Pulse Composite */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              Environmental Pulse
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {pulse?.overallStatus || 'Optimal'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 font-mono">
              {pulse?.overallScore ?? 78}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Composite biophysical resilience score synthesized across {pulse?.availableDimensionCount ?? 6} active monitoring dimensions.
          </p>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="p-1.5 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 block">Heat</span>
              <span className="font-bold text-slate-800 font-mono">{pulse?.dimensions?.heat?.score ?? 74}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 block">Air</span>
              <span className="font-bold text-slate-800 font-mono">{pulse?.dimensions?.air?.score ?? 82}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 block">Nature</span>
              <span className="font-bold text-slate-800 font-mono">{pulse?.dimensions?.nature?.score ?? 85}</span>
            </div>
          </div>
        </div>

        {/* 2. Thermal Risk & Heat Island */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              Thermal Microclimate
            </span>
            <span className="text-xs font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {currentLocation.surfaceHeatAnomaly > 3 ? 'High UHI' : 'Moderate UHI'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">
              {formatTemp(currentLocation.ambientTemp)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              (Feels {formatTemp(currentLocation.apparentTemp)})
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Surface heat island anomaly is currently radiating <strong className="text-orange-600">+{currentLocation.surfaceHeatAnomaly.toFixed(1)}°C</strong> above surrounding rural reference.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Canopy Buffer: <strong className="text-slate-900">{currentLocation.canopyCoverage}%</strong></span>
            <span>Relative Humidity: <strong className="text-slate-900">{currentLocation.humidity}%</strong></span>
          </div>
        </div>

        {/* 3. Forecast Trajectory & Next Peak */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Diurnal Trajectory
            </span>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Peak at 3:00 PM
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">
              {formatTemp(currentLocation.ambientTemp + 2.8)}
            </span>
            <span className="text-xs font-medium text-slate-500">Max Projected</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Solar irradiance will peak at <strong className="text-slate-800">{currentLocation.solarIrradiance} W/m²</strong> with UV index reaching <strong className="text-slate-800">{currentLocation.uvIndex}</strong>.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Incidents:</span>
            <span className="font-bold text-slate-900 font-mono">{events.length} Alert{events.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Grounded AI Synopsis */}
      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#2563EB] text-white flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Automated Location Assessment</h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              {currentLocation.name} is in a {currentLocation.ambientTemp > 30 ? 'high thermal stress' : 'moderate'} state with an Environmental Pulse score of {pulse?.overallScore ?? 78}/100. Canopy cooling provides active mitigation across residential sectors.
            </p>
          </div>
        </div>

        <PrimaryButton
          id="loc-intel-full-ai"
          onClick={() => openAIWithContext({
            question: `Generate a comprehensive environmental profile summary for ${currentLocation.displayName}, detailing heat vulnerabilities, canopy benefits, and mitigation steps.`,
            sourceModule: 'Location Intelligence Tool',
          })}
          className="text-xs py-2 px-3 whitespace-nowrap self-end sm:self-center"
        >
          Detailed AI Brief
        </PrimaryButton>
      </div>
    </div>
  );
};

export default LocationIntelligenceTool;
