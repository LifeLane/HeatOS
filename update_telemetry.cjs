const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/AnimatedTelemetryCards.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { Flame, Wind, Droplets } from 'lucide-react';",
  "import { Flame, Wind, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';"
);

// HEAT INDEX CARD
const heatOriginal = `<div className="relative z-10 flex items-baseline gap-2">
          <span className="text-4xl font-black font-mono text-slate-100">{heatIndex}</span>
          <span className="text-slate-400 font-mono font-bold">°C</span>
        </div>`;
const heatNew = `<div className="flex justify-between items-end relative z-10">
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
        </div>`;
content = content.replace(heatOriginal, heatNew);

// AIR QUALITY CARD
const aqiOriginal = `<div className="relative z-10 flex items-baseline gap-2">
          <span className="text-4xl font-black font-mono text-slate-100">{airQuality}</span>
          <span className="text-slate-400 font-mono font-bold">AQI</span>
        </div>`;
const aqiNew = `<div className="flex justify-between items-end relative z-10">
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
        </div>`;
content = content.replace(aqiOriginal, aqiNew);

// HUMIDITY CARD
const humidityOriginal = `<div className="relative z-10 flex items-baseline gap-2">
          <span className="text-4xl font-black font-mono text-slate-100">{humidity}</span>
          <span className="text-slate-400 font-mono font-bold">%</span>
        </div>`;
const humidityNew = `<div className="flex justify-between items-end relative z-10">
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
        </div>`;
content = content.replace(humidityOriginal, humidityNew);

fs.writeFileSync('src/components/dashboard/AnimatedTelemetryCards.tsx', content);
