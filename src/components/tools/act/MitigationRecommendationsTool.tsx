import React from 'react';
import {
  Trees,
  Layers,
  Sparkles,
  Droplets,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';

export const MitigationRecommendationsTool: React.FC = () => {
  const { currentLocation } = useLocation();
  const { openAIWithContext } = useAIAnalyst();

  const strategies = [
    {
      title: 'High-Albedo Reflective Pavement & Cool Roofs',
      cooling: 'Up to -3.2°C surface reduction',
      cost: 'Medium ($$)',
      timeline: '2-4 weeks',
      desc: 'Deploy high-reflectance coatings on asphalt parking and dark flat commercial roofs to reduce thermal absorption.',
      tag: 'Surface Albedo',
    },
    {
      title: 'Targeted Urban Tree Canopy Expansion',
      cooling: 'Up to -4.5°C localized ambient cooling',
      cost: 'Low-Medium ($)',
      timeline: '1-3 months',
      desc: 'Plant native drought-resistant shade trees along priority pedestrian corridors with high solar exposure.',
      tag: 'Nature-Based',
    },
    {
      title: 'Active Misting & Evaporative Shade Pavilions',
      cooling: 'Immediate -5.0°C micro-cooling',
      cost: 'Low ($)',
      timeline: '1-2 days',
      desc: 'Deploy low-water high-pressure atomization misting in transit hubs and public squares during peak heat windows.',
      tag: 'Immediate Ops',
    },
    {
      title: 'Thermal Mass Decoupling & Shading Structures',
      cooling: 'Up to -2.8°C radiant temperature drop',
      cost: 'Medium ($$)',
      timeline: '2-6 weeks',
      desc: 'Install cantilevered solar canopies and vertical green facades on uninsulated concrete walls.',
      tag: 'Structural',
    },
  ];

  return (
    <div id="mitigation-recommendations-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Trees className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Heat Mitigation & Adaptation Recommendations
                </h2>
                <p className="text-xs text-slate-500">
                  Targeted urban cooling strategies tailored for {currentLocation.displayName}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              openAIWithContext({
                triggerSource: 'tools',
                toolId: 'mitigation-recommendations',
                headline: `Mitigation Plan for ${currentLocation.displayName}`,
                summary: `Generating cooling interventions for surface anomaly +${currentLocation.surfaceHeatAnomaly}°C.`,
                location: currentLocation.name,
              })
            }
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Mitigation Advisor</span>
          </button>
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((s, idx) => (
            <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {s.tag}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {s.cooling}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200/60">
                <span>Cost: <strong className="text-slate-800">{s.cost}</strong></span>
                <span>Timeline: <strong className="text-slate-800">{s.timeline}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MitigationRecommendationsTool;
