import React, { useState } from 'react';
import {
  SplitSquareVertical,
  MapPin,
  Flame,
  Activity,
  Wind,
  Droplets,
  Trees,
  Sun,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

interface CityComparisonData {
  id: string;
  name: string;
  country: string;
  climateZone: string;
  temp: number;
  apparent: number;
  uhiAnomaly: number;
  pulseScore: number;
  heatRisk: string;
  aqi: number;
  humidity: number;
  canopy: number;
  peakHour: string;
}

const CITY_DATABASE: Record<string, CityComparisonData> = {
  'austin-tx': {
    id: 'austin-tx',
    name: 'Austin, TX',
    country: 'USA',
    climateZone: 'Humid Subtropical (Cfa)',
    temp: 34.2,
    apparent: 38.6,
    uhiAnomaly: 3.4,
    pulseScore: 78,
    heatRisk: 'HIGH',
    aqi: 45,
    humidity: 58,
    canopy: 32,
    peakHour: '3:30 PM',
  },
  'phoenix-az': {
    id: 'phoenix-az',
    name: 'Phoenix, AZ',
    country: 'USA',
    climateZone: 'Hot Desert (BWh)',
    temp: 42.1,
    apparent: 41.5,
    uhiAnomaly: 4.8,
    pulseScore: 62,
    heatRisk: 'CRITICAL',
    aqi: 68,
    humidity: 18,
    canopy: 12,
    peakHour: '4:15 PM',
  },
  'dubai-uae': {
    id: 'dubai-uae',
    name: 'Dubai',
    country: 'UAE',
    climateZone: 'Subtropical Desert (BWh)',
    temp: 40.5,
    apparent: 48.2,
    uhiAnomaly: 4.2,
    pulseScore: 58,
    heatRisk: 'CRITICAL',
    aqi: 95,
    humidity: 62,
    canopy: 8,
    peakHour: '2:45 PM',
  },
  'singapore-sg': {
    id: 'singapore-sg',
    name: 'Singapore',
    country: 'Singapore',
    climateZone: 'Tropical Rainforest (Af)',
    temp: 31.8,
    apparent: 37.4,
    uhiAnomaly: 2.1,
    pulseScore: 88,
    heatRisk: 'MODERATE',
    aqi: 35,
    humidity: 82,
    canopy: 46,
    peakHour: '2:00 PM',
  },
  'london-uk': {
    id: 'london-uk',
    name: 'London',
    country: 'UK',
    climateZone: 'Oceanic (Cfb)',
    temp: 22.4,
    apparent: 22.1,
    uhiAnomaly: 1.6,
    pulseScore: 92,
    heatRisk: 'OPTIMAL',
    aqi: 28,
    humidity: 65,
    canopy: 28,
    peakHour: '3:00 PM',
  },
};

export const ComparePlacesTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [city1, setCity1] = useState<string>(currentLocation.id in CITY_DATABASE ? currentLocation.id : 'austin-tx');
  const [city2, setCity2] = useState<string>('phoenix-az');
  const [city3, setCity3] = useState<string>('singapore-sg');

  const c1 = CITY_DATABASE[city1] || CITY_DATABASE['austin-tx'];
  const c2 = CITY_DATABASE[city2] || CITY_DATABASE['phoenix-az'];
  const c3 = CITY_DATABASE[city3] || CITY_DATABASE['singapore-sg'];

  const metrics = [
    { label: 'Ambient Air Temp', v1: formatTemp(c1.temp), v2: formatTemp(c2.temp), v3: formatTemp(c3.temp), icon: Flame },
    { label: 'Feels Like (Apparent)', v1: formatTemp(c1.apparent), v2: formatTemp(c2.apparent), v3: formatTemp(c3.apparent), icon: Sun },
    { label: 'UHI Anomaly Delta', v1: `+${c1.uhiAnomaly}°C`, v2: `+${c2.uhiAnomaly}°C`, v3: `+${c3.uhiAnomaly}°C`, icon: Flame },
    { label: 'Environmental Pulse', v1: `${c1.pulseScore}/100`, v2: `${c2.pulseScore}/100`, v3: `${c3.pulseScore}/100`, icon: Activity },
    { label: 'Heat Risk Severity', v1: c1.heatRisk, v2: c2.heatRisk, v3: c3.heatRisk, icon: ShieldAlert },
    { label: 'Air Quality (AQI)', v1: `${c1.aqi} AQI`, v2: `${c2.aqi} AQI`, v3: `${c3.aqi} AQI`, icon: Wind },
    { label: 'Relative Humidity', v1: `${c1.humidity}%`, v2: `${c2.humidity}%`, v3: `${c3.humidity}%`, icon: Droplets },
    { label: 'Vegetative Canopy', v1: `${c1.canopy}%`, v2: `${c2.canopy}%`, v3: `${c3.canopy}%`, icon: Trees },
    { label: 'Peak Heat Window', v1: c1.peakHour, v2: c2.peakHour, v3: c3.peakHour, icon: Sun },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
            <SplitSquareVertical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Multi-Location Comparative Matrix
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-sky-50 text-sky-800 rounded-full border border-sky-200">
                3-Way Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side biophysical and microclimatic comparison across global urban ecosystems.
            </p>
          </div>
        </div>

        <PrimaryButton
          id="compare-ask-ai"
          onClick={() => openAIWithContext({
            question: `Compare the microclimate and heat risk profiles of ${c1.name}, ${c2.name}, and ${c3.name}. What explains the differences in thermal comfort and canopy cooling?`,
            sourceModule: 'Compare Places Tool',
          })}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-start sm:self-center flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Comparative Analysis</span>
        </PrimaryButton>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Location A', val: city1, setVal: setCity1 },
          { label: 'Location B', val: city2, setVal: setCity2 },
          { label: 'Location C', val: city3, setVal: setCity3 },
        ].map((sel, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{sel.label}</label>
            <select
              value={sel.val}
              onChange={(e) => sel.setVal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {Object.entries(CITY_DATABASE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name} ({v.country})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Side-by-Side Biophysical Telemetry</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 pr-4">Environmental Metric</th>
                <th className="py-2.5 px-3 text-[#2563EB]">{c1.name}</th>
                <th className="py-2.5 px-3 text-orange-600">{c2.name}</th>
                <th className="py-2.5 px-3 text-emerald-600">{c3.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {metrics.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-sans font-semibold text-slate-700 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.label}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{m.v1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{m.v2}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{m.v3}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePlacesTool;
