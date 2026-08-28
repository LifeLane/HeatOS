import React from 'react';
import { Flame, Wind, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const AnimatedTelemetryCards: React.FC = () => {
  const { currentLocation, normalizedState } = useLocation();

  // Extract variables
  const heatIndex = normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1;
  const airQuality = currentLocation.aqi;
  const humidity = currentLocation.humidity;

  const heatStatus = heatIndex > 35 ? 'text-rose-500' : heatIndex > 30 ? 'text-amber-500' : 'text-emerald-500';
  const aqiStatus = airQuality > 100 ? 'text-rose-500' : airQuality > 50 ? 'text-amber-500' : 'text-emerald-500';
  const humidityStatus = humidity > 60 ? 'text-blue-500' : 'text-emerald-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Heat Index Card */}
      <div className="telemetry-card group relative bg-slate-900 border border-slate-700/60 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-900/20 hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-orange-500 opacity-80"></div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Flame size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Heat Index</h3>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <Flame className={`w-5 h-5 ${heatStatus} animate-pulse`} />
          </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-100">{heatIndex}</span>
            <span className="text-slate-400 font-mono font-bold">°C</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-rose-400 text-[10px] sm:text-xs font-bold bg-rose-500/10 px-1.5 sm:px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>+1.2°/hr</span>
            </div>
            <svg className="w-16 h-6 sm:w-20 sm:h-8 mt-1.5 sm:mt-2 overflow-visible opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 C20,25 40,20 60,15 C80,10 100,2 100,2" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-400 drop-shadow-md" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <div className="mt-3 relative z-10 text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute opacity-75"></span>
          <span className="w-2 h-2 rounded-full bg-rose-500 relative"></span>
          FortyGuard Thermal Engine
        </div>
      </div>

      {/* Air Quality Card */}
      <div className="telemetry-card group relative bg-slate-900 border border-slate-700/60 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-yellow-600 opacity-80"></div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Wind size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Air Quality</h3>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <Wind className={`w-5 h-5 ${aqiStatus} float-animation`} />
          </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-100">{airQuality}</span>
            <span className="text-slate-400 font-mono font-bold">AQI</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] sm:text-xs font-bold bg-emerald-500/10 px-1.5 sm:px-2 py-1 rounded-lg">
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>-4 AQI/hr</span>
            </div>
            <svg className="w-16 h-6 sm:w-20 sm:h-8 mt-1.5 sm:mt-2 overflow-visible opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,5 C20,5 40,15 60,10 C80,20 100,25 100,25" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 drop-shadow-md" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <div className="mt-3 relative z-10 text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute opacity-75"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
          Live Ingestion
        </div>
      </div>

      {/* Humidity Card */}
      <div className="telemetry-card group relative bg-slate-900 border border-slate-700/60 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-600 opacity-80"></div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Droplets size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Humidity</h3>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <Droplets className={`w-5 h-5 ${humidityStatus} bounce-subtle`} />
          </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-100">{humidity}</span>
            <span className="text-slate-400 font-mono font-bold">%</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-bold bg-slate-800 px-1.5 sm:px-2 py-1 rounded-lg">
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Stable</span>
            </div>
            <svg className="w-16 h-6 sm:w-20 sm:h-8 mt-1.5 sm:mt-2 overflow-visible opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 C20,13 40,17 60,14 C80,16 100,15 100,15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 drop-shadow-md" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <div className="mt-3 relative z-10 text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute opacity-75"></span>
          <span className="w-2 h-2 rounded-full bg-blue-500 relative"></span>
          Ambient Sensors
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
