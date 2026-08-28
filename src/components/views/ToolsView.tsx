import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  ArrowLeft,
  Sparkles,
  Flame,
  Activity,
  TrendingUp,
  Radio,
  CheckSquare,
  Building2,
  Compass,
  Map,
  Radar,
  MapPin,
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
  Eye,
  ChevronRight,
  Filter,
  X,
  Sliders,
  Maximize2,
  Wind,
  Trees,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { TOOL_CATEGORIES, TOOLS_LIST } from '../tools/toolsData';
import { ToolCategory, ToolDefinition } from '../../types/tools';
import ToolCard from '../tools/ToolCard';
import ToolRenderer from '../tools/ToolRenderer';
import PageContainer from '../ui/PageContainer';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Eye,
  Activity,
  TrendingUp,
  Radio,
  CheckSquare,
  Compass,
  Map,
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
  Trees,
  Wrench,
};

export const ToolsView: React.FC = () => {
  const { activeToolId, activeToolCategory, setActiveToolId, setActiveToolCategory, openTool, closeTool } = useNavigation();
  const { currentLocation, formatTemp } = useLocation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'ALL'>('ALL');

  // Filter tools by search query and category
  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter((tool) => {
      const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleLaunchTool = (tool: ToolDefinition) => {
    openTool(tool.id, tool.category);
  };

  // If a tool is active, render the Workspace layout
  if (activeToolId) {
    const currentTool = TOOLS_LIST.find((t) => t.id === activeToolId);
    const categoryInfo = TOOL_CATEGORIES.find((c) => c.id === currentTool?.category);
    const relatedTools = TOOLS_LIST.filter(
      (t) => t.category === currentTool?.category && t.id !== activeToolId
    );

    const ToolIcon = currentTool ? ICON_MAP[currentTool.iconName] || Wrench : Wrench;

    return (
      <PageContainer className="space-y-6">
        {/* Workspace Breadcrumb & Header Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={closeTool}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#2563EB] transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workbench</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
                Location: <strong className="text-slate-900 font-semibold">{currentLocation.displayName}</strong> ({formatTemp(currentLocation.ambientTemp)})
              </span>
              {currentTool && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200">
                  {currentTool.availability}
                </span>
              )}
            </div>
          </div>

          {currentTool && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl ${categoryInfo?.bgLightClass || 'bg-blue-50'} ${categoryInfo?.colorClass || 'text-[#2563EB]'}`}>
                  <ToolIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      {currentTool.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ENVIRONMENTAL INTELLIGENCE
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    {currentTool.name}
                  </h1>
                  <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
                    {currentTool.description}
                  </p>
                </div>
              </div>

              {/* Related Category Switcher */}
              {relatedTools.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">
                    Related:
                  </span>
                  {relatedTools.slice(0, 3).map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => openTool(rt.id, rt.category)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] border border-slate-200 transition-all cursor-pointer truncate max-w-[140px]"
                      title={rt.name}
                    >
                      {rt.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Tool Component Render */}
        <div className="w-full">
          <ToolRenderer toolId={activeToolId} />
        </div>
      </PageContainer>
    );
  }

  // Workbench Directory Overview
  return (
    <PageContainer className="space-y-6">
      {/* Primary Workbench Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                TOOLS
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                HeatOS Core Workbench
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Environmental Intelligence Workbench
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Observe, analyze, predict and act on environmental conditions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
            <span>Location: <strong className="text-slate-900 font-bold">{currentLocation.displayName}</strong></span>
          </div>
        </div>

        {/* Search Field: Concise, unclipped placeholder */}
        <div className="pt-1">
          <div className="relative max-w-lg w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9.5 pr-9 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Tabs Bar: Horizontally scrollable on mobile without expanding page width */}
      <div className="space-y-2.5 max-w-full overflow-hidden">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Filter By Domain
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredTools.length} of {TOOLS_LIST.length} Instruments
          </span>
        </div>

        <div className="relative max-w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none w-full overscroll-x-contain">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90'
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${selectedCategory === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {TOOLS_LIST.length}
              </span>
            </button>

            {TOOL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const CatIcon = ICON_MAP[cat.iconName] || Wrench;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? `${cat.bgLightClass} ${cat.colorClass} border-2 ${cat.borderClass} shadow-2xs`
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                    {cat.toolsCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Structured Category Sections */}
      {selectedCategory === 'ALL' && !searchQuery ? (
        <div className="space-y-8">
          {TOOL_CATEGORIES.map((category, index) => {
            const catTools = TOOLS_LIST.filter((t) => t.category === category.id);
            const CatIcon = ICON_MAP[category.iconName] || Wrench;

            return (
              <div key={category.id} className="space-y-3.5">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/90">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${category.bgLightClass} ${category.colorClass}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {index + 1}.
                        </span>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                          {category.label}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {catTools.length} TOOLS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {category.tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtle Value Card for Business Domain */}
                {category.id === 'BUSINESS' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                        FOR PEOPLE
                      </span>
                      <p className="text-slate-600 font-medium">
                        Understand environmental conditions around you.
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                        FOR PLACES
                      </span>
                      <p className="text-slate-600 font-medium">
                        Monitor environmental conditions across locations.
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 block">
                        FOR BUSINESSES
                      </span>
                      <p className="text-slate-600 font-medium">
                        Monitor sites, risks and environmental changes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Grid using ToolCard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {catTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      categoryInfo={category}
                      onLaunch={handleLaunchTool}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Filtered Search Results Grid */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const catInfo = TOOL_CATEGORIES.find((c) => c.id === tool.category);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  categoryInfo={catInfo}
                  onLaunch={handleLaunchTool}
                />
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No matching instruments found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No tools matched "{searchQuery}". Try searching for terms like "scan", "risk", "trend", "monitor", or "brief".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-[#2563EB] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default ToolsView;
