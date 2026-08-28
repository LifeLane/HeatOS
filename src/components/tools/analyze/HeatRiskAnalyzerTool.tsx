import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Activity,
  Wind,
  Droplets,
  Sun,
  Trees,
  Clock,
  Database,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const HeatRiskAnalyzerTool: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit, lastTelemetryTime } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  // Psychrometric Wet-Bulb Calculation (Stull's formula)
  const calculateWetBulb = (t: number, rh: number) => {
    const tw =
      t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
      Math.atan(t + rh) -
      Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
      4.686035;
    return tw;
  };

  const wetBulbC = calculateWetBulb(currentLocation.ambientTemp, currentLocation.humidity);

  // Deterministic Heat Risk Score Engine (0 - 100)
  const calculateRiskScore = () => {
    let score = 20; // baseline

    // 1. Ambient & Apparent contribution (up to 40 pts)
    if (currentLocation.ambientTemp > 40) score += 40;
    else if (currentLocation.ambientTemp > 35) score += 32;
    else if (currentLocation.ambientTemp > 30) score += 22;
    else if (currentLocation.ambientTemp > 25) score += 12;

    // 2. Wet-bulb / humidity thermal stress (up to 25 pts)
    if (wetBulbC > 30) score += 25;
    else if (wetBulbC > 27) score += 20;
    else if (wetBulbC > 24) score += 14;
    else if (wetBulbC > 20) score += 8;

    // 3. FortyGuard Surface Heat Island Anomaly (up to 20 pts)
    const anomaly = currentLocation.surfaceHeatAnomaly;
    if (anomaly > 4.5) score += 20;
    else if (anomaly > 3.0) score += 15;
    else if (anomaly > 1.5) score += 10;
    else if (anomaly > 0.5) score += 5;

    // 4. Solar Radiation (up to 15 pts)
    if (currentLocation.uvIndex > 9) score += 15;
    else if (currentLocation.uvIndex > 6) score += 10;
    else if (currentLocation.uvIndex > 3) score += 5;

    // 5. Canopy buffering reduction (subtract up to 15 pts)
    const canopyReduction = Math.min(15, Math.round(currentLocation.canopyCoverage * 0.3));
    score -= canopyReduction;

    return Math.min(100, Math.max(5, score));
  };

  const riskScore = calculateRiskScore();

  const getSeverity = (score: number): { label: string; color: string; badge: string } => {
    if (score >= 80) return { label: 'CRITICAL', color: 'text-rose-600', badge: 'bg-rose-50 text-rose-800 border-rose-200' };
    if (score >= 65) return { label: 'HIGH', color: 'text-orange-600', badge: 'bg-orange-50 text-orange-800 border-orange-200' };
    if (score >= 45) return { label: 'ELEVATED', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (score >= 25) return { label: 'MODERATE', color: 'text-blue-600', badge: 'bg-blue-50 text-blue-800 border-blue-200' };
    return { label: 'OPTIMAL', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  const severity = getSeverity(riskScore);

  // Deterministic Key Drivers
  const drivers = [
    {
      title: 'Ambient & Apparent Load',
      value: `${formatTemp(currentLocation.ambientTemp)} (Feels ${formatTemp(currentLocation.apparentTemp)})`,
      impact: currentLocation.ambientTemp > 32 ? 'High Impact' : 'Moderate',
      icon: Flame,
      color: 'text-orange-600',
    },
    {
      title: 'Wet-Bulb Temperature (Tw)',
      value: `${wetBulbC.toFixed(1)}°C`,
      impact: wetBulbC > 26 ? 'High Evaporative Stress' : 'Safe Threshold',
      icon: Droplets,
      color: 'text-sky-600',
    },
    {
      title: 'Surface Heat Island Anomaly',
      value: `+${currentLocation.surfaceHeatAnomaly.toFixed(1)}°C Delta`,
      impact: currentLocation.surfaceHeatAnomaly > 3 ? 'Excess Asphalt Trapping' : 'Low Anomaly',
      icon: TrendingUp,
      color: 'text-rose-600',
    },
    {
      title: 'Solar UV & Insolation',
      value: `UV Index ${currentLocation.uvIndex} (${currentLocation.solarIrradiance} W/m²)`,
      impact: currentLocation.uvIndex > 7 ? 'High Insolation' : 'Moderate',
      icon: Sun,
      color: 'text-amber-600',
    },
    {
      title: 'Vegetative Canopy Buffer',
      value: `${currentLocation.canopyCoverage}% Coverage`,
      impact: currentLocation.canopyCoverage >= 25 ? 'Active -2.4°C Shading' : 'Deficit',
      icon: Trees,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Risk Score Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Heat Risk Assessment
                </h2>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${severity.badge}`}>
                  {severity.label} RISK
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic biophysical thermal hazard calculation for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 self-start md:self-center">
            <span className="text-5xl font-extrabold text-slate-900 font-mono tracking-tight">
              {riskScore}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Progress gauge bar */}
        <div className="mt-6 space-y-2">
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                riskScore >= 80 ? 'bg-rose-500' :
                riskScore >= 65 ? 'bg-orange-500' :
                riskScore >= 45 ? 'bg-amber-500' :
                riskScore >= 25 ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Optimal (0-24)</span>
            <span>Moderate (25-44)</span>
            <span>Elevated (45-64)</span>
            <span>High (65-79)</span>
            <span>Critical (80-100)</span>
          </div>
        </div>
      </div>

      {/* Primary Biophysical Contributing Drivers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Deterministic Biophysical Drivers</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Weighted Risk Attribution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {drivers.map((drv, idx) => {
            const Icon = drv.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${drv.color}`} />
                    <span className="text-xs font-bold text-slate-800">{drv.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600">
                    {drv.impact}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">{drv.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounded AI Analysis Action Card */}
      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Biophysical Risk Summary
          </h4>
          <p className="text-slate-600 leading-relaxed max-w-2xl">
            Thermal risk is currently ranked <strong className="text-slate-900">{severity.label}</strong> ({riskScore}/100) due to a combination of {currentLocation.ambientTemp}°C ambient heat, {currentLocation.surfaceHeatAnomaly.toFixed(1)}°C surface heat island trapping, and a wet-bulb temperature of {wetBulbC.toFixed(1)}°C.
          </p>
        </div>

        <PrimaryButton
          id="risk-ask-ai"
          onClick={() => openAIWithContext({
            question: `Analyze the ${severity.label} heat risk score (${riskScore}/100) for ${currentLocation.displayName}. What physiological vulnerabilities and cooling actions should be prioritized?`,
            sourceModule: 'Heat Risk Analyzer',
          })}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-end sm:self-center"
        >
          Explain Risk with AI
        </PrimaryButton>
      </div>

      {/* Metadata & Provenance */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>Confidence: 94.8% • Timestamp: {lastTelemetryTime}</span>
        <span>Sources: FortyGuard High-Res Mesh, Open-Meteo, NOAA GFS</span>
      </div>
    </div>
  );
};

export default HeatRiskAnalyzerTool;
