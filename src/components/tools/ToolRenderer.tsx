import React from 'react';
// 1. OBSERVE
import { EnvironmentalScanTool } from './observe/EnvironmentalScanTool';
import { LiveEnvironmentTool } from './observe/LiveEnvironmentTool';
import { LocationSnapshotTool } from './observe/LocationSnapshotTool';
import { LocationIntelligenceTool } from './observe/LocationIntelligenceTool';
import { HeatmapTool } from './observe/HeatmapTool';

// 2. ANALYZE
import { HeatRiskAnalyzerTool } from './analyze/HeatRiskAnalyzerTool';
import { EnvironmentalPulseTool } from './analyze/EnvironmentalPulseTool';
import { AirQualityAnalysisTool } from './analyze/AirQualityAnalysisTool';
import { ThermalAnomalyAnalysisTool } from './analyze/ThermalAnomalyAnalysisTool';
import { ChangeDetectorTool } from './analyze/ChangeDetectorTool';
import { AnomalyDetectorTool } from './analyze/AnomalyDetectorTool';
import { AiAnalystTool } from './analyze/AiAnalystTool';

// 3. PREDICT
import { ForecastAnalyzerTool } from './predict/ForecastAnalyzerTool';
import { EnvironmentalTrendTool } from './predict/EnvironmentalTrendTool';
import { ScenarioLabTool } from './predict/ScenarioLabTool';
import { FutureRiskTool } from './predict/FutureRiskTool';
import { PeakFinderTool } from './predict/PeakFinderTool';

// 4. MONITOR
import { CreateMonitorTool } from './monitor/CreateMonitorTool';
import { SavedMonitorsTool } from './monitor/SavedMonitorsTool';
import { ThresholdBuilderTool } from './monitor/ThresholdBuilderTool';
import { AlertBuilderTool } from './act/AlertBuilderTool';
import { MonitoringSetupTool } from './act/MonitoringSetupTool';
import { VulnerabilityAlertsTool } from './monitor/VulnerabilityAlertsTool';

// 5. ACT
import { HeatActionPlanTool } from './act/HeatActionPlanTool';
import { ActionPlannerTool } from './act/ActionPlannerTool';
import { MitigationRecommendationsTool } from './act/MitigationRecommendationsTool';

// 6. EXPLORE
import { ComparePlacesTool } from './explore/ComparePlacesTool';
import { HistoricalExplorerTool } from './explore/HistoricalExplorerTool';
import { LivingMapTool } from './explore/LivingMapTool';
import { RegionalExplorerTool } from './explore/RegionalExplorerTool';
import { DataExplorerTool } from './explore/DataExplorerTool';
import { ResearchAssistantTool } from './explore/ResearchAssistantTool';
import { CoolRouteNavigationTool } from './explore/CoolRouteNavigationTool';
import { UrbanHeatSandboxTool } from './explore/UrbanHeatSandboxTool';

// 7. BUSINESS
import { MySitesTool } from './business/MySitesTool';
import { SiteMonitorTool } from './business/SiteMonitorTool';
import { PortfolioMonitorTool } from './business/PortfolioMonitorTool';
import { EnvironmentalBriefTool } from './business/EnvironmentalBriefTool';
import { RiskReportTool } from './business/RiskReportTool';
import { ExecutiveBriefTool } from './business/ExecutiveBriefTool';

interface ToolRendererProps {
  toolId: string;
}

export const ToolRenderer: React.FC<ToolRendererProps> = ({ toolId }) => {
  switch (toolId) {
    // 1. OBSERVE
    case 'environmental-scan':
      return <EnvironmentalScanTool />;
    case 'live-environment':
      return <LiveEnvironmentTool />;
    case 'location-snapshot':
      return <LocationSnapshotTool />;
    case 'location-intelligence':
      return <LocationIntelligenceTool />;
    case 'heatmap':
      return <HeatmapTool />;

    // 2. ANALYZE
    case 'heat-risk-analyzer':
      return <HeatRiskAnalyzerTool />;
    case 'environmental-pulse':
      return <EnvironmentalPulseTool />;
    case 'air-quality-analysis':
      return <AirQualityAnalysisTool />;
    case 'thermal-anomaly-analysis':
      return <ThermalAnomalyAnalysisTool />;
    case 'change-detector':
      return <ChangeDetectorTool />;
    case 'anomaly-detector':
      return <AnomalyDetectorTool />;
    case 'ai-analyst':
      return <AiAnalystTool />;

    // 3. PREDICT
    case 'forecast-analyzer':
      return <ForecastAnalyzerTool />;
    case 'environmental-trend':
      return <EnvironmentalTrendTool />;
    case 'scenario-explorer':
    case 'scenario-lab':
      return <ScenarioLabTool />;
    case 'future-risk':
      return <FutureRiskTool />;
    case 'peak-finder':
      return <PeakFinderTool />;

    // 4. MONITOR
    case 'create-monitor':
      return <CreateMonitorTool />;
    case 'saved-monitors':
      return <SavedMonitorsTool />;
    case 'threshold-builder':
      return <ThresholdBuilderTool />;
    case 'alert-builder':
      return <AlertBuilderTool />;
    case 'monitoring-setup':
      return <MonitoringSetupTool />;
    case 'vulnerability-alert-system':
      return <VulnerabilityAlertsTool />;

    // 5. ACT
    case 'heat-action-plan':
      return <HeatActionPlanTool />;
    case 'risk-response-planner':
    case 'action-planner':
      return <ActionPlannerTool />;
    case 'mitigation-recommendations':
      return <MitigationRecommendationsTool />;

    // 6. EXPLORE
    case 'compare-locations':
    case 'compare-places':
      return <ComparePlacesTool />;
    case 'environmental-time-machine':
    case 'historical-explorer':
      return <HistoricalExplorerTool />;
    case 'living-map':
      return <LivingMapTool />;
    case 'regional-explorer':
      return <RegionalExplorerTool />;
    case 'data-explorer':
      return <DataExplorerTool />;
    case 'research-assistant':
      return <ResearchAssistantTool />;
    case 'cool-route-navigation':
      return <CoolRouteNavigationTool />;
    case 'urban-heat-sandbox':
      return <UrbanHeatSandboxTool />;

    // 7. BUSINESS
    case 'my-sites':
      return <MySitesTool />;
    case 'site-monitor':
      return <SiteMonitorTool />;
    case 'portfolio-monitor':
    case 'portfolio-view':
      return <PortfolioMonitorTool />;
    case 'environmental-brief':
      return <EnvironmentalBriefTool />;
    case 'risk-report':
      return <RiskReportTool />;
    case 'operational-insights':
    case 'executive-brief':
      return <ExecutiveBriefTool />;

    default:
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium">Tool "{toolId}" is being initialized...</p>
        </div>
      );
  }
};

export default ToolRenderer;
