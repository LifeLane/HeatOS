import React from 'react';
import { Flame, Wind, Droplets, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useExplanation } from '../../context/ExplanationContext';

export const AnimatedTelemetryCards: React.FC = () => {
  const { currentLocation, normalizedState, formatTemp } = useLocation();
  const { explainMetric } = useExplanation();

  // Extract variables
  const heatIndex = normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1;
  const airQuality = currentLocation.aqi;
  const humidity = currentLocation.humidity;

  const heatStatus = heatIndex > 35 ? 'text-rose-600' : heatIndex > 30 ? 'text-amber-600' : 'text-emerald-600';
  const aqiStatus = airQuality > 100 ? 'text-rose-600' : airQuality > 50 ? 'text-amber-600' : 'text-emerald-600';
  const humidityStatus = humidity > 60 ? 'text-blue-600' : 'text-emerald-600';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      
      {/* Heat Index Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => explainMetric('heatIndex', `${heatIndex}°C`)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && explainMetric('heatIndex', `${heatIndex}°C`)}
        className="telemetry-card group relative bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md active:scale-[0.99] rounded-2xl p-5 overflow-hidden transition-all duration-300 shadow-xs cursor-pointer select-none"
        title="Click to view full heat stress explanation, provenance & biophysical calculation"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-500 to-orange-500"></div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">HEAT STRESS</h3>
            <Info className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 group-hover:bg-rose-100 transition-colors">
            <Flame className={`w-4 h-4 ${heatStatus} animate-pulse`} />
          </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">{heatIndex}</span>
            <span className="text-slate-500 font-mono font-bold">°C</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-rose-700 text-[10px] sm:text-xs font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>+1.2°/hr</span>
            </div>
            <svg className="w-16 h-6 sm:w-20 sm:h-8 mt-1.5 sm:mt-2 overflow-visible opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 C20,25 40,20 60,15 C80,10 100,2 100,2" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-500" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <div className="mt-3 relative z-10 text-xs font-medium text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-rose-500 relative"></span>
            <span className="uppercase text-[9px] font-bold tracking-wider">SOURCE: FortyGuard</span>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Explain &rarr;</span>
        </div>
      </div>

      {/* Air Quality Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => explainMetric('airQuality', `${airQuality} AQI`)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && explainMetric('airQuality', `${airQuality} AQI`)}
        className="telemetry-card group relative bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md active:scale-[0.99] rounded-2xl p-5 overflow-hidden transition-all duration-300 shadow-xs cursor-pointer select-none"
        title="Click to view air quality index explanation, pollutant breakdown & source provenance"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-yellow-600"></div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">AIR QUALITY</h3>
            <Info className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 group-hover:bg-amber-100 transition-colors">
            <Wind className={`w-4 h-4 ${aqiStatus} float-animation`} />
          </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">{airQuality}</span>
            <span className="text-slate-500 font-mono font-bold">AQI</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-700 text-[10px] sm:text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>-4 AQI/hr</span>
            </div>
            <svg className="w-16 h-6 sm:w-20 sm:h-8 mt-1.5 sm:mt-2 overflow-visible opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,5 C20,5 40,15 60,10 C80,20 100,25 100,25" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <div className="mt-3 relative z-10 text-xs font-medium text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
            <span className="uppercase text-[9px] font-bold tracking-wider">SOURCE: EPA AirNow</span>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Explain &rarr;</span>
        </div>
      </div>

      {/* Humidity Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => explainMetric('humidity', `${humidity}%`)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && explainMetric('humidity', `${humidity}%`)}
        className="telemetry-card group relative bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md active:scale-[0.99] rounded-2xl p-5 overflow-hidden transition-all duration-300 shadow-xs cursor-pointer select-none"
        title="Click to view humidity explanation, psychrometric comfort & sensor provenance"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-cyan-600"></div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">HUMIDITY</h3>
            <Info className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-100 transition-colors">
            <Droplets className={`w-4 h-4 ${humidityStatus} bounce-subtle`} />
          </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">{humidity}</span>
            <span className="text-slate-500 font-mono font-bold">%</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-slate-700 text-[10px] sm:text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Stable</span>
            </div>
            <svg className="w-16 h-6 sm:w-20 sm:h-8 mt-1.5 sm:mt-2 overflow-visible opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 C20,13 40,17 60,14 C80,16 100,15 100,15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <div className="mt-3 relative z-10 text-xs font-medium text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 relative"></span>
            <span className="uppercase text-[9px] font-bold tracking-wider">SOURCE: NOAA NWS</span>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Explain &rarr;</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .bounce-subtle {
          animation: bounceSubtle 2s infinite;
        }
      `}} />
    </div>
  );
};
