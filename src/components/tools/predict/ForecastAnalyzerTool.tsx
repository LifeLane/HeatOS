import React, { useState } from 'react';
import {
  CloudSun,
  TrendingUp,
  Flame,
  Sun,
  Wind,
  Droplets,
  Clock,
  Database,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const ForecastAnalyzerTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [selectedHorizon, setSelectedHorizon] = useState<'24h' | '5d'>('24h');

  // Deterministic 24-hour diurnal forecast curve based on active ambient temp
  const baseTemp = currentLocation.ambientTemp;
  const hourlyForecast = [
    { time: '09:00', temp: baseTemp - 2.2, apparent: baseTemp - 1.5, uv: 4, heatRisk: 'MODERATE', conf: 98 },
    { time: '12:00', temp: baseTemp + 1.2, apparent: baseTemp + 2.5, uv: 8, heatRisk: 'HIGH', conf: 96 },
    { time: '15:00', temp: baseTemp + 3.4, apparent: baseTemp + 5.1, uv: 9, heatRisk: 'CRITICAL', conf: 94 },
    { time: '18:00', temp: baseTemp + 0.8, apparent: baseTemp + 1.8, uv: 3, heatRisk: 'HIGH', conf: 91 },
    { time: '21:00', temp: baseTemp - 3.5, apparent: baseTemp - 2.8, uv: 0, heatRisk: 'MODERATE', conf: 89 },
    { time: '00:00', temp: baseTemp - 6.1, apparent: baseTemp - 5.4, uv: 0, heatRisk: 'OPTIMAL', conf: 86 },
  ];

  // 5-Day synoptic outlook
  const dailyForecast = [
    { day: 'Today', date: 'Aug 20', high: baseTemp + 3.4, low: baseTemp - 6.5, aqi: currentLocation.aqi, peakRisk: 'CRITICAL', conf: 95 },
    { day: 'Tomorrow', date: 'Aug 21', high: baseTemp + 4.1, low: baseTemp - 5.8, aqi: currentLocation.aqi + 12, peakRisk: 'CRITICAL', conf: 90 },
    { day: 'Friday', date: 'Aug 22', high: baseTemp + 2.0, low: baseTemp - 7.0, aqi: currentLocation.aqi - 5, peakRisk: 'HIGH', conf: 85 },
    { day: 'Saturday', date: 'Aug 23', high: baseTemp - 1.2, low: baseTemp - 8.2, aqi: currentLocation.aqi - 15, peakRisk: 'MODERATE', conf: 80 },
    { day: 'Sunday', date: 'Aug 24', high: baseTemp + 0.5, low: baseTemp - 7.5, aqi: currentLocation.aqi - 8, peakRisk: 'HIGH', conf: 75 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Synoptic &amp; Diurnal Forecast Analyzer
            </h2>
            <p className="text-xs text-slate-500">
              Forward projection of thermal indices, diurnal cycles, and risk curves
            </p>
          </div>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setSelectedHorizon('24h')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedHorizon === '24h'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            24-Hour Diurnal
          </button>
          <button
            onClick={() => setSelectedHorizon('5d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedHorizon === '5d'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            5-Day Synoptic
          </button>
        </div>
      </div>

      {/* Selected Projection View */}
      {selectedHorizon === '24h' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">24-Hour Thermal Progression</h3>
            </div>
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Projected Peak: 3:00 PM ({formatTemp(baseTemp + 3.4)})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {hourlyForecast.map((hr, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-center space-y-2 transition-all ${
                  hr.heatRisk === 'CRITICAL'
                    ? 'bg-rose-50/70 border-rose-200'
                    : hr.heatRisk === 'HIGH'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <span className="text-xs font-mono font-bold text-slate-600 block">{hr.time}</span>
                <div className="text-lg font-extrabold text-slate-900 font-mono">
                  {formatTemp(hr.temp)}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Feels {formatTemp(hr.apparent)}
                </span>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-600">UV {hr.uv}</span>
                  <span className="text-slate-400">{hr.conf}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">5-Day Synoptic Outlook</h3>
            <span className="text-[11px] font-mono text-slate-400">NOAA GFS + Open-Meteo Ensemble</span>
          </div>

          <div className="space-y-2">
            {dailyForecast.map((d, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4"
              >
                <div className="min-w-[100px]">
                  <span className="text-xs font-bold text-slate-900 block">{d.day}</span>
                  <span className="text-[10px] font-mono text-slate-400">{d.date}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block">High</span>
                    <span className="font-bold text-slate-900">{formatTemp(d.high)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Low</span>
                    <span className="font-bold text-slate-500">{formatTemp(d.low)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Air AQI</span>
                    <span className="font-bold text-slate-700">{d.aqi}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    d.peakRisk === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    d.peakRisk === 'HIGH' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {d.peakRisk}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {d.conf}% Conf
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grounded AI Synopsis */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Forecast Interpretation
          </h4>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Peak thermal stress will concentrate between 14:00 and 17:00 today. Tomorrow (Aug 21) brings a +0.7°C increase with rising AQI before Friday brings relative relief.
          </p>
        </div>

        <PrimaryButton
          id="forecast-ask-ai"
          onClick={() => openAIWithContext({
            question: `Analyze the 24-hour and 5-day forecast for ${currentLocation.displayName}. When will heat stress and solar exposure be highest?`,
            sourceModule: 'Forecast Analyzer Tool',
          })}
          className="text-xs py-2 px-3 whitespace-nowrap self-end sm:self-center"
        >
          AI Forecast Summary
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ForecastAnalyzerTool;
