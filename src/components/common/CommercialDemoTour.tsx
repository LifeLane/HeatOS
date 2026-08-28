import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  TrendingUp,
  Radio,
  FileText,
  Building,
  Compass,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';

export interface DemoStep {
  stepNumber: number;
  id: string;
  tab: string;
  toolId?: string;
  title: string;
  category: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  highlightText: string;
  durationSec: number;
  actionHint: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    id: 'live-state',
    tab: 'dashboard',
    title: 'Live Environmental State',
    category: 'LIVE OBSERVATION',
    badge: '1/10 Live State',
    icon: Flame,
    description:
      'Continuous real-time ingestion of ambient temperature, apparent feels-like heat index, solar insolation, and multi-factor vitality indicators.',
    highlightText: 'Observe live sensor telemetry calibrated at 30-second synchronization intervals.',
    durationSec: 8,
    actionHint: 'Next: FortyGuard Heat Intelligence →',
  },
  {
    stepNumber: 2,
    id: 'fortyguard-heat',
    tab: 'weather',
    title: 'FortyGuard Heat Intelligence',
    category: 'SURFACE ANOMALY',
    badge: '2/10 Thermal Physics',
    icon: Flame,
    description:
      'FortyGuard spatial mesh calculates surface temperature anomalies, urban heat island (UHI) deltas, and biophysical heat stress indices.',
    highlightText: 'Separates measured ambient atmospheric data from modeled surface thermal anomalies.',
    durationSec: 8,
    actionHint: 'Next: Environmental Pulse →',
  },
  {
    stepNumber: 3,
    id: 'environmental-pulse',
    tab: 'dashboard',
    title: 'Environmental Pulse',
    category: 'MULTI-FACTOR VITALITY',
    badge: '3/10 Vitality Score',
    icon: ShieldCheck,
    description:
      'Composite 0-100 environmental index synthesizing Heat Stress, Air Quality, Water/Humidity, and Tree Canopy shading into a unified score.',
    highlightText: 'Expand "What is driving this score?" to inspect positive buffers and stress factors.',
    durationSec: 8,
    actionHint: 'Next: Predictive Forecast →',
  },
  {
    stepNumber: 4,
    id: 'forecast',
    tab: 'forecast',
    title: 'Diurnal Forecast & Exposure Window',
    category: 'PREDICTIVE MODELING',
    badge: '4/10 Forward Trajectory',
    icon: TrendingUp,
    description:
      '48-hour diurnal trajectory modeling isolates the critical peak exposure window (15:00 - 18:00) with confidence-banded solar UV irradiance.',
    highlightText: 'Empowers facilities and operations teams to pre-cool buildings and schedule shifts.',
    durationSec: 8,
    actionHint: 'Next: Living Environmental Map →',
  },
  {
    stepNumber: 5,
    id: 'living-map',
    tab: 'navigation',
    title: 'Living Environmental Map',
    category: 'SPATIAL INTELLIGENCE',
    badge: '5/10 Spatial Mesh',
    icon: Compass,
    description:
      'Interactive microclimate visualization layering FortyGuard urban thermal meshes, air dispersion plumes, and biophysical comfort grids at 10m resolution.',
    highlightText: 'Examine hyper-local temperature variations across concrete, asphalt, and shaded zones.',
    durationSec: 8,
    actionHint: 'Next: Live Microclimate Inspector →',
  },
  {
    stepNumber: 6,
    id: 'live-inspector',
    tab: 'navigation',
    title: 'Live Inspector Telemetry',
    category: 'MICROCLIMATE TELEMETRY',
    badge: '6/10 Hotspot Isolation',
    icon: Radio,
    description:
      'Clicking any microclimate zone opens the Live Inspector with full telemetry provenance, biophysical drivers, and immediate mitigation actions.',
    highlightText: 'Isolates acute thermal anomalies (+3.8°C) in urban canyons with low canopy shading.',
    durationSec: 8,
    actionHint: 'Next: Spatial Alert Monitoring →',
  },
  {
    stepNumber: 7,
    id: 'alert-monitoring',
    tab: 'alerts',
    title: 'Spatial Surveillance & Alerts',
    category: 'SURVEILLANCE & ALERTS',
    badge: '7/10 Spatial Watchdog',
    icon: ShieldCheck,
    description:
      'Continuous 6-channel surveillance stream for Heat, Air, Water, Wind, Precipitation, and Anomalies with user-configurable custom alert thresholds.',
    highlightText: 'Monitors spatial thresholds 24/7 with zero false-positive anomaly filtering.',
    durationSec: 8,
    actionHint: 'Next: Intelligence Workbench →',
  },
  {
    stepNumber: 8,
    id: 'tools',
    tab: 'tools',
    title: 'Environmental Workbench & Tools',
    category: 'MODULAR WORKBENCH',
    badge: '8/10 Analysis Suite',
    icon: Layers,
    description:
      'Comprehensive 7-category catalog spanning Observe, Analyze, Predict, Monitor, Act, Explore, and Enterprise Business intelligence applications.',
    highlightText: 'Purpose-built tools for sustainability directors, risk officers, and facilities managers.',
    durationSec: 8,
    actionHint: 'Next: Enterprise Site Monitor →',
  },
  {
    stepNumber: 9,
    id: 'site-monitoring',
    tab: 'tools',
    toolId: 'site-monitor',
    title: 'Enterprise Site Monitoring',
    category: 'BUSINESS RESILIENCE',
    badge: '9/10 Facility Watchdog',
    icon: Building,
    description:
      'Commercial facility surveillance across 6 environmental risk vectors with automated emergency action protocols and live SLA tracking.',
    highlightText: 'Real-time threshold validation for corporate campuses, data centers, and construction sites.',
    durationSec: 8,
    actionHint: 'Next: Operational Environmental Brief →',
  },
  {
    stepNumber: 10,
    id: 'environmental-brief',
    tab: 'tools',
    toolId: 'environmental-brief',
    title: 'Auditable Environmental Brief',
    category: 'OPERATIONAL REPORTING',
    badge: '10/10 Executive Brief',
    icon: FileText,
    description:
      'Standardized 6-section operational brief covering Current Telemetry, Trajectory Changes, Physical Risks, Forecast Exposure, Alerts, and Action Plans.',
    highlightText: 'Auditable operational brief ready for boardroom presentations and compliance archives.',
    durationSec: 9,
    actionHint: 'Complete Demo Tour 🎉',
  },
];

interface CommercialDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialDemoTour: React.FC<CommercialDemoTourProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeTab,
    setActiveTab,
    setSelectedZone,
    setActiveToolId,
  } = useNavigation();

  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext, setIsAIOpen } = useAIAnalyst();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = DEMO_STEPS[currentStepIndex];

  // Apply step actions whenever current step changes
  useEffect(() => {
    if (!isOpen) return;

    const activeStep = DEMO_STEPS[currentStepIndex];
    setSecondsRemaining(activeStep.durationSec);

    // 1. Switch to required tab
    setActiveTab(activeStep.tab as any);

    // 2. Step specific interactions
    if (activeStep.id === 'live-inspector') {
      setSelectedZone({
        id: 'zone-commercial-hotspot',
        name: 'Downtown Commercial Corridor',
        avgTemp: currentLocation.ambientTemp + 3.8,
        surfaceAnomaly: 3.8,
        heatRisk: 'High',
        canopyCoverage: 14,
        aqi: 68,
        coordinates: [currentLocation.coordinates.lat + 0.004, currentLocation.coordinates.lng - 0.003],
        description: 'Dense asphalt and concrete corridor with acute radiative thermal retention (+3.8°C anomaly) and restricted airflow.',
      });
    } else if (activeStep.id === 'living-map') {
      setSelectedZone(null);
    }

    if (activeStep.toolId) {
      setActiveToolId(activeStep.toolId);
    }
  }, [currentStepIndex, isOpen]);

  // Autoplay countdown timer
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next step or loop/finish
          if (currentStepIndex < DEMO_STEPS.length - 1) {
            setCurrentStepIndex((curr) => curr + 1);
            return DEMO_STEPS[currentStepIndex + 1].durationSec;
          } else {
            setIsPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const Icon = step.icon;
  const progressPercent = ((currentStepIndex + 1) / DEMO_STEPS.length) * 100;

  return (
    <div
      id="commercial-demo-tour-banner"
      className="fixed bottom-16 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 select-none"
    >
      <div className="bg-white/95 backdrop-blur-md border-2 border-blue-600/90 rounded-2xl shadow-[0_12px_40px_rgba(37,99,235,0.2)] p-4 sm:p-5 overflow-hidden">
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header: Badge, Category & Controls */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
              {step.badge}
            </span>
            <span className="text-[10px] font-bold font-mono text-blue-700 uppercase tracking-wide truncate">
              {step.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto-Play Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />}
            </button>

            {/* Close / Exit Demo */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Exit Demo Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 shadow-2xs">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              {step.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {step.description}
            </p>
          </div>
        </div>

        {/* Highlight Callout Box */}
        <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-[11px] text-blue-900 font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="leading-snug">{step.highlightText}</span>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-between gap-1 mb-3.5 px-0.5">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleJumpToStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-6 bg-blue-600'
                  : idx < currentStepIndex
                  ? 'w-2 bg-blue-300'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Step ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-xs font-semibold flex items-center gap-1"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            {isPlaying && (
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {secondsRemaining}s
              </span>
            )}
          </div>

          <button
            id="demo-next-step-btn"
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 group"
          >
            <span>{currentStepIndex === DEMO_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
