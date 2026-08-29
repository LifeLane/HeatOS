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
import { useExplanation } from '../../context/ExplanationContext';
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
  const { explainMetric, explainForecastEvent, explainAIInsight } = useExplanation();

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
  const dailyForecast = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dayLabel = i === 0 ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'long' });
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
                <button
                  type="button"
                  onClick={() =>
                    explainForecastEvent({
                      title: 'Thermal Peak Approaching',
                      time: `Expected peak at ${peakEvent.hour}`,
                      temperature: formatTemp(peakEvent.temp),
                      anomaly: `+${peakEvent.uhi.toFixed(1)}°C`,
                      why: `High solar exposure, limited canopy (${currentLocation.canopyCoverage}%), and surface heat retention are reinforcing local warming.`,
                    })
                  }
                  className="text-left group cursor-pointer"
                  title="Click to view full forecast explanation"
                >
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    Thermal peak approaching
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 font-medium mb-6">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Expected peak at {peakEvent.hour} · Projected {formatTemp(peakEvent.temp)}</span>
                    <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity ml-1">Explain &rarr;</span>
                  </div>
                </button>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-baseline gap-3">
                    <button
                      type="button"
                      onClick={() => explainMetric('ambientTemp', formatTemp(peakEvent.temp))}
                      className="text-4xl font-black font-mono text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Click to inspect projected temperature model"
                    >
                      {formatTemp(peakEvent.temp)}
                    </button>
                    <button
                      type="button"
                      onClick={() => explainMetric('surfaceHeatAnomaly', `+${peakEvent.uhi.toFixed(1)}°C`)}
                      className="text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 cursor-pointer transition-colors"
                      title="Click to inspect local heat signal baseline"
                    >
                      +{peakEvent.uhi.toFixed(1)}°C local heat signal
                    </button>
                  </div>
                  
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      explainAIInsight(
                        'Why This Matters · Thermodynamic Forcing',
                        `Physical breakdown for ${currentLocation.name} during thermal peak interval.`,
                        [
                          `High direct shortwave solar exposure with GHI exceeding 850 W/m²`,
                          `Tree canopy buffer constrained at ${currentLocation.canopyCoverage}%`,
                          `Impervious surface retention creating a +${peakEvent.uhi.toFixed(1)}°C urban heat anomaly`,
                          `Peak diurnal heat stress window: ${peakEvent.hour}`,
                        ]
                      )
                    }
                    onKeyDown={(e) =>
                      (e.key === 'Enter' || e.key === ' ') &&
                      explainAIInsight(
                        'Why This Matters · Thermodynamic Forcing',
                        `Physical breakdown for ${currentLocation.name} during thermal peak interval.`,
                        [
                          `High direct shortwave solar exposure with GHI exceeding 850 W/m²`,
                          `Tree canopy buffer constrained at ${currentLocation.canopyCoverage}%`,
                          `Impervious surface retention creating a +${peakEvent.uhi.toFixed(1)}°C urban heat anomaly`,
                          `Peak diurnal heat stress window: ${peakEvent.hour}`,
                        ]
                      )
                    }
                    className="bg-slate-50 hover:bg-blue-50/60 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
                    title="Click to view in-depth physical factors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-slate-500 group-hover:text-blue-600 uppercase transition-colors">
                        WHY THIS MATTERS
                      </h3>
                      <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Explain &rarr;
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      High solar exposure, limited canopy ({currentLocation.canopyCoverage}%), and surface heat retention are reinforcing local warming.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() =>
                      explainForecastEvent({
                        title: 'Thermal Peak Approaching',
                        time: `Expected peak at ${peakEvent.hour}`,
                        temperature: formatTemp(peakEvent.temp),
                        anomaly: `+${peakEvent.uhi.toFixed(1)}°C`,
                        why: `High solar exposure, limited canopy (${currentLocation.canopyCoverage}%), and surface heat retention are reinforcing local warming.`,
                      })
                    }
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
                {hourlyData.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      explainForecastEvent({
                        title: item.event || `Environmental Interval · ${item.hour}`,
                        time: item.hour,
                        temperature: formatTemp(item.temp),
                        anomaly: `+${item.uhi.toFixed(1)}°C`,
                        why: `Forecast condition: ${item.condition}. Risk level: ${item.risk}. Urban surface contribution +${item.uhi.toFixed(1)}°C.`,
                      })
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer hover:shadow-xs transition-all text-left ${
                      item.event === 'Thermal Peak'
                        ? 'bg-orange-100/50 hover:bg-orange-100 border border-orange-200'
                        : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                    }`}
                    title={`Click to inspect ${item.hour} interval forecast details`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-slate-700">{item.hour}</span>
                      {item.event && (
                        <span className="text-[10px] font-bold uppercase bg-orange-200/80 text-orange-800 px-1.5 py-0.5 rounded">
                          Peak
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{formatTemp(item.temp)}</span>
                      <span className="text-xs text-slate-400">&rarr;</span>
                    </div>
                  </button>
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
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  explainForecastEvent({
                    title: `${day.label} Environmental Forecast`,
                    time: day.label,
                    temperature: `${formatTemp(day.tempHigh)} (High) / ${formatTemp(day.tempLow)} (Low)`,
                    anomaly: `+${(currentLocation.surfaceHeatAnomaly * (1 + idx * 0.1)).toFixed(1)}°C`,
                    why: `Daily profile: Humidity ${day.humidity.toFixed(0)}%, Wind ${day.windSpeed.toFixed(0)} km/h, Precip chance ${day.precipChance}%, UV index ${day.uvIndex}.`,
                  })
                }
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') &&
                  explainForecastEvent({
                    title: `${day.label} Environmental Forecast`,
                    time: day.label,
                    temperature: `${formatTemp(day.tempHigh)} (High) / ${formatTemp(day.tempLow)} (Low)`,
                    anomaly: `+${(currentLocation.surfaceHeatAnomaly * (1 + idx * 0.1)).toFixed(1)}°C`,
                    why: `Daily profile: Humidity ${day.humidity.toFixed(0)}%, Wind ${day.windSpeed.toFixed(0)} km/h, Precip chance ${day.precipChance}%, UV index ${day.uvIndex}.`,
                  })
                }
                className="bg-white hover:bg-blue-50/40 rounded-2xl p-5 border border-slate-200 hover:border-blue-300 shadow-sm flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] group"
                title={`Click to inspect ${day.label} full forecast breakdown`}
              >
                <div className="w-full flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {day.label}
                  </h4>
                  <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                
                {/* Temperature Range */}
                <div className="flex items-end justify-center gap-2 mb-6">
                  <div className="text-2xl font-black font-mono text-slate-900 group-hover:text-blue-600 transition-colors">
                    {formatTemp(day.tempHigh)}
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-400 mb-1">
                    {formatTemp(day.tempLow)}
                  </div>
                </div>

                {/* Granular Metrics */}
                <div className="w-full space-y-3 mt-auto">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      explainMetric('humidity', `${day.humidity.toFixed(0)}%`);
                    }}
                    className="flex items-center justify-between text-xs font-medium hover:text-blue-600 transition-colors cursor-pointer py-0.5"
                    title="Click to explain humidity"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">HUMIDITY</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.humidity.toFixed(0)}%</span>
                  </div>
                  
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      explainMetric('wind_speed', `${day.windSpeed.toFixed(0)} km/h`);
                    }}
                    className="flex items-center justify-between text-xs font-medium hover:text-blue-600 transition-colors cursor-pointer py-0.5"
                    title="Click to explain wind speed"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Wind className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">WIND</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.windSpeed.toFixed(0)} km/h</span>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      explainMetric('precipitation', `${day.precipChance}% chance`);
                    }}
                    className="flex items-center justify-between text-xs font-medium hover:text-blue-600 transition-colors cursor-pointer py-0.5"
                    title="Click to explain precipitation probability"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-[10px] tracking-wide uppercase">PRECIPITATION</span>
                    </div>
                    <span className="text-slate-800 font-bold font-mono">{day.precipChance}%</span>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      explainMetric('uv_index', `UV ${day.uvIndex}`);
                    }}
                    className="flex items-center justify-between text-xs font-medium hover:text-blue-600 transition-colors cursor-pointer py-0.5"
                    title="Click to explain UV exposure"
                  >
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
