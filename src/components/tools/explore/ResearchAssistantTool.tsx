import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  FileText,
  Layers,
  GraduationCap,
  ExternalLink,
  HelpCircle,
  Cpu,
  ArrowRight,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

interface ResearchTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  standard: string;
  equations: string[];
  keyFinding: string;
  query: string;
}

const RESEARCH_TOPICS: ResearchTopic[] = [
  {
    id: 'uhi-physics',
    title: 'Urban Heat Island (UHI) Micro-Advection',
    category: 'Thermal Dynamics',
    summary: 'Surface energy balance models decomposing anthropogenic heat flux, surface emissivity, and thermal admittance in high-density urban canyons.',
    standard: 'Oke (1982) / WMO Guide to Urban Met',
    equations: ['Q* + Q_F = Q_H + Q_E + ΔQ_S'],
    keyFinding: 'Impervious surfaces with albedo < 0.2 increase daytime surface-to-air heat transfer by up to 4.2°C.',
    query: 'Explain the micro-advection and surface energy balance dynamics driving urban heat islands in this microclimate.',
  },
  {
    id: 'wbgt-iso',
    title: 'Wet-Bulb Globe Temperature (WBGT) Physiology',
    category: 'Biometeorology',
    summary: 'Occupational biometeorological indexing measuring combined metabolic thermal strain, natural wet-bulb evaporative potential, and black globe radiant heat.',
    standard: 'ISO 7243 / ACGIH TLV Standard',
    equations: ['WBGT_outdoor = 0.7*T_nw + 0.2*T_g + 0.1*T_a'],
    keyFinding: 'WBGT above 28°C triggers mandatory work-rest cycles for acclimatized personnel; above 32°C physiological heat exhaustion probability exceeds 65%.',
    query: 'What are the physiological heat stress boundaries and WBGT calculations for the current ambient temperature and humidity?',
  },
  {
    id: 'canopy-et',
    title: 'Urban Canopy Evapotranspiration Cooling',
    category: 'Nature-Based Solutions',
    summary: 'Latent heat flux dissipation through plant stomatal transpiration and shading attenuation of shortwave solar radiation.',
    standard: 'Penman-Monteith / FAO-56',
    equations: ['λET = (Δ(R_n - G) + ρ_a*c_p*(e_s - e_a)/r_a) / (Δ + γ(1 + r_s/r_a))'],
    keyFinding: 'Each 10% increase in urban canopy coverage correlates with a 0.8°C to 1.4°C decrease in daytime surface temperatures.',
    query: 'Analyze the cooling impact and latent heat flux of urban canopy coverage for this region.',
  },
  {
    id: 'albedo-mitigation',
    title: 'High-Albedo & Cool Pavement Radiative Forcing',
    category: 'Materials Science',
    summary: 'Solar reflectance index (SRI) modeling on asphalt, concrete, and roof membranes to reduce sensible heat storage and nocturnal re-radiation.',
    standard: 'ASTM E1980 / Cool Roof Rating Council',
    equations: ['SRI = 123.97 - 141.35*χ + 9.655*χ^2'],
    keyFinding: 'Retrofitting pavements with SRI > 50 reduces surface temperatures by 10-15°C and ambient air temperatures by 1.2-2.1°C.',
    query: 'How do high-albedo materials and cool surfaces alter the local radiative forcing and sensible heat storage?',
  },
];

export const ResearchAssistantTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic>(RESEARCH_TOPICS[0]);
  const [customQuery, setCustomQuery] = useState<string>('');

  const handleLaunchTopic = (topic: ResearchTopic) => {
    setSelectedTopic(topic);
    openAIWithContext({
      question: `[Scientific Research Analysis for ${currentLocation.displayName}] ${topic.query} Please ground your scientific answer using HeatOS telemetry (Ambient: ${currentLocation.ambientTemp}°C, Surface Anomaly: +${currentLocation.surfaceHeatAnomaly}°C, Humidity: ${currentLocation.humidity}%, Canopy: ${currentLocation.canopyCoverage}%).`,
      sourceModule: `Research Assistant: ${topic.title}`,
    });
  };

  const handleCustomResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    openAIWithContext({
      question: `[Environmental Physics Inquiry for ${currentLocation.displayName}] ${customQuery}. (Live context: Temp=${currentLocation.ambientTemp}°C, Surface Anomaly=+${currentLocation.surfaceHeatAnomaly}°C, AQI=${currentLocation.aqi}, Canopy=${currentLocation.canopyCoverage}%). Provide a rigorous biophysical explanation.`,
      sourceModule: 'Research Assistant: Custom Scientific Inquiry',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="p-5 bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white border-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-200">
                Scientific Intelligence &amp; Literature Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Environmental Research Assistant
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 max-w-2xl">
              Grounded biometeorological modeling, urban physics literature citations, and scientific validation engines mapped to {currentLocation.displayName}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrimaryButton
              onClick={() => handleLaunchTopic(selectedTopic)}
              className="bg-white text-blue-900 hover:bg-sky-50 shadow-sm font-semibold text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Ask Grounded AI
            </PrimaryButton>
          </div>
        </div>
      </Card>

      {/* Query Search Input Bar */}
      <Card className="p-4">
        <form onSubmit={handleCustomResearch} className="space-y-3">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#2563EB]" />
            Ask a Scientific or Biophysical Question
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={`e.g., "What is the adiabatic lapse rate impact on nocturnal cooling in ${currentLocation.name}?"`}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
            <PrimaryButton type="submit" disabled={!customQuery.trim()} className="text-xs">
              <span>Research</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </PrimaryButton>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Answers are grounded with peer-reviewed biometeorology standards (WMO, ISO 7243, IPCC AR6, NOAA).
          </p>
        </form>
      </Card>

      {/* Main Grid: Research Topics & Selected Reference Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics Index */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Core Biophysical Topics
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {RESEARCH_TOPICS.length} MODULES
            </span>
          </div>

          <div className="space-y-2.5">
            {RESEARCH_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#2563EB] ring-1 ring-[#2563EB]/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-blue-100/60 px-1.5 py-0.5 rounded">
                      {topic.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {topic.standard}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Reference Deep Dive */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                  Scientific Reference Framework
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedTopic.title}
                </h3>
              </div>
              <StatusPill status="optimal" label={selectedTopic.category} />
            </div>

            {/* Abstract */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Theoretical Abstract
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedTopic.summary}
              </p>
            </div>

            {/* Governing Mathematical Formulation */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                Governing Equation &amp; Governing Standard
              </span>
              <div className="p-3 bg-slate-900 text-sky-300 font-mono text-xs rounded-xl overflow-x-auto">
                <code>{selectedTopic.equations.join('\n')}</code>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                Standard: <span className="font-semibold text-slate-700">{selectedTopic.standard}</span>
              </div>
            </div>

            {/* Empirical Findings */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Empirical Literature Consensus
              </span>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs rounded-xl font-medium leading-relaxed">
                {selectedTopic.keyFinding}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                Context: <strong className="text-slate-700">{currentLocation.displayName}</strong> ({formatTemp(currentLocation.ambientTemp)})
              </div>
              <PrimaryButton
                onClick={() => handleLaunchTopic(selectedTopic)}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Execute Grounded Analysis
              </PrimaryButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistantTool;
