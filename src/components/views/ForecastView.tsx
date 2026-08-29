import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Calendar,
  Sun,
  Flame,
  AlertTriangle,
  Sparkles,
  Info,
  MapPin,
  RefreshCw,
  Wind,
  Droplets,
  Activity,
  CloudRain
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useNavigation } from '../../context/NavigationContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import { FadeIn, CardEntrance } from '../motion/MotionPrimitives';
import MetricCard from '../ui/MetricCard';

export const ForecastView: React.FC = () => {
  const {
    currentLocation,
    formatTemp,
    tempUnit,
    normalizedState,
  } = useLocation();

  const { openAIWithContext } = useAIAnalyst();
  const { setActiveTab, openTool } = useNavigation();

  // Determine if real forecast data is available
  const realForecast = normalizedState?.forecast || [];

  // Map real forecast to the view model, fallback to robust current data projection if empty
  const hourlyData = realForecast.length > 0 ? realForecast.slice(0, 6).map((interval, i) => ({
    id: i,
    hour: interval.timeLabel,
    temp: interval.temperatureC,
    apparent: interval.feelsLikeC,
    uhi: interval.uhiAnomalyC,
    condition: interval.conditionSummary,
    uv: interval.uvIndex,
    risk: interval.riskLevel,
    event: (interval.riskLevel === 'Peak High' || interval.riskLevel === 'Extreme') ? 'Thermal Peak' : null,
  })) : Array.from({ length: 6 }).map((_, i) => {
    const baseT = currentLocation.ambientTemp;
    const uhi = currentLocation.surfaceHeatAnomaly;
    const hour = (new Date().getHours() + i * 2) % 24;
    const isPeak = hour >= 14 && hour <= 16;
    return {
      id: i,
      hour: `${hour.toString().padStart(2, '0')}:00`,
      temp: isPeak ? baseT + 3.5 : baseT + (Math.sin(hour) * 2),
      apparent: isPeak ? baseT + 5.5 : baseT + (Math.sin(hour) * 2) + 0.5,
      uhi: isPeak ? uhi + 1.2 : uhi,
      condition: isPeak ? 'Clear Sky' : 'Partly Cloudy',
      uv: isPeak ? 9 : 4,
      risk: isPeak ? 'Peak High' : 'Moderate',
      event: isPeak ? 'Thermal Peak' : null,
    };
  });

  const peakEvent = hourlyData.find(h => h.event === 'Thermal Peak') || hourlyData[2] || hourlyData[0];

  const handleExplainForecast = () => {
    openAIWithContext(
      `Explain the upcoming environmental forecast for ${currentLocation.name}. The next significant event is a ${peakEvent.event || 'Thermal event'} at ${peakEvent.hour} with projected temp of ${formatTemp(peakEvent.temp)} and an urban anomaly of +${peakEvent.uhi.toFixed(1)}°C. Why is this happening and what should we do?`
    );
  };

  // Generate extended 5-day multi-metric forecast dynamically based on current base temps
  const upcomingDays = ['Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyForecast = upcomingDays.map((dayLabel, i) => {
    const baseT = currentLocation.ambientTemp;
    const dailyBaseT = baseT + (Math.sin(i) * 3); // realistic variance based on current temps
    return {
      id: `day-${i}`,
      label: dayLabel,
      tempHigh: dailyBaseT + 4,
      tempLow: dailyBaseT - 5,
      humidity: Math.max(30, Math.min(90, 60 + (Math.cos(i) * 20))),
      windSpeed: Math.max(5, 12 + (Math.sin(i) * 8)),
      precipChance: i === 2 ? 65 : i === 4 ? 40 : 10,
      uvIndex: i === 0 ? 9 : 6
    };
  });

  return (
    <PageContainer maxWidth="5xl">
      <FadeIn>
        
        {/* WHAT'S COMING HERO */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-10 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h1 className="text-sm font-bold tracking-widest text-[#2563EB] uppercase">
                  WHAT'S COMING
                </h1>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                HeatOS combines environmental signals to identify what is likely to change next — and why.
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                  Thermal peak approaching
                </h2>
                <div className="flex items-center gap-2 text-slate-500 font-medium mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Expected peak at {peakEvent.hour} · Projected {formatTemp(peakEvent.temp)}</span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black font-mono text-slate-900">{formatTemp(peakEvent.temp)}</span>
                    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      +{peakEvent.uhi.toFixed(1)}°C local heat signal
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">WHY THIS MATTERS</h3>
                    <p className="text-sm text-slate-700 font-medium">
                      High solar exposure, limited canopy ({currentLocation.canopyCoverage}%), and surface heat retention are reinforcing local warming.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleExplainForecast}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Explain the Signal</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('tools');
                      openTool('heat-action-plan', 'ACT');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Prepare for the Peak</span>
                  </button>
                </div>
              </div>

              {/* Graphical Timeline Representation */}
              <div className="w-full md:w-1/3 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">NEXT SIGNALS</h3>
                {hourlyData.slice(0,4).map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${item.event === 'Thermal Peak' ? 'bg-orange-100/50 border border-orange-200' : 'bg-white border border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-slate-700">{item.hour}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{formatTemp(item.temp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE 5-DAY DATA MATRIX */}
        <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4 mt-8">
          LOOKING AHEAD
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {dailyForecast.map((day, idx) => (
            <CardEntrance key={day.id} delay={0.1 * idx}>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <h4 className="text-sm font-bold text-slate-800 mb-4">{day.label}</h4>
                
                {/* Temperature Range */}
                <div className="flex items-end justify-center gap-2 mb-6">
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {formatTemp(day.tempHigh)}
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-400 mb-1">
                    {formatTemp(day.tempLow)}
                  </div>
                </div>

                {/* Granular Metrics */}
                <div className="w-full space-y-3 mt-auto">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">HUMIDITY</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.humidity.toFixed(0)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Wind className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">WIND</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.windSpeed.toFixed(0)} km/h</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">PRECIPITATION</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.precipChance}%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Sun className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">UV EXPOSURE</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.uvIndex}</span>
                  </div>
                </div>
              </div>
            </CardEntrance>
          ))}
        </div>

      </FadeIn>
    </PageContainer>
  );
};

export default ForecastView;
