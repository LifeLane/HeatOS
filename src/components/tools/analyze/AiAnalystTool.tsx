import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import { AiAnalystService } from '../../../services/aiAnalystService';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const AiAnalystTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const [prompt, setPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'framework' | 'custom'>('framework');

  const frameworkQuestions = [
    {
      step: '1',
      title: 'WHAT IS HAPPENING?',
      desc: 'Immediate biophysical state breakdown across heat, air, solar, and nature.',
      query: `Explain what is happening right now in ${currentLocation.displayName} based on ambient temp (${currentLocation.ambientTemp}°C), surface anomaly (+${currentLocation.surfaceHeatAnomaly}°C), and AQI (${currentLocation.aqi}).`,
    },
    {
      step: '2',
      title: 'WHY IS IT HAPPENING?',
      desc: 'Causal mechanisms, urban heat island absorption, and atmospheric pressure systems.',
      query: `Why is the current heat and environmental condition occurring in ${currentLocation.displayName}? What are the primary physical drivers?`,
    },
    {
      step: '3',
      title: 'WHAT CHANGED?',
      desc: 'Variance from baseline, thermal drift, and recent diurnal shifts.',
      query: `What has changed in the environmental state of ${currentLocation.displayName} over the past 24 hours?`,
    },
    {
      step: '4',
      title: 'WHAT HAPPENS NEXT?',
      desc: 'Diurnal peak trajectory, heat index outlook, and evening cooling rates.',
      query: `What happens next in the diurnal forecast cycle for ${currentLocation.displayName}? When is the peak heat stress window?`,
    },
    {
      step: '5',
      title: 'WHAT SHOULD I WATCH?',
      desc: 'Key trigger thresholds, wet-bulb limits, and outdoor exposure boundaries.',
      query: `What critical environmental thresholds and indicators should be watched today in ${currentLocation.displayName}?`,
    },
    {
      step: '6',
      title: 'WHAT SHOULD I DO?',
      desc: 'Targeted operational protocols for facilities, public health, and outdoor activities.',
      query: `What specific mitigation and protective actions should be executed today in ${currentLocation.displayName}?`,
    },
  ];

  const handleLaunchQuery = (q: string) => {
    openAIWithContext({
      question: q,
      sourceModule: 'AI Environmental Analyst Tool',
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    handleLaunchQuery(prompt);
    setPrompt('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                AI Environmental Analyst
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-[#2563EB] rounded-full border border-blue-200">
                Grounded Reasoning
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by the 6-Question Environmental Diagnosis Framework for <span className="font-semibold text-slate-700">{currentLocation.displayName}</span>
            </p>
          </div>
        </div>

        <PrimaryButton
          id="open-full-ai-modal"
          onClick={() => handleLaunchQuery(`Provide a full 6-question comprehensive environmental diagnosis for ${currentLocation.displayName}.`)}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-start sm:self-center flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Diagnosis</span>
        </PrimaryButton>
      </div>

      {/* 6-Question Framework Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">The 6-Question Intelligence Framework</h3>
          <span className="text-[11px] font-mono text-slate-400">Click any card to launch grounded AI inquiry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {frameworkQuestions.map((fq) => (
            <div
              key={fq.step}
              onClick={() => handleLaunchQuery(fq.query)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100">
                    STEP {fq.step}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                  {fq.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{fq.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-[#2563EB] flex items-center gap-1">
                <span>Launch Analysis</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Inquiry Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Custom Environmental Inquiry</h3>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask anything about ${currentLocation.displayName}'s heat, air quality, canopy, or forecast...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
          <PrimaryButton
            id="submit-ai-prompt"
            type="submit"
            disabled={!prompt.trim()}
            className="text-xs py-2.5 px-4 flex items-center gap-1.5 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default AiAnalystTool;
