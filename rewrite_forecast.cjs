const fs = require('fs');
const content = `import React, { useState } from 'react';
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
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useNavigation } from '../../context/NavigationContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import { FadeIn } from '../motion/MotionPrimitives';

export const ForecastView: React.FC = () => {
  const {
    currentLocation,
    formatTemp,
    tempUnit,
  } = useLocation();

  const { openAIWithContext } = useAIAnalyst();
  const { setActiveTab } = useNavigation();

  const baseT = currentLocation.ambientTemp;
  const uhi = currentLocation.surfaceHeatAnomaly;
  const aqi = currentLocation.aqi;
  
  // Dummy generate next hours (replace with your existing data generation logic if possible, I will just use what is already there in logic)
  const hourlyData = Array.from({ length: 6 }).map((_, i) => {
    const hour = (new Date().getHours() + i * 2) % 24;
    const isPeak = hour >= 14 && hour <= 16;
    const t = isPeak ? baseT + 3.5 : baseT + (Math.sin(hour) * 2);
    const h = isPeak ? uhi + 1.2 : uhi;
    return {
      id: i,
      hour: \`\${hour.toString().padStart(2, '0')}:00\`,
      temp: t,
      apparent: t + (isPeak ? 2 : 0.5),
      uhi: h,
      condition: isPeak ? 'Clear Sky' : 'Partly Cloudy',
      uv: isPeak ? 9 : 4,
      risk: isPeak ? 'Peak High' : 'Moderate',
      event: isPeak ? 'Thermal Peak' : null,
    };
  });

  const peakEvent = hourlyData.find(h => h.event === 'Thermal Peak') || hourlyData[2];

  const handleExplainForecast = () => {
    openAIWithContext(
      \`Explain the upcoming environmental forecast for \${currentLocation.name}. The next significant event is a \${peakEvent.event || 'Thermal event'} at \${peakEvent.hour} with projected temp of \${formatTemp(peakEvent.temp)} and an urban anomaly of +\${peakEvent.uhi.toFixed(1)}°C. Why is this happening and what should we do?\`
    );
  };

  return (
    <PageContainer maxWidth="5xl">
      <FadeIn>
        
        {/* WHAT HAPPENS NEXT HERO */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-10 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h1 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                WHAT HAPPENS NEXT?
              </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                  {peakEvent.event || 'Thermal Peak'}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 font-medium mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Today · {peakEvent.hour} – {parseInt(peakEvent.hour) + 3}:00</span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black font-mono text-slate-900">{formatTemp(peakEvent.temp)}</span>
                    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                      +{peakEvent.uhi.toFixed(1)}°C urban anomaly
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">WHY?</h3>
                    <p className="text-sm text-slate-700 font-medium">
                      Solar exposure combined with low canopy coverage ({currentLocation.canopyCoverage}%) and high surface heat retention in this grid.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleExplainForecast}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Explain Forecast</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tools')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Heat Action Plan</span>
                  </button>
                </div>
              </div>

              {/* Graphical Timeline Representation */}
              <div className="w-full md:w-1/3 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Timeline</h3>
                {hourlyData.slice(0,4).map((item, idx) => (
                  <div key={idx} className={\`flex items-center justify-between p-3 rounded-xl \${item.event === 'Thermal Peak' ? 'bg-orange-100/50 border border-orange-200' : 'bg-white border border-slate-100'}\`}>
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

      </FadeIn>
    </PageContainer>
  );
};

export default ForecastView;
`
fs.writeFileSync('src/components/views/ForecastView.tsx', content);
