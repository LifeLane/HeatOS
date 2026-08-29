/**
 * HeatOS Phase 8: Nature Analyst AI Workstation
 * 
 * Interactive environmental intelligence analysis console integrating
 * Personas, Skills, 4-Part Structure, Grounding Citations, and Action Dispatchers.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Leaf,
  CloudSun,
  ShieldAlert,
  Lightbulb,
  BookOpen,
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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Thermometer,
  Wind,
  Droplets,
  TreeDeciduous,
  Sliders,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import { AiAnalystService, QuickQuestionItem } from '../../services/aiAnalystService';
import {
  AIPersona,
  AISkill,
  AIAnalysisResponse,
  PersonaMetadata,
  SkillMetadata,
  AIAction,
} from '../../server/ai/types';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import StatusPill from '../ui/StatusPill';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { FadeIn } from '../motion/MotionPrimitives';
import AIDiagnosticsModal from '../modals/AIDiagnosticsModal';

const PERSONA_CONFIG: Record<
  AIPersona | 'AUTO',
  { name: string; role: string; icon: React.FC<{ className?: string }>; color: string; badge: string }
> = {
  AUTO: {
    name: 'Auto-Route',
    role: 'Chooses the right analytical lens for the question.',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    badge: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  NATURE_ANALYST: {
    name: 'Nature Analyst',
    role: 'Explains environmental and ecological signals.',
    icon: Leaf,
    color: 'bg-emerald-600 text-white',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  CLIMATE_ANALYST: {
    name: 'Climate Analyst',
    role: 'Interprets heat, exposure, and microclimate patterns.',
    icon: CloudSun,
    color: 'bg-sky-600 text-white',
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  RISK_ANALYST: {
    name: 'Risk Analyst',
    role: 'Surfaces hazards, vulnerabilities, and operational risk.',
    icon: ShieldAlert,
    color: 'bg-rose-600 text-white',
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
  },
  RESILIENCE_ADVISOR: {
    name: 'Resilience Advisor',
    role: 'Turns environmental signals into practical responses.',
    icon: Lightbulb,
    color: 'bg-amber-600 text-white',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  SYSTEM_GUIDE: {
    name: 'System Guide',
    role: 'Explains how HeatOS interprets the environment.',
    icon: BookOpen,
    color: 'bg-indigo-600 text-white',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  },
};

export const InsightsView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab } = useNavigation();

  const [selectedPersona, setSelectedPersona] = useState<AIPersona | 'AUTO'>('AUTO');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [showCitations, setShowCitations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  // Quick signature questions
  const quickQuestions: Array<{ key: string; label: string; persona: AIPersona; skill: AISkill }> = [
    { key: 'whats_happening', label: "What's happening here?", persona: 'NATURE_ANALYST', skill: 'analyze_environment' },
    { key: 'what_changed', label: "What changed?", persona: 'NATURE_ANALYST', skill: 'identify_change' },
    { key: 'why_unusual', label: "Why is this area unusual?", persona: 'CLIMATE_ANALYST', skill: 'compare_periods' },
    { key: 'what_to_watch', label: "What should I watch?", persona: 'RISK_ANALYST', skill: 'explain_risk' },
    { key: 'whats_next', label: "What's likely next?", persona: 'CLIMATE_ANALYST', skill: 'analyze_forecast' },
    { key: 'what_to_do', label: "What should I do?", persona: 'RESILIENCE_ADVISOR', skill: 'create_recommendation' },
  ];

  // Explicit user action only - no automatic background calls on mount or location switch
  // User triggers analysis by selecting a persona, clicking a quick question, or submitting a prompt

  const handleRunAnalysis = async (params: {
    prompt?: string;
    quickQuestionKey?: string;
    persona?: AIPersona;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const preferredPersona = params.persona || (selectedPersona !== 'AUTO' ? selectedPersona : undefined);
      const response = await AiAnalystService.analyze({
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        locationName: currentLocation.displayName,
        prompt: params.prompt || userPrompt,
        preferredPersona,
        quickQuestionKey: params.quickQuestionKey,
      });
      setAnalysis(response);
      if (params.prompt) {
        setUserPrompt('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate environmental AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action: AIAction) => {
    switch (action.type) {
      case 'VIEW_MAP':
        setActiveTab('map');
        break;
      case 'VIEW_EVENT':
        setActiveTab('events');
        break;
      case 'VIEW_FORECAST':
        setActiveTab('home');
        break;
      case 'REFRESH_DATA':
        handleRunAnalysis({ quickQuestionKey: 'whats_happening' });
        break;
      case 'CREATE_REPORT':
        handleExportReport();
        break;
      default:
        break;
    }
  };

  const handleExportReport = () => {
    if (!analysis) return;
    const reportText = `# HeatOS Environmental Intelligence Dossier
Location: ${analysis.location.locationName}
Generated: ${new Date(analysis.generatedAt).toLocaleString()}
Analyst Persona: ${analysis.personaTitle}
Skill Executed: ${analysis.skillTitle}
Data Confidence: ${analysis.confidence}%

## HEADLINE
${analysis.headline}

## WHAT'S HAPPENING
${analysis.structure.whatsHappening}

## WHY (PHYSICAL DRIVERS)
${analysis.structure.why}

## WHAT'S NEXT (FORECAST TRAJECTORY)
${analysis.structure.whatsNext}

## WHAT TO DO (ACTIONABLE RECOMMENDATIONS)
${analysis.structure.whatToDo}

## VERIFIED GROUNDING CITATIONS
${analysis.citations.map(c => `- ${c.sourceName} (${c.freshness})`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HeatOS_Analyst_Report_${analysis.location.locationName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotification('Executive Intelligence Brief exported successfully.');
    setTimeout(() => setDownloadNotification(null), 4000);
  };

  return (
    <PageContainer maxWidth="7xl">
      <FadeIn>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                HEATOS AI ANALYST
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                GROUNDED IN LIVE ENVIRONMENTAL SIGNALS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Ask why conditions are changing, what may happen next, and what deserves attention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SecondaryButton
              id="open-ai-diag-btn"
              onClick={() => setIsDiagnosticsOpen(true)}
              size="sm"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Run AI Diagnostics
            </SecondaryButton>
            <PrimaryButton
              id="refresh-ai-analysis-btn"
              onClick={() => handleRunAnalysis({ quickQuestionKey: 'whats_happening' })}
              size="sm"
              isLoading={isLoading}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Poll Telemetry
            </PrimaryButton>
          </div>
        </div>

        {/* Download Notification Banner */}
        {downloadNotification && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{downloadNotification}</span>
            </div>
          </div>
        )}

        {/* Persona Selector Tabs */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Analyst Persona
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Structured Data is Authoritative
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(['AUTO', 'NATURE_ANALYST', 'CLIMATE_ANALYST', 'RISK_ANALYST', 'RESILIENCE_ADVISOR', 'SYSTEM_GUIDE'] as const).map((pKey) => {
              const cfg = PERSONA_CONFIG[pKey];
              const IconComp = cfg.icon;
              const isSelected = selectedPersona === pKey;

              return (
                <button
                  key={pKey}
                  id={`persona-btn-${pKey}`}
                  onClick={() => {
                    setSelectedPersona(pKey);
                    if (pKey !== 'AUTO') {
                      handleRunAnalysis({ persona: pKey });
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold line-clamp-1">{cfg.name}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {cfg.role.split(' ')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Signature Quick Questions Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              Signature Analyst Inquiries
            </span>
            <span className="text-[11px] text-slate-400">Instant Grounded Answers</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q.key}
                id={`quick-q-btn-${q.key}`}
                onClick={() => handleRunAnalysis({ quickQuestionKey: q.key, persona: q.persona })}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>{q.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Executive Query Input Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="ai-analyst-input"
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userPrompt.trim() && !isLoading) {
                    handleRunAnalysis({ prompt: userPrompt });
                  }
                }}
                placeholder="Ask Nature Analyst AI (e.g. 'What is causing the temperature delta in the downtown freight zone?')..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
              />
            </div>
            <PrimaryButton
              id="ai-submit-prompt-btn"
              onClick={() => handleRunAnalysis({ prompt: userPrompt })}
              isLoading={isLoading}
              disabled={!userPrompt.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Analyze
            </PrimaryButton>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Analyst Intelligence Report */}
        {analysis ? (
          <div className="space-y-6">
            {/* Dossier Header Banner */}
            <Card
              variant="default"
              padding="lg"
              className="border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-900 text-white">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold font-mono">
                        {analysis.personaTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200">
                        {analysis.skillTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-200">
                        {analysis.confidence}% Telemetry Grounding
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5">
                      {analysis.headline}
                    </h2>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <div className="text-[11px] font-mono text-slate-400">
                    Engine: {analysis.providerModel}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(analysis.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Key Metrics Snapshot Strip */}
              {analysis.keyMetrics.length > 0 && (
                <div className="py-4 border-b border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Live Telemetry Grounding Evidence
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {analysis.keyMetrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                      >
                        <span className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {metric.label}
                        </span>
                        <div className="flex items-baseline gap-1 my-1">
                          <span className="text-base font-extrabold text-slate-900 font-mono">
                            {metric.value}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {metric.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{metric.delta || 'Nominal'}</span>
                          <span className="truncate max-w-[80px]">{metric.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard 4-Part Structure Cards */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. WHAT'S HAPPENING */}
                <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                        What's Happening
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysis.structure.whatsHappening}
                    </p>
                  </div>
                </div>

                {/* 2. WHY */}
                <div className="p-4 rounded-2xl bg-sky-50/30 border border-sky-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                        Why (Physical Drivers)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysis.structure.why}
                    </p>
                  </div>
                </div>

                {/* 3. WHAT'S NEXT */}
                <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                        What's Next (Trajectory)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysis.structure.whatsNext}
                    </p>
                  </div>
                </div>

                {/* 4. WHAT TO DO */}
                <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-900">
                        What To Do (Action Plan)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysis.structure.whatToDo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Dispatchers & Grounding Citations Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Registered HeatOS Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">
                    HeatOS Actions:
                  </span>
                  {analysis.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      id={`ai-action-btn-${idx}`}
                      onClick={() => handleExecuteAction(action)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                  <button
                    id="export-report-btn"
                    onClick={handleExportReport}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export Brief (MD)</span>
                  </button>
                </div>

                {/* Citations Toggle */}
                <button
                  onClick={() => setShowCitations(!showCitations)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{analysis.citations.length} Verified Sources</span>
                  {showCitations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Citations Drawer */}
              {showCitations && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    Authoritative Telemetry Citations
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.citations.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-start justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{c.sourceName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Parameters: {c.parametersUsed.join(', ')}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                          {c.freshness}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Suggested Follow-Up Questions */}
            {analysis.suggestedQuestions.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-600 mb-2">
                  Suggested Follow-Up Inquiries
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRunAnalysis({ prompt: q })}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center mb-3.5 shadow-sm">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Nature Analyst AI Ready
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                Select an analyst archetype above, choose a signature question, or enter an inquiry to generate an on-demand, telemetry-grounded environmental intelligence report for {currentLocation.displayName}.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleRunAnalysis({ quickQuestionKey: 'whats_happening', persona: 'NATURE_ANALYST' })}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Analyze {currentLocation.displayName} Now</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* AI Diagnostics Modal */}
        <AIDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
        />
      </FadeIn>
    </PageContainer>
  );
};

export default InsightsView;
