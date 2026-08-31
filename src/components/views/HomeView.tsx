import React, { useState, useEffect } from 'react';
import {
  Flame,
  Wind,
  Droplets,
  Trees,
  Sun,
  AlertTriangle,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  MapPin,
  RefreshCw,
  Layers,
  Database,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useNavigation } from '../../context/NavigationContext';
import { useExplanation } from '../../context/ExplanationContext';
import { EnvironmentalCategory, StatusSeverity, SpatialZone } from '../../types';
import PageContainer from '../ui/PageContainer';
import Section from '../ui/Section';
import Card from '../ui/Card';
import MetricCard from '../ui/MetricCard';
import StatusPill from '../ui/StatusPill';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { CardEntrance, FadeIn, NumberCounter } from '../motion/MotionPrimitives';
import { SourceAttributionBadge } from '../common/SourceAttributionBadge';
import { NaturePulseCard } from '../pulse/NaturePulseCard';
import { naturePulseApi } from '../../services/naturePulseApi';
import { NaturePulseResult } from '../../types/naturePulse';

export const HomeView: React.FC = () => {
  const { currentLocation, formatTemp, tempUnit, lastTelemetryTime } = useLocation();
  const { connection, reconnect, isSyncing } = useFortyGuard();
  const { setActiveTab, setSelectedZone, setIsInspectorOpen, setIsFortyGuardModalOpen, setIsFabricModalOpen } = useNavigation();
  const explanation = useExplanation();

  // Phase 5: Nature Pulse State
  const [pulse, setPulse] = useState<NaturePulseResult | null>(null);
  const [pulseLoading, setPulseLoading] = useState<boolean>(true);

  // Fetch synthesized Nature Pulse
  const fetchPulse = async () => {
    try {
      setPulseLoading(true);
      const data = await naturePulseApi.getPulse({
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        locationName: currentLocation.name,
        stateCode: currentLocation.stateCode,
        countryCode: currentLocation.countryCode,
      });
      setPulse(data);
    } catch (err) {
      console.error('Error fetching Nature Pulse:', err);
    } finally {
      setPulseLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, [currentLocation.id, currentLocation.coordinates.lat, currentLocation.coordinates.lng]);

  // Environmental pillar data calculated dynamically based on current selected location
  const environmentalPillars = [
    {
      metricKey: 'heat_island',
      id: 'pillar-heat',
      label: 'Surface Heat Anomaly',
      source: 'fortyguard',
      sourceName: 'FortyGuard Thermal Mesh',
      license: 'Commercial License',
      value: `${currentLocation.surfaceHeatAnomaly > 0 ? '+' : ''}${currentLocation.surfaceHeatAnomaly.toFixed(1)}°`,
      unit: tempUnit === 'C' ? 'C' : 'F',
      category: 'heat' as EnvironmentalCategory,
      status: (currentLocation.surfaceHeatAnomaly > 4
        ? 'critical'
        : currentLocation.surfaceHeatAnomaly > 2
        ? 'warning'
        : 'optimal') as StatusSeverity,
      statusLabel: currentLocation.surfaceHeatAnomaly > 2 ? 'Elevated Heat Island' : 'Normal Baseline',
      delta: '+0.4°',
      deltaType: 'up' as const,
      deltaLabel: 'vs 24h baseline',
      sparkline: [2.1, 2.3, 2.8, 3.2, 3.8, 4.2, 3.9, 3.4, 2.8],
      description: 'Thermal inertia across urban corridors',
    },
    {
      metricKey: 'air_quality',
      id: 'pillar-air',
      label: 'Air Quality Index',
      source: 'epa_airnow',
      sourceName: 'EPA AirNow',
      license: 'Public Domain',
      value: currentLocation.aqi,
      unit: 'AQI',
      category: 'air' as EnvironmentalCategory,
      status: (currentLocation.aqi > 100
        ? 'critical'
        : currentLocation.aqi > 50
        ? 'moderate'
        : 'optimal') as StatusSeverity,
      statusLabel: currentLocation.aqi > 50 ? 'Moderate Particle Density' : 'Clean / Good',
      delta: '-4',
      deltaType: 'down' as const,
      deltaLabel: 'last 3 hours',
      sparkline: [48, 46, 44, 42, 40, 38, 39, 38],
      description: 'Particulate matter PM2.5 & PM10 levels',
    },
    {
      metricKey: 'humidity',
      id: 'pillar-water',
      label: 'Ambient Moisture & Vapor',
      source: 'noaa_nws',
      sourceName: 'NOAA NWS',
      license: 'Public Domain',
      value: currentLocation.humidity,
      unit: '%',
      category: 'water' as EnvironmentalCategory,
      status: (currentLocation.humidity > 75
        ? 'warning'
        : currentLocation.humidity < 20
        ? 'warning'
        : 'optimal') as StatusSeverity,
      statusLabel: 'Equilibrium',
      delta: '+2%',
      deltaType: 'up' as const,
      deltaLabel: 'diurnal swing',
      sparkline: [52, 54, 55, 56, 58, 60, 58],
      description: 'Vapor pressure deficit & transpiration',
    },
    {
      id: 'pillar-nature',
      label: 'Urban Canopy Index',
      source: 'satellite_vegetation',
      sourceName: 'Copernicus Sentinel-2',
      license: 'CC-BY',
      value: currentLocation.canopyCoverage,
      unit: '%',
      category: 'nature' as EnvironmentalCategory,
      status: 'optimal' as StatusSeverity,
      statusLabel: 'Active Buffer',
      delta: '+1.2%',
      deltaType: 'neutral' as const,
      deltaLabel: 'coverage target',
      sparkline: [20, 20, 21, 21, 22, 22, 22],
      description: 'Tree foliage shade and micro-evaporation',
    },
    {
      id: 'pillar-solar',
      label: 'Solar Insolation',
      source: 'noaa_nws',
      sourceName: 'NOAA Weather Models',
      license: 'Public Domain',
      value: currentLocation.solarIrradiance,
      unit: 'W/m²',
      category: 'solar' as EnvironmentalCategory,
      status: 'moderate' as StatusSeverity,
      statusLabel: 'Peak Exposure',
      delta: '+45',
      deltaType: 'up' as const,
      deltaLabel: 'peak irradiance',
      sparkline: [210, 380, 540, 680, 720, 680, 590],
      description: 'Direct & diffuse thermal radiation',
    },
    {
      id: 'pillar-fire',
      label: 'Microclimate Fire Risk',
      source: 'nasa_firms',
      sourceName: 'NASA FIRMS',
      license: 'Public Domain',
      value: 'Low',
      unit: '',
      category: 'fire' as EnvironmentalCategory,
      status: 'optimal' as StatusSeverity,
      statusLabel: 'Guarded',
      delta: 'Stable',
      deltaType: 'neutral' as const,
      deltaLabel: 'thermal hotspots 0',
      sparkline: [12, 12, 14, 15, 14, 13, 12],
      description: 'Combustion vulnerability & hotspot count',
    },
  ];

  // Featured spatial hot-zone for quick overview
  const featuredZone: SpatialZone = {
    id: 'zone-downtown-heat',
    name: `${currentLocation.name} Midtown Grid`,
    district: 'Urban Core Dense Corridor',
    heatSeverity: currentLocation.surfaceHeatAnomaly > 3 ? 'high' : 'moderate',
    surfaceTemp: currentLocation.ambientTemp + 4.2,
    canopyCover: 14,
    heatIslandFactor: currentLocation.surfaceHeatAnomaly,
    activeSensors: 42,
    coordinates: [currentLocation.coordinates.lat, currentLocation.coordinates.lng],
    riskLevel: 'Elevated Thermal Stress',
    recommendedAction: 'Increase misting stations, optimize transit shade shelters, and prioritize reflective pavement coatings.',
  };

  const handleInspectZone = () => {
    setSelectedZone(featuredZone);
    setIsInspectorOpen(true);
  };

  return (
    <PageContainer maxWidth="7xl">
      <FadeIn>
        {/* Top Spatial Environmental State Hero */}
        <div className="mb-6 sm:mb-8">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-7 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] relative overflow-hidden">
            {/* Background subtle radial glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Environmental overview */}
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    ENVIRONMENTAL INTELLIGENCE OPERATING SYSTEM
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Signal Synced {lastTelemetryTime}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    See the environment as a system.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    HeatOS synthesizes real-world environmental signals into a contextual state that helps people understand conditions, detect change and make informed decisions.
                  </p>
                </div>

                {/* Microclimate key facts */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => explanation.explainMetric('ambientTemp', formatTemp(currentLocation.ambientTemp))}
                    className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors"
                    title="Click to explain ambient temperature"
                  >
                    <span className="text-slate-600">Ambient Temp:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatTemp(currentLocation.ambientTemp)}
                    </span>
                    <span className="text-xs text-slate-600 font-normal">
                      (Perceived {formatTemp(currentLocation.apparentTemp)})
                    </span>
                  </button>

                  <div className="h-3 w-[1px] bg-slate-200" />

                  <button
                    type="button"
                    onClick={() => explanation.explainMetric('thermalComfortIndex', `${currentLocation.thermalComfortIndex} / 100`)}
                    className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors"
                    title="Click to explain environmental pulse index"
                  >
                    <span className="text-slate-600">Environmental Pulse:</span>
                    <span className="font-mono font-bold text-[#2563EB]">
                      <NumberCounter value={currentLocation.thermalComfortIndex} /> / 100
                    </span>
                  </button>

                  <div className="h-3 w-[1px] bg-slate-200 hidden xs:block" />

                  <button
                    type="button"
                    onClick={() =>
                      explanation.explainAIInsight(
                        'Active Sensor Nodes',
                        `Active IoT edge monitoring nodes for ${currentLocation.name}.`,
                        [
                          `Active nodes: ${currentLocation.activeSensors} reporting in real-time`,
                          `Sensors: Heat, humidity, PM2.5 AQI, and thermal infrared sensors`,
                          `Network state: Optimal`,
                        ]
                      )
                    }
                    className="flex items-center gap-1.5 hidden xs:flex hover:text-emerald-700 cursor-pointer transition-colors"
                    title="Click to explain active sensors"
                  >
                    <span className="text-slate-600">Active Sensors:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {currentLocation.activeSensors} nodes
                    </span>
                  </button>
                </div>
              </div>

              {/* Right: Quick Spatial Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
                <PrimaryButton
                  id="home-explore-map-btn"
                  size="md"
                  onClick={() => setActiveTab('map')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Explore Live State
                </PrimaryButton>
                <SecondaryButton
                  id="home-ask-heatos-btn"
                  size="md"
                  variant="outline"
                  onClick={() => setActiveTab('ai')}
                  icon={<Sparkles className="w-4 h-4 text-purple-600" />}
                >
                  Ask HeatOS
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 5: Nature Pulse Intelligence Section */}
        <div className="mb-8">
          <NaturePulseCard
            pulse={pulse}
            loading={pulseLoading}
            onRefresh={fetchPulse}
          />
        </div>

        {/* Combined Thermal Core & Open Data Fabric Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* FortyGuard Primary Thermal Intelligence */}
          <Card
            variant="default"
            padding="md"
            className="border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      FortyGuard Thermal Core
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                      PRIMARY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    1m–10m resolution urban heat island analytics &amp; thermal risk scoring.
                  </p>
                </div>
              </div>

              <SecondaryButton
                id="home-manage-fortyguard-btn"
                size="sm"
                variant="outline"
                onClick={() => setIsFortyGuardModalOpen(true)}
              >
                Telemetry
              </SecondaryButton>
            </div>
          </Card>

          {/* Open Environmental Data Fabric */}
          <Card
            variant="default"
            padding="md"
            className="border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Open Environmental Fabric
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      6 SOURCES SYNCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    NOAA synoptic weather, EPA AQI, NASA FIRMS, Copernicus NDVI &amp; USGS water.
                  </p>
                </div>
              </div>

              <SecondaryButton
                id="home-manage-fabric-btn"
                size="sm"
                variant="outline"
                onClick={() => setIsFabricModalOpen(true)}
                icon={<Database className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Fabric
              </SecondaryButton>
            </div>
          </Card>
        </div>

        {/* Environmental Streams Matrix (6 Pillars) */}
        <Section
          id="environmental-streams-section"
          title="Environmental Intelligence Pillars"
          subtitle="Continuous spatial signals categorized into core environmental dimensions with explicit source attributions."
          action={
            <button
              id="view-all-events-action"
              onClick={() => setActiveTab('events')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
            >
              <span>View Incident Log</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
            {environmentalPillars.map((pillar, idx) => (
              <CardEntrance key={pillar.id} index={idx}>
                <div className="relative group">
                  <MetricCard
                    id={`metric-${pillar.id}`}
                    label={pillar.label}
                    value={pillar.value}
                    unit={pillar.unit}
                    category={pillar.category}
                    status={pillar.status}
                    statusLabel={pillar.statusLabel}
                    delta={pillar.delta}
                    deltaType={pillar.deltaType}
                    deltaLabel={pillar.deltaLabel}
                    sparkline={pillar.sparkline}
                    description={pillar.description}
                    metricKey={pillar.metricKey}
                  />
                  <div className="mt-1.5 flex items-center justify-between px-1">
                    <SourceAttributionBadge
                      source={pillar.source}
                      attribution={{
                        name: pillar.sourceName,
                        license: pillar.license,
                        credit: pillar.sourceName,
                        url: '#',
                      }}
                    />
                  </div>
                </div>
              </CardEntrance>
            ))}
          </div>
        </Section>

        {/* Spatial Highlight & Operating Framework Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Spatial Hot-Zone Card */}
          <div className="lg:col-span-2">
            <Card variant="default" padding="lg" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Spatial Thermal Anomaly Spotlight
                    </span>
                  </div>
                  <StatusPill status="warning" label="Thermal Island Spike" size="sm" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {featuredZone.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                  FortyGuard sensor clusters detected a +{featuredZone.heatIslandFactor}°C heat island deviation in this asphalt-dense district. Low canopy coverage ({featuredZone.canopyCover}%) reduces natural evaporative cooling.
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4 text-center">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-600 uppercase">Surface</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-slate-900">
                      {formatTemp(featuredZone.surfaceTemp)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-600 uppercase">Canopy</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-emerald-700">
                      {featuredZone.canopyCover}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-600 uppercase">Sensors</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-[#2563EB]">
                      {featuredZone.activeSensors}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-mono">
                  Coordinates: {currentLocation.coordinates.lat.toFixed(3)}, {currentLocation.coordinates.lng.toFixed(3)}
                </span>
                <PrimaryButton
                  id="inspect-featured-zone-btn"
                  size="sm"
                  onClick={handleInspectZone}
                >
                  Inspect Zone
                </PrimaryButton>
              </div>
            </Card>
          </div>

          {/* Operating Principle / Framework Card */}
          <div className="lg:col-span-1">
            <Card variant="muted" padding="lg" className="h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  Product Operating Principle
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  From Telemetry to Environmental Action
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <span className="font-bold text-slate-800">1. SEE &amp; UNDERSTAND</span>
                    <span className="text-[11px] text-slate-600">Spatial telemetry</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <span className="font-bold text-slate-800">2. DETECT &amp; EXPLAIN</span>
                    <span className="text-[11px] text-slate-600">FortyGuard mesh</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <span className="font-bold text-slate-800">3. PREDICT &amp; ACT</span>
                    <span className="text-[11px] text-[#2563EB] font-bold">Interventions</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 text-center">
                <button
                  id="home-ai-pipeline-btn"
                  onClick={() => setActiveTab('ai')}
                  className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                >
                  View Intelligence Framework →
                </button>
              </div>
            </Card>
          </div>
        </div>
      </FadeIn>
    </PageContainer>
  );
};

export default HomeView;
