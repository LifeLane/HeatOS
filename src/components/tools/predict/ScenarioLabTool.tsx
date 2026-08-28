import React, { useState } from 'react';
import {
  FlaskConical,
  Sliders,
  Flame,
  Droplets,
  Trees,
  Sun,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info,
  TrendingUp,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const ScenarioLabTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  // Baseline states
  const baseTemp = currentLocation.ambientTemp;
  const baseHumidity = currentLocation.humidity;
  const baseCanopy = currentLocation.canopyCoverage;

  // Perturbation controls
  const [tempDelta, setTempDelta] = useState<number>(0);
  const [humidityVal, setHumidityVal] = useState<number>(baseHumidity);
  const [canopyDelta, setCanopyDelta] = useState<number>(0);
  const [timeShift, setTimeShift] = useState<'noon' | 'afternoon' | 'evening' | 'night'>('afternoon');

  const handleReset = () => {
    setTempDelta(0);
    setHumidityVal(baseHumidity);
    setCanopyDelta(0);
    setTimeShift('afternoon');
  };

  // Modeled Calculations
  const modeledTemp = baseTemp + tempDelta;
  const modeledCanopy = Math.max(0, Math.min(100, baseCanopy + canopyDelta));
  const canopyCoolingEffect = (modeledCanopy * 0.05); // up to 5°C reduction
  const modeledUHI = Math.max(0, currentLocation.surfaceHeatAnomaly - (canopyDelta * 0.04));

  // Modeled Apparent Temp
  const modeledApparent = modeledTemp + (humidityVal > 50 ? (humidityVal - 50) * 0.12 : -1.2) - (canopyDelta * 0.03);

  // Psychrometric Wet-Bulb Modeled
  const calculateWetBulb = (t: number, rh: number) => {
    const tw =
      t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
      Math.atan(t + rh) -
      Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
      4.686035;
    return tw;
  };
  const modeledWetBulb = calculateWetBulb(modeledTemp, humidityVal);

  // Modeled Thermal Comfort Score (0-100)
  const modeledComfort = Math.max(
    10,
    Math.min(
      95,
      Math.round(85 - (modeledTemp - 20) * 2.2 - (modeledUHI * 3) + (modeledCanopy * 0.2))
    )
  );

  return (
    <div className="space-y-6">
      {/* Header with Modeled Badges */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Environmental Scenario &amp; Simulation Lab
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                MODELED
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                SCENARIO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate microclimate intervention outcomes, heatwave scenarios, and urban canopy modifications.
            </p>
          </div>
        </div>

        <SecondaryButton
          id="reset-scenario-btn"
          onClick={handleReset}
          className="text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </SecondaryButton>
      </div>

      {/* Control Sliders Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-700" />
          Perturbation Variables
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Temp Delta */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Temperature Shift
              </span>
              <span className="font-mono font-bold text-slate-900">
                {tempDelta > 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}
              </span>
            </div>
            <input
              type="range"
              min="-8"
              max="10"
              step="1"
              value={tempDelta}
              onChange={(e) => setTempDelta(Number(e.target.value))}
              className="w-full accent-orange-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-8°C (Cool Wave)</span>
              <span>Baseline</span>
              <span>+10°C (Extreme Heat)</span>
            </div>
          </div>

          {/* 2. Humidity */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                Relative Humidity
              </span>
              <span className="font-mono font-bold text-slate-900">{humidityVal}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={humidityVal}
              onChange={(e) => setHumidityVal(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10% (Arid)</span>
              <span>50%</span>
              <span>95% (Tropical)</span>
            </div>
          </div>

          {/* 3. Canopy Delta */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Trees className="w-3.5 h-3.5 text-emerald-600" />
                Urban Canopy Modification
              </span>
              <span className="font-mono font-bold text-slate-900">
                {canopyDelta > 0 ? `+${canopyDelta}%` : `${canopyDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="40"
              step="5"
              value={canopyDelta}
              onChange={(e) => setCanopyDelta(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-30% (Deforestation)</span>
              <span>Current</span>
              <span>+40% (Urban Forest)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modeled Output Dashboard */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Simulated Microclimate Outcomes</h3>
          <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            Estimated Projection
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Modeled Temp */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modeled Ambient</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{formatTemp(modeledTemp)}</div>
            <span className="text-[10px] text-slate-500 font-mono block">Feels {formatTemp(modeledApparent)}</span>
          </div>

          {/* Modeled Wet-Bulb */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modeled Wet-Bulb</span>
            <div className="text-2xl font-extrabold text-blue-700 font-mono">{modeledWetBulb.toFixed(1)}°C</div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {modeledWetBulb > 28 ? 'Dangerous Stress' : 'Manageable'}
            </span>
          </div>

          {/* Modeled UHI Anomaly */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modeled UHI</span>
            <div className="text-2xl font-extrabold text-orange-600 font-mono">+{modeledUHI.toFixed(1)}°C</div>
            <span className="text-[10px] text-emerald-600 font-mono block">
              {canopyDelta > 0 ? `-${(canopyDelta * 0.04).toFixed(1)}°C from Canopy` : 'No Shade Reduction'}
            </span>
          </div>

          {/* Modeled Comfort */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thermal Comfort</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{modeledComfort}/100</div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {modeledComfort >= 70 ? 'High Comfort' : modeledComfort >= 45 ? 'Moderate' : 'Severe Stress'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Scenario Insight */}
      <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Simulation Analysis
          </h4>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            {canopyDelta > 15
              ? `Adding +${canopyDelta}% canopy coverage produces a modeled -${(canopyDelta * 0.04).toFixed(1)}°C UHI reduction and elevates thermal comfort by +${Math.round(canopyDelta * 0.2)} points.`
              : `Adjust variables to model urban tree planting programs, asphalt albedo treatments, or heatwave conditions.`}
          </p>
        </div>

        <PrimaryButton
          id="scenario-ask-ai"
          onClick={() => openAIWithContext({
            question: `In our scenario simulation for ${currentLocation.displayName}, ambient temperature is modeled at ${formatTemp(modeledTemp)}, humidity at ${humidityVal}%, and canopy delta at ${canopyDelta}%. What are the physiological and energy implications?`,
            sourceModule: 'Scenario Lab Tool',
          })}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-end sm:self-center"
        >
          Evaluate with AI
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ScenarioLabTool;
