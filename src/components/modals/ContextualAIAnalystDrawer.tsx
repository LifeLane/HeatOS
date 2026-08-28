import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  MapPin,
  Flame,
  Thermometer,
  Wind,
  Droplets,
  TreeDeciduous,
  Sliders,
} from 'lucide-react';
import { useAIAnalyst } from '../../context/AIAnalystContext';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import { AiAnalystService } from '../../services/aiAnalystService';
import {
  AIPersona,
  AISkill,
  AIAnalysisResponse,
} from '../../server/ai/types';
import StatusPill from '../ui/StatusPill';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

export const ContextualAIAnalystDrawer: React.FC = () => {
  const { isAIDrawerOpen, closeAIDrawer, activeContext } = useAIAnalyst();
  const { currentLocation, formatTemp, tempUnit } = useLocation();
  const { setActiveTab, setSelectedZone, setIsInspectorOpen } = useNavigation();

  const [prompt, setPrompt] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | undefined>(undefined);
  const [selectedSkill, setSelectedSkill] = useState<AISkill | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize prompt when active context changes (populate query without aggressive background execution unless explicitly provided)
  useEffect(() => {
    if (activeContext?.question) {
      setPrompt(activeContext.question);
      // Run analysis when user explicitly triggered an "Ask AI" button from a specific card
      runAnalysis(activeContext.question);
    } else if (isAIDrawerOpen && !analysis) {
      const defaultQuestion = `Explain the primary environmental factors and urban heat island effects currently in ${currentLocation.displayName}.`;
      setPrompt(defaultQuestion);
      // Do not run automatically on plain drawer opening; user can click 'Ask AI' or press Enter
    }
  }, [activeContext, isAIDrawerOpen]);

  const runAnalysis = async (queryText?: string) => {
    const textToRun = queryText || prompt;
    if (!textToRun.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await AiAnalystService.analyze({
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        locationName: currentLocation.name,
        prompt: textToRun,
        preferredPersona: selectedPersona,
        preferredSkill: selectedSkill,
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate environmental AI analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (actionType: string) => {
    closeAIDrawer();
    if (actionType === 'VIEW_MAP') {
      setActiveTab('navigation');
    } else if (actionType === 'VIEW_FORECAST') {
      setActiveTab('forecast');
    } else if (actionType === 'VIEW_EVENT') {
      setActiveTab('alerts');
    } else {
      setActiveTab('navigation');
    }
  };

  if (!isAIDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  HeatOS Nature Analyst AI
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB]">
                  GROUNDED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grounded environmental intelligence for {currentLocation.displayName}
              </p>
            </div>
          </div>
          <button
            onClick={closeAIDrawer}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close AI Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input Section */}
        <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAnalysis();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Nature Analyst about heat, weather, risk, or microclimates..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>

          {/* Quick Context Question Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 scrollbar-none">
            {[
              'Why does it feel hotter than the temperature?',
              'What is the 3-hour heat island trajectory?',
              'How can urban heat risk be mitigated here?',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(q);
                  runAnalysis(q);
                }}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Content / Analysis Output */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                Synthesizing Environmental Telemetry...
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                Querying FortyGuard thermal mesh, synoptic NOAA data, EPA AQI, and Copernicus canopy density.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div className="flex-1">
                <div className="font-bold mb-0.5">HeatOS Intelligence is temporarily unavailable.</div>
                <div className="text-amber-800 mb-2">Your environmental telemetry is still available. Retry the analysis.</div>
                {error && <div className="text-[10px] text-amber-700/80 font-mono mb-2 hidden">Details: {error}</div>}
                <button
                  onClick={() => runAnalysis()}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {!isLoading && analysis && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Persona attribution header */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs font-bold">
                    AI
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {analysis.personaTitle || analysis.persona}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {analysis.skillTitle || analysis.skill}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono font-bold text-emerald-700">
                    {analysis.confidence}% Confidence
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {analysis.providerModel}
                  </div>
                </div>
              </div>

              {/* 1. Headline & What's Happening */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] mb-1">
                  {analysis.headline || "Environmental Assessment"}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                  {analysis.structure.whatsHappening}
                </p>
              </div>

              {/* 2. Why / Biophysical Drivers */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Biophysical Drivers &amp; Causes
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysis.structure.why}
                </p>
              </div>

              {/* 3. What's Next & What to Do */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    What's Next (Diurnal Outlook)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysis.structure.whatsNext}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                    Action Pathway (Mitigation)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysis.structure.whatToDo}
                  </p>
                </div>
              </div>

              {/* 4. Suggested Action Pathways */}
              {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Action Pathways
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(act.type)}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/30 text-left transition-all group cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB]">
                            {act.label}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Grounding Evidence & Citations */}
              {analysis.citations && analysis.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">
                    Verified Grounding Sources
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.citations.map((cite, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{cite.sourceName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !analysis && !error && (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Grounded Environmental Assistant Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                Click a suggested inquiry above or press &quot;Ask AI&quot; to interpret microclimate drivers and UHI factors for {currentLocation.displayName}.
              </p>
              <button
                type="button"
                onClick={() => runAnalysis()}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Analysis for {currentLocation.displayName}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>HeatOS Nature Analyst • Grounded Intelligence</span>
          <SecondaryButton size="sm" onClick={closeAIDrawer}>
            Close
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default ContextualAIAnalystDrawer;
