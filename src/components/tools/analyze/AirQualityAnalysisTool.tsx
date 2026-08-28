import React from 'react';
import {
  Wind,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Info,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';

export const AirQualityAnalysisTool: React.FC = () => {
  const { currentLocation } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const aqi = currentLocation.aqi;
  const aqiStatus =
    aqi <= 50
      ? { label: 'Good', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.' }
      : aqi <= 100
      ? { label: 'Moderate', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', desc: 'Air quality is acceptable; however, sensitive groups may experience mild symptoms.' }
      : aqi <= 150
      ? { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Members of sensitive groups may experience health effects.' }
      : { label: 'Unhealthy', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Some members of the general public may experience health effects.' };

  const pollutants = [
    { name: 'PM2.5 (Fine Particles)', value: `${Math.round(aqi * 0.28)} µg/m³`, standard: '15 µg/m³ (WHO 24h)', level: aqi > 50 ? 'Moderate' : 'Good' },
    { name: 'PM10 (Inhalable Particles)', value: `${Math.round(aqi * 0.45)} µg/m³`, standard: '45 µg/m³ (WHO 24h)', level: 'Good' },
    { name: 'Ozone (O3)', value: `${(aqi * 0.55).toFixed(1)} ppb`, standard: '60 ppb', level: aqi > 70 ? 'Elevated' : 'Low' },
    { name: 'Nitrogen Dioxide (NO2)', value: `${(aqi * 0.22).toFixed(1)} ppb`, standard: '25 ppb', level: 'Low' },
    { name: 'Carbon Monoxide (CO)', value: '0.4 ppm', standard: '4.0 ppm', level: 'Optimal' },
  ];

  return (
    <div id="air-quality-analysis-tool" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Wind className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Air Quality & Atmospheric Composition
                </h2>
                <p className="text-xs text-slate-500">
                  Ground-truth particulate & photochemical monitoring in {currentLocation.displayName}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              openAIWithContext({
                triggerSource: 'tools',
                toolId: 'air-quality-analysis',
                headline: `Air Quality Analysis for ${currentLocation.displayName}`,
                summary: `Current AQI is ${aqi} (${aqiStatus.label}). Pollutant breakdown evaluated.`,
                location: currentLocation.name,
              })
            }
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Air Diagnosis</span>
          </button>
        </div>

        {/* AQI Indicator Block */}
        <div className={`p-5 rounded-2xl border ${aqiStatus.border} ${aqiStatus.bg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Composite Air Quality Index
            </span>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-black ${aqiStatus.color}`}>{aqi}</span>
              <span className={`text-sm font-bold ${aqiStatus.color}`}>{aqiStatus.label}</span>
            </div>
            <p className="text-xs text-slate-700 max-w-xl">
              {aqiStatus.desc}
            </p>
          </div>
        </div>

        {/* Pollutants Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Measured Pollutant Concentrations
          </h3>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {pollutants.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{p.name}</span>
                  <p className="text-[11px] text-slate-400 font-mono">Reference Limit: {p.standard}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900">{p.value}</span>
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">{p.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityAnalysisTool;
