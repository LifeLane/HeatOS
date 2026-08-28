import React from 'react';
import {
  ChevronRight,
  Lock,
  Sparkles,
  ExternalLink,
  Wrench,
  Eye,
  Activity,
  TrendingUp,
  Radio,
  CheckSquare,
  Compass,
  Building2,
  Radar,
  MapPin,
  Flame,
  ShieldAlert,
  GitCompare,
  Zap,
  CloudSun,
  FlaskConical,
  Clock,
  BellPlus,
  Building,
  Layers,
  FileText,
  Sparkle,
  SplitSquareVertical,
  History,
  Database,
  BookOpen,
  Wind,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { ToolDefinition, ToolCategoryInfo } from '../../types/tools';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Eye,
  Activity,
  TrendingUp,
  Radio,
  CheckSquare,
  Compass,
  Building2,
  Radar,
  MapPin,
  Flame,
  ShieldAlert,
  GitCompare,
  Zap,
  Sparkles,
  CloudSun,
  FlaskConical,
  Clock,
  BellPlus,
  Building,
  Layers,
  FileText,
  Sparkle,
  SplitSquareVertical,
  History,
  Database,
  BookOpen,
  Wind,
  Sliders,
  Maximize2,
  Wrench,
};

interface ToolCardProps {
  tool: ToolDefinition;
  categoryInfo?: ToolCategoryInfo;
  onLaunch: (tool: ToolDefinition) => void;
  idPrefix?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  categoryInfo,
  onLaunch,
  idPrefix = 'tool-card',
}) => {
  const Icon = ICON_MAP[tool.iconName] || Wrench;
  const isComingSoon = tool.availability === 'COMING SOON';

  const statusBadge = () => {
    if (isComingSoon) {
      return (
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-500 border border-slate-200 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-slate-400" />
          <span>COMING SOON</span>
        </span>
      );
    }
    if (tool.availability === 'LIVE') {
      return (
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </span>
      );
    }
    if (tool.availability === 'ACTIVE') {
      return (
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200/80">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        READY
      </span>
    );
  };

  return (
    <div
      id={`${idPrefix}-${tool.id}`}
      className={`group relative flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 select-none ${
        isComingSoon
          ? 'bg-slate-50/70 border-slate-200/90 border-dashed opacity-85 cursor-not-allowed'
          : 'bg-white border-slate-200/90 hover:border-blue-400/80 hover:shadow-md cursor-pointer active:scale-[0.99]'
      }`}
      onClick={() => {
        if (!isComingSoon) {
          onLaunch(tool);
        }
      }}
    >
      <div>
        {/* Card Header: Icon & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 shadow-2xs ${
              isComingSoon
                ? 'bg-slate-100 text-slate-400'
                : `${categoryInfo?.bgLightClass || 'bg-blue-50'} ${categoryInfo?.colorClass || 'text-[#2563EB]'} group-hover:scale-105`
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isFeatured && !isComingSoon && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                FEATURED
              </span>
            )}
            {statusBadge()}
          </div>
        </div>

        {/* Name & One-line Purpose */}
        <h4
          className={`text-xs xs:text-sm font-black uppercase tracking-tight leading-snug transition-colors ${
            isComingSoon
              ? 'text-slate-600'
              : 'text-slate-900 group-hover:text-[#2563EB]'
          }`}
        >
          {tool.name}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed font-normal">
          {tool.description}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {tool.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isComingSoon
                    ? 'text-slate-400 bg-slate-100/80 border-slate-200'
                    : 'text-slate-500 bg-slate-50 border-slate-200/80'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action Footer: Clean [Open] / [Launch] Action */}
      <div className="pt-3 mt-3 border-t border-slate-100/90 flex items-center justify-between text-xs font-bold">
        {isComingSoon ? (
          <div className="flex items-center justify-between w-full text-slate-400 font-mono text-[10.5px]">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>In Roadmap</span>
            </div>
            <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">v2.4</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-slate-600 text-xs font-semibold group-hover:text-slate-900">
              Interactive Workbench
            </span>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 group-hover:bg-[#2563EB] text-[#2563EB] group-hover:text-white transition-all shadow-2xs">
              <span className="text-xs font-bold">Open</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolCard;
