import React from 'react';
import { Flame, Wind, Droplets } from 'lucide-react';
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
        
        <div className="relative z-10 flex items-baseline gap-2">
          <span className="text-4xl font-black font-mono text-slate-100">{heatIndex}</span>
          <span className="text-slate-400 font-mono font-bold">°C</span>
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
        
        <div className="relative z-10 flex items-baseline gap-2">
          <span className="text-4xl font-black font-mono text-slate-100">{airQuality}</span>
          <span className="text-slate-400 font-mono font-bold">AQI</span>
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
        
        <div className="relative z-10 flex items-baseline gap-2">
          <span className="text-4xl font-black font-mono text-slate-100">{humidity}</span>
          <span className="text-slate-400 font-mono font-bold">%</span>
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
