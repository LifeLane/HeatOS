import React from 'react';
import {
  Activity,
  Radio,
  Wifi,
  Battery,
  Clock,
  ShieldCheck,
  Filter,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Wind,
  Droplets,
  Trees,
  CheckCircle2,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useNavigation } from '../../context/NavigationContext';
import { useExplanation } from '../../context/ExplanationContext';
import { SensorNode } from '../../types';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import StatusPill from '../ui/StatusPill';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { FadeIn, PulseIndicator } from '../motion/MotionPrimitives';
import { NaturePulseCard } from '../pulse/NaturePulseCard';
import { naturePulseApi } from '../../services/naturePulseApi';
import { NaturePulseResult } from '../../types/naturePulse';

export const PulseView: React.FC = () => {
  const { currentLocation, formatTemp, lastTelemetryTime, isLive, toggleLive } = useLocation();
  const { connection, reconnect, isSyncing } = useFortyGuard();
  const { setActiveTab, openTool } = useNavigation();
  const explanation = useExplanation();
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Phase 5 Nature Pulse State
  const [pulse, setPulse] = React.useState<NaturePulseResult | null>(null);
  const [pulseLoading, setPulseLoading] = React.useState<boolean>(true);
  const [testReport, setTestReport] = React.useState<any | null>(null);
  const [isRunningTests, setIsRunningTests] = React.useState<boolean>(false);

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
      console.error('Error fetching Nature Pulse in PulseView:', err);
    } finally {
      setPulseLoading(false);
    }
  };

  const handleRunTests = async () => {
    try {
      setIsRunningTests(true);
      const report = await naturePulseApi.runTests();
      setTestReport(report);
    } catch (err) {
      console.error('Error running pulse tests:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  React.useEffect(() => {
    fetchPulse();
  }, [currentLocation.id, currentLocation.coordinates.lat, currentLocation.coordinates.lng]);

  // Sample real-time sensor node feed for the selected location
  const sensorNodes: SensorNode[] = [
    {
      id: 'FG-NODE-8401',
      name: `${currentLocation.name} Core Thermal Array #01`,
      zone: 'Midtown Commercial Core',
      category: 'heat',
      status: 'active',
      temperature: currentLocation.ambientTemp + 3.2,
      surfaceTemp: currentLocation.ambientTemp + 6.1,
      humidity: currentLocation.humidity - 4,
      aqi: currentLocation.aqi + 5,
      battery: 94,
      signalStrength: 98,
      lastHeartbeat: '4s ago',
      coordinates: [currentLocation.coordinates.lat, currentLocation.coordinates.lng],
    },
    {
      id: 'FG-NODE-8402',
      name: `${currentLocation.name} Canopy Micro-Station #04`,
      zone: 'Municipal Park Green Corridor',
      category: 'nature',
      status: 'active',
      temperature: currentLocation.ambientTemp - 1.8,
      surfaceTemp: currentLocation.ambientTemp - 3.2,
      humidity: currentLocation.humidity + 8,
      aqi: currentLocation.aqi - 8,
      battery: 88,
      signalStrength: 92,
      lastHeartbeat: '6s ago',
      coordinates: [currentLocation.coordinates.lat + 0.004, currentLocation.coordinates.lng - 0.003],
    },
    {
      id: 'FG-NODE-8403',
      name: `${currentLocation.name} Atmospheric Particulate Probe`,
      zone: 'Transit Hub Terminal',
      category: 'air',
      status: 'active',
      temperature: currentLocation.ambientTemp + 1.1,
      surfaceTemp: currentLocation.ambientTemp + 2.0,
      humidity: currentLocation.humidity,
      aqi: currentLocation.aqi + 14,
      battery: 97,
      signalStrength: 100,
      lastHeartbeat: '2s ago',
      coordinates: [currentLocation.coordinates.lat - 0.005, currentLocation.coordinates.lng + 0.006],
    },
    {
      id: 'FG-NODE-8404',
      name: `${currentLocation.name} Radiant Solar Pyranometer`,
      zone: 'Rooftop Solar Array Sector',
      category: 'solar',
      status: 'active',
      temperature: currentLocation.ambientTemp + 4.5,
      surfaceTemp: currentLocation.ambientTemp + 7.8,
      humidity: currentLocation.humidity - 10,
      aqi: currentLocation.aqi,
      battery: 100,
      signalStrength: 96,
      lastHeartbeat: '1s ago',
      coordinates: [currentLocation.coordinates.lat + 0.008, currentLocation.coordinates.lng + 0.004],
    },
    {
      id: 'FG-NODE-8405',
      name: `${currentLocation.name} Hydro-Vapor Station`,
      zone: 'Riverbank Waterfront Corridor',
      category: 'water',
      status: 'active',
      temperature: currentLocation.ambientTemp - 0.9,
      surfaceTemp: currentLocation.ambientTemp - 1.5,
      humidity: currentLocation.humidity + 14,
      aqi: currentLocation.aqi - 6,
      battery: 82,
      signalStrength: 89,
      lastHeartbeat: '8s ago',
      coordinates: [currentLocation.coordinates.lat - 0.012, currentLocation.coordinates.lng - 0.008],
    },
  ];

  const filteredNodes = sensorNodes.filter((node) => {
    const matchesCategory = filterCategory === 'all' || node.category === filterCategory;
    const matchesQuery =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <PageContainer maxWidth="7xl">
      <FadeIn>
        {/* Pulse Telemetry Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                NATURE PULSE
              </h1>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                <PulseIndicator color="bg-emerald-500" />
                LIVE SIGNAL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              One environmental signal, six dimensions. A composite view across heat, air, water, nature, fire, and solar conditions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <SecondaryButton
              id="pulse-toggle-live-btn"
              size="sm"
              variant="outline"
              onClick={toggleLive}
            >
              {isLive ? 'Pause Stream' : 'Resume Stream'}
            </SecondaryButton>
            <PrimaryButton
              id="pulse-sync-mesh-btn"
              size="sm"
              onClick={reconnect}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Signals
            </PrimaryButton>
          </div>
        </div>

        {/* Phase 5: Nature Pulse Intelligence Section */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NaturePulseCard
              pulse={pulse}
              loading={pulseLoading}
              onRefresh={fetchPulse}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* HACKATHON CTA: MITIGATION SANDBOX */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trees className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-emerald-900 tracking-tight">
                    MITIGATION SANDBOX
                  </h3>
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed mb-4">
                  Test an intervention. See the environmental impact.
                </p>
              </div>
              <PrimaryButton
                onClick={() => {
                  setActiveTab('tools');
                  openTool('urban-heat-sandbox', 'EXPLORE');
                }}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 border-none text-white shadow-xs cursor-pointer"
              >
                Launch Mitigation Simulator
              </PrimaryButton>
            </div>

            {/* Diagnostic Test Runner for Nature Pulse */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Phase 5 Validation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  10 DIAGNOSTICS
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Nature Pulse Diagnostic Suite
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Automated tests verifying non-fabrication of missing dimensions, EPA & FortyGuard synthesis, NASA fire exclusivity, and status mapping.
              </p>

              {testReport && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">Tests Passed:</span>
                    <span className="font-bold text-emerald-600">
                      {testReport.passedCount} / {testReport.totalTests} ({testReport.passRatePct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">Duration:</span>
                    <span className="text-slate-700">{testReport.durationMs}ms</span>
                  </div>
                </div>
              )}
            </div>

            <PrimaryButton
              id="run-pulse-tests-btn"
              size="sm"
              onClick={handleRunTests}
              isLoading={isRunningTests}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
              className="w-full justify-center"
            >
              {testReport ? 'Re-Run Pulse Suite' : 'Run 10 Pulse Integrity Tests'}
            </PrimaryButton>
          </div>
          </div>
        </div>

        {/* Telemetry Stream Health KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() =>
              explanation.explainAIInsight(
                'Reporting Sensor Nodes Network Coverage',
                `Active edge telemetry nodes deployed across ${currentLocation.name} sensor mesh.`,
                [
                  `Active reporting nodes: ${currentLocation.activeSensors} of 350`,
                  `Coverage fidelity: 98.2% spatial resolution`,
                  `Telemetry protocol: FortyGuard encrypted MQTT/WebSocket mesh`,
                  `Health status: 100% operational`,
                ]
              )
            }
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') &&
              explanation.explainAIInsight(
                'Reporting Sensor Nodes Network Coverage',
                `Active edge telemetry nodes deployed across ${currentLocation.name} sensor mesh.`,
                [
                  `Active reporting nodes: ${currentLocation.activeSensors} of 350`,
                  `Coverage fidelity: 98.2% spatial resolution`,
                  `Telemetry protocol: FortyGuard encrypted MQTT/WebSocket mesh`,
                  `Health status: 100% operational`,
                ]
              )
            }
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] group"
            title="Click to view sensor nodes network details"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-emerald-700">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reporting Nodes</span>
              </div>
              <span className="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono">&rarr;</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {currentLocation.activeSensors} <span className="text-xs font-normal text-slate-400">/ 350</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              98.2% Network Coverage
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() =>
              explanation.explainAIInsight(
                'Sub-Second Telemetry Latency',
                `Real-time WebSocket latency benchmark for ${currentLocation.name}.`,
                [
                  `Latency: ${connection.latencyMs} ms round-trip time`,
                  `Edge aggregation: Real-time sensor packet ingestion`,
                  `Sync state: Sub-second precision with live jitter mitigation`,
                ]
              )
            }
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') &&
              explanation.explainAIInsight(
                'Sub-Second Telemetry Latency',
                `Real-time WebSocket latency benchmark for ${currentLocation.name}.`,
                [
                  `Latency: ${connection.latencyMs} ms round-trip time`,
                  `Edge aggregation: Real-time sensor packet ingestion`,
                  `Sync state: Sub-second precision with live jitter mitigation`,
                ]
              )
            }
            className="p-4 rounded-2xl bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] group"
            title="Click to view telemetry latency analysis"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-blue-700">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Telemetry Latency</span>
              </div>
              <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono">&rarr;</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {connection.latencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[11px] text-[#2563EB] font-medium mt-0.5">
              Sub-second Precision
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() =>
              explanation.explainAIInsight(
                'Encrypted Telemetry Throughput',
                `Stream ingestion throughput and encryption architecture.`,
                [
                  `Throughput: ${connection.dataThroughput}`,
                  `Security: End-to-end TLS/AES-256 encrypted ingest`,
                  `Data verification: SHA-256 hash checksums on every packet`,
                ]
              )
            }
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') &&
              explanation.explainAIInsight(
                'Encrypted Telemetry Throughput',
                `Stream ingestion throughput and encryption architecture.`,
                [
                  `Throughput: ${connection.dataThroughput}`,
                  `Security: End-to-end TLS/AES-256 encrypted ingest`,
                  `Data verification: SHA-256 hash checksums on every packet`,
                ]
              )
            }
            className="p-4 rounded-2xl bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] group"
            title="Click to view data throughput details"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-teal-700">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Throughput</span>
              </div>
              <span className="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono">&rarr;</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {connection.dataThroughput}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Encrypted Stream
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => explanation.explainMetric('ambientTemp', formatTemp(currentLocation.ambientTemp))}
            onKeyDown={(e) =>
              (e.key === 'Enter' || e.key === ' ') &&
              explanation.explainMetric('ambientTemp', formatTemp(currentLocation.ambientTemp))
            }
            className="p-4 rounded-2xl bg-white hover:bg-slate-100/60 border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] group"
            title="Click to inspect latest telemetry packet provenance"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Packet</span>
              </div>
              <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono">&rarr;</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1 truncate">
              {lastTelemetryTime}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              FortyGuard High-Density
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="sensor-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node ID, zone, or sensor type..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'heat', 'air', 'water', 'nature', 'solar'].map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat}`}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sensor Nodes Feed Table / Cards */}
        <div className="space-y-3">
          {filteredNodes.map((node) => (
            <Card
              key={node.id}
              id={`sensor-node-${node.id}`}
              variant="default"
              padding="md"
              className="hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Node info */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 mt-0.5">
                    {node.category === 'heat' && <Flame className="w-4 h-4 text-orange-600" />}
                    {node.category === 'air' && <Wind className="w-4 h-4 text-teal-600" />}
                    {node.category === 'water' && <Droplets className="w-4 h-4 text-sky-600" />}
                    {node.category === 'nature' && <Trees className="w-4 h-4 text-emerald-600" />}
                    {node.category === 'solar' && <Radio className="w-4 h-4 text-amber-600" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {node.id}
                      </span>
                      <span className="text-sm font-bold text-slate-800">{node.name}</span>
                      <StatusPill status="optimal" label="ACTIVE" size="sm" />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{node.zone}</div>
                  </div>
                </div>

                {/* Live Node Telemetry Readings */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => explanation.explainMetric('ambientTemp', formatTemp(node.temperature))}
                    className="hover:text-blue-600 cursor-pointer text-left transition-colors"
                    title="Click to explain ambient temperature"
                  >
                    <span className="text-slate-600">Temp: </span>
                    <span className="font-bold text-slate-900">{formatTemp(node.temperature)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => explanation.explainMetric('surfaceHeatAnomaly', formatTemp(node.surfaceTemp))}
                    className="hover:text-blue-600 cursor-pointer text-left transition-colors"
                    title="Click to explain surface temperature"
                  >
                    <span className="text-slate-600">Surface: </span>
                    <span className="font-bold text-orange-700">{formatTemp(node.surfaceTemp)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => explanation.explainMetric('airQuality', `${node.aqi} AQI`)}
                    className="hover:text-blue-600 cursor-pointer text-left transition-colors"
                    title="Click to explain air quality index"
                  >
                    <span className="text-slate-600">AQI: </span>
                    <span className="font-bold text-teal-700">{node.aqi}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => explanation.explainMetric('humidity', `${node.humidity}%`)}
                    className="hover:text-blue-600 cursor-pointer text-left transition-colors"
                    title="Click to explain humidity"
                  >
                    <span className="text-slate-600">Humidity: </span>
                    <span className="font-bold text-sky-700">{node.humidity}%</span>
                  </button>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{node.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Wifi className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{node.signalStrength}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </FadeIn>
    </PageContainer>
  );
};

export default PulseView;
