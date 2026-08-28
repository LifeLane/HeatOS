export interface SiteMonitoringRule {
  id: string;
  category: 'heat_anomaly' | 'air_quality' | 'extreme_temp' | 'wind' | 'precipitation' | 'environmental_risk';
  categoryLabel: string;
  name: string;
  threshold: number;
  unit: string;
  comparison: '>' | '<' | '>=';
  enabled: boolean;
  isTriggered: boolean;
  currentValue: number;
  lastEvaluated: string;
  actionProtocol: string;
}

export interface MonitoredSite {
  id: string;
  name: string;
  location: {
    city: string;
    state?: string;
    country: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    climateZone: string;
  };
  pulse: number; // 0-100
  currentTemp: number; // in Celsius
  apparentTemp: number;
  surfaceAnomaly: number; // +°C delta
  heatRisk: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'OPTIMAL';
  airQuality: number; // AQI
  aqiLabel: string;
  windSpeed: number; // km/h
  precipitationProb: number; // %
  activeAlertsCount: number;
  activeAlerts: Array<{
    id: string;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    category: string;
    timestamp: string;
  }>;
  lastSync: string;
  status: 'ACTION_REQUIRED' | 'CRITICAL' | 'WARNING' | 'STABLE' | 'OPTIMAL';
  monitoringRules: SiteMonitoringRule[];
  facilityType: 'Campus HQ' | 'Logistics Hub' | 'Operations Center' | 'Data Center' | 'Manufacturing' | 'Commercial Office';
  isDemo: boolean;
}

export const INITIAL_DEMO_SITES: MonitoredSite[] = [
  {
    id: 'site-austin-campus',
    name: 'Austin Technology Campus',
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      address: '7400 Tech Ridge Blvd, Austin, TX 78753',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      climateZone: 'Cfa (Humid Subtropical)',
    },
    pulse: 78,
    currentTemp: 34.2,
    apparentTemp: 37.8,
    surfaceAnomaly: 3.4,
    heatRisk: 'HIGH',
    airQuality: 45,
    aqiLabel: 'Good',
    windSpeed: 14,
    precipitationProb: 10,
    activeAlertsCount: 2,
    activeAlerts: [
      { id: 'alt-aus-1', title: 'Urban Heat Island Peak Exceedance (+3.4°C)', severity: 'warning', category: 'heat', timestamp: '12m ago' },
      { id: 'alt-aus-2', title: 'HVAC Cooling Load Tier 2 Threshold', severity: 'info', category: 'energy', timestamp: '45m ago' },
    ],
    lastSync: 'Just now',
    status: 'ACTION_REQUIRED',
    facilityType: 'Campus HQ',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-aus-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Surface Anomaly Spike Alert', threshold: 3.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 3.4, lastEvaluated: '1m ago', actionProtocol: 'Engage roof misting & HVAC pre-chill' },
      { id: 'rule-aus-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Ambient High Temperature Threshold', threshold: 35.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 34.2, lastEvaluated: '1m ago', actionProtocol: 'Enforce OSHA outdoor work hydration pauses' },
      { id: 'rule-aus-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'PM2.5 AQI Spike Limit', threshold: 100, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 45, lastEvaluated: '2m ago', actionProtocol: 'Switch air handling units to recirculation mode' },
      { id: 'rule-aus-4', category: 'wind', categoryLabel: 'Wind', name: 'High Wind / Gust Alarm', threshold: 45, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 14, lastEvaluated: '2m ago', actionProtocol: 'Secure rooftop equipment & solar array anchors' },
      { id: 'rule-aus-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Convective Rain & Flood Alert', threshold: 60, unit: '%', comparison: '>=', enabled: true, isTriggered: false, currentValue: 10, lastEvaluated: '5m ago', actionProtocol: 'Activate storm retention basin pumps' },
      { id: 'rule-aus-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Composite Resilience Index Floor', threshold: 65, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 78, lastEvaluated: '1m ago', actionProtocol: 'Issue facility environmental safety bulletin' },
    ],
  },
  {
    id: 'site-phoenix-logistics',
    name: 'Phoenix Desert Logistics Hub',
    location: {
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      address: '4800 S 40th St, Phoenix, AZ 85040',
      coordinates: { lat: 33.4484, lng: -112.0740 },
      climateZone: 'BWh (Hot Desert)',
    },
    pulse: 58,
    currentTemp: 42.6,
    apparentTemp: 44.1,
    surfaceAnomaly: 5.1,
    heatRisk: 'CRITICAL',
    airQuality: 72,
    aqiLabel: 'Moderate',
    windSpeed: 18,
    precipitationProb: 0,
    activeAlertsCount: 3,
    activeAlerts: [
      { id: 'alt-phx-1', title: 'Critical Ambient Temperature High (42.6°C)', severity: 'critical', category: 'heat', timestamp: '5m ago' },
      { id: 'alt-phx-2', title: 'Severe Surface Asphalt Heat (+5.1°C)', severity: 'critical', category: 'heat', timestamp: '14m ago' },
      { id: 'alt-phx-3', title: 'Dust & Ozone Afternoon Accumulation', severity: 'warning', category: 'air', timestamp: '1h ago' },
    ],
    lastSync: '2m ago',
    status: 'CRITICAL',
    facilityType: 'Logistics Hub',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-phx-1', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Extreme Heat Danger Level', threshold: 40.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 42.6, lastEvaluated: '2m ago', actionProtocol: 'Shift outdoor apron loading to night shifts' },
      { id: 'rule-phx-2', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Pavement Radiative Anomaly Limit', threshold: 4.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 5.1, lastEvaluated: '2m ago', actionProtocol: 'Deploy mobile shaded evaporative cooling units' },
      { id: 'rule-phx-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Ozone / Particulate Alert', threshold: 70, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: true, currentValue: 72, lastEvaluated: '2m ago', actionProtocol: 'Distribute N95 protective respirators' },
      { id: 'rule-phx-4', category: 'wind', categoryLabel: 'Wind', name: 'Haboob / High Gust Trigger', threshold: 40, unit: 'km/h', comparison: '>=', enabled: true, isTriggered: false, currentValue: 18, lastEvaluated: '2m ago', actionProtocol: 'Seal bay doors against dust infiltration' },
      { id: 'rule-phx-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Flash Monsoon Watch', threshold: 50, unit: '%', comparison: '>=', enabled: false, isTriggered: false, currentValue: 0, lastEvaluated: '10m ago', actionProtocol: 'Verify roof drains and retention swales' },
      { id: 'rule-phx-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Environmental Pulse Floor', threshold: 60, unit: '/100', comparison: '<', enabled: true, isTriggered: true, currentValue: 58, lastEvaluated: '2m ago', actionProtocol: 'Trigger Level-3 Heat Emergency Protocol' },
    ],
  },
  {
    id: 'site-dubai-center',
    name: 'Dubai Gulf Operations Center',
    location: {
      city: 'Dubai',
      country: 'UAE',
      address: 'Sheikh Zayed Rd, Business Bay, Dubai',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      climateZone: 'BWh (Hot Desert Arid)',
    },
    pulse: 62,
    currentTemp: 40.5,
    apparentTemp: 46.2,
    surfaceAnomaly: 4.2,
    heatRisk: 'CRITICAL',
    airQuality: 95,
    aqiLabel: 'Moderate/Dust',
    windSpeed: 22,
    precipitationProb: 0,
    activeAlertsCount: 2,
    activeAlerts: [
      { id: 'alt-dxb-1', title: 'High Wet-Bulb & Thermal Heat Stress Index', severity: 'critical', category: 'heat', timestamp: '8m ago' },
      { id: 'alt-dxb-2', title: 'Air Quality Fine Dust Boundary Elevation', severity: 'warning', category: 'air', timestamp: '30m ago' },
    ],
    lastSync: '1m ago',
    status: 'CRITICAL',
    facilityType: 'Operations Center',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-dxb-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Urban Heat Island Delta', threshold: 3.5, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 4.2, lastEvaluated: '1m ago', actionProtocol: 'Initiate district cooling peak power shave' },
      { id: 'rule-dxb-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Ambient Heat Warning', threshold: 38.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 40.5, lastEvaluated: '1m ago', actionProtocol: 'Enforce midday outdoor work suspension' },
      { id: 'rule-dxb-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Dust Particulate Threshold', threshold: 90, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: true, currentValue: 95, lastEvaluated: '1m ago', actionProtocol: 'Seal positive-pressure building airlocks' },
      { id: 'rule-dxb-4', category: 'wind', categoryLabel: 'Wind', name: 'Shamal Dust Storm Wind Speed', threshold: 35, unit: 'km/h', comparison: '>=', enabled: true, isTriggered: false, currentValue: 22, lastEvaluated: '1m ago', actionProtocol: 'Park external crane and façade rigs' },
      { id: 'rule-dxb-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Rare Torrential Rain Alert', threshold: 40, unit: '%', comparison: '>=', enabled: false, isTriggered: false, currentValue: 0, lastEvaluated: '10m ago', actionProtocol: 'Verify underground parking sumps' },
      { id: 'rule-dxb-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Composite Facility Pulse', threshold: 70, unit: '/100', comparison: '<', enabled: true, isTriggered: true, currentValue: 62, lastEvaluated: '1m ago', actionProtocol: 'Brief facility safety managers' },
    ],
  },
  {
    id: 'site-singapore-hq',
    name: 'Singapore Regional Innovation HQ',
    location: {
      city: 'Singapore',
      country: 'Singapore',
      address: '1 Fusionopolis Way, Connexis, Singapore 138632',
      coordinates: { lat: 1.3521, lng: 103.8198 },
      climateZone: 'Af (Tropical Rainforest)',
    },
    pulse: 89,
    currentTemp: 31.8,
    apparentTemp: 37.1,
    surfaceAnomaly: 2.1,
    heatRisk: 'MODERATE',
    airQuality: 32,
    aqiLabel: 'Good',
    windSpeed: 12,
    precipitationProb: 45,
    activeAlertsCount: 0,
    activeAlerts: [],
    lastSync: 'Just now',
    status: 'OPTIMAL',
    facilityType: 'Campus HQ',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-sg-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Surface Anomaly Cap', threshold: 3.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 2.1, lastEvaluated: '1m ago', actionProtocol: 'Maintain biophilic green facade irrigation' },
      { id: 'rule-sg-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Tropical Heat High', threshold: 34.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 31.8, lastEvaluated: '1m ago', actionProtocol: 'Enable atrium thermal chimney vents' },
      { id: 'rule-sg-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Regional Haze Detection', threshold: 80, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 32, lastEvaluated: '1m ago', actionProtocol: 'Engage electrostatic MERV-15 filtration' },
      { id: 'rule-sg-4', category: 'wind', categoryLabel: 'Wind', name: 'Squall Line Wind Gust', threshold: 50, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 12, lastEvaluated: '5m ago', actionProtocol: 'Retract outdoor shade awnings' },
      { id: 'rule-sg-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Monsoon Heavy Downpour Watch', threshold: 60, unit: '%', comparison: '>=', enabled: true, isTriggered: false, currentValue: 45, lastEvaluated: '1m ago', actionProtocol: 'Inspect rainwater harvesting bypass' },
      { id: 'rule-sg-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Pulse Degradation Limit', threshold: 75, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 89, lastEvaluated: '1m ago', actionProtocol: 'Log environmental variance' },
    ],
  },
  {
    id: 'site-london-gateway',
    name: 'London Enterprise Gateway',
    location: {
      city: 'London',
      country: 'UK',
      address: '25 Bank St, Canary Wharf, London E14 5JP',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      climateZone: 'Cfb (Temperate Oceanic)',
    },
    pulse: 92,
    currentTemp: 22.4,
    apparentTemp: 22.4,
    surfaceAnomaly: 1.6,
    heatRisk: 'OPTIMAL',
    airQuality: 26,
    aqiLabel: 'Good',
    windSpeed: 16,
    precipitationProb: 20,
    activeAlertsCount: 0,
    activeAlerts: [],
    lastSync: '4m ago',
    status: 'OPTIMAL',
    facilityType: 'Commercial Office',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-lon-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'London Urban Heat Dome', threshold: 2.8, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 1.6, lastEvaluated: '4m ago', actionProtocol: 'Switch to night purge free-cooling' },
      { id: 'rule-lon-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Heatwave Threshold Warning', threshold: 30.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 22.4, lastEvaluated: '4m ago', actionProtocol: 'Adjust office thermostat setpoints' },
      { id: 'rule-lon-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'ULEZ / NO2 Pollution Spike', threshold: 60, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 26, lastEvaluated: '4m ago', actionProtocol: 'Activate lobby charcoal filtration' },
      { id: 'rule-lon-4', category: 'wind', categoryLabel: 'Wind', name: 'Atlantic Gale Force Wind', threshold: 60, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 16, lastEvaluated: '10m ago', actionProtocol: 'Lock external terrace doors' },
      { id: 'rule-lon-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Persistent Rainfall Risk', threshold: 75, unit: '%', comparison: '>=', enabled: false, isTriggered: false, currentValue: 20, lastEvaluated: '10m ago', actionProtocol: 'Monitor basement sump levels' },
      { id: 'rule-lon-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Resilience Floor', threshold: 80, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 92, lastEvaluated: '4m ago', actionProtocol: 'Maintain standard operation' },
    ],
  },
  {
    id: 'site-tokyo-facility',
    name: 'Tokyo Chiyoda Operations Facility',
    location: {
      city: 'Tokyo',
      country: 'Japan',
      address: '1-1 Otemachi, Chiyoda-ku, Tokyo 100-0004',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      climateZone: 'Cfa (Humid Subtropical)',
    },
    pulse: 84,
    currentTemp: 29.5,
    apparentTemp: 32.1,
    surfaceAnomaly: 2.8,
    heatRisk: 'MODERATE',
    airQuality: 38,
    aqiLabel: 'Good',
    windSpeed: 10,
    precipitationProb: 35,
    activeAlertsCount: 1,
    activeAlerts: [
      { id: 'alt-tyo-1', title: 'Afternoon Asphalt Heat Retention Spike (+2.8°C)', severity: 'info', category: 'heat', timestamp: '18m ago' },
    ],
    lastSync: '3m ago',
    status: 'STABLE',
    facilityType: 'Operations Center',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-tyo-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Tokyo Heat Island Anomaly', threshold: 2.5, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 2.8, lastEvaluated: '3m ago', actionProtocol: 'Activate street misting nozzles' },
      { id: 'rule-tyo-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Summer High Ambient Alert', threshold: 33.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 29.5, lastEvaluated: '3m ago', actionProtocol: 'Implement Cool Biz facility standards' },
      { id: 'rule-tyo-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Ozone Level Limit', threshold: 75, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 38, lastEvaluated: '3m ago', actionProtocol: 'Adjust intake fresh air ratios' },
      { id: 'rule-tyo-4', category: 'wind', categoryLabel: 'Wind', name: 'Typhoon Outer Band Wind', threshold: 55, unit: 'km/h', comparison: '>=', enabled: true, isTriggered: false, currentValue: 10, lastEvaluated: '3m ago', actionProtocol: 'Secure rooftop solar & antenna fixtures' },
      { id: 'rule-tyo-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Torrential Guerrilla Rain Watch', threshold: 70, unit: '%', comparison: '>=', enabled: true, isTriggered: false, currentValue: 35, lastEvaluated: '3m ago', actionProtocol: 'Deploy flood barriers at underground entrances' },
      { id: 'rule-tyo-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Composite Score Min', threshold: 75, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 84, lastEvaluated: '3m ago', actionProtocol: 'Update facility status board' },
    ],
  },
  {
    id: 'site-sydney-harbor',
    name: 'Sydney Harbor Logistics Complex',
    location: {
      city: 'Sydney',
      state: 'NSW',
      country: 'Australia',
      address: 'Botany Rd, Mascot, Sydney NSW 2020',
      coordinates: { lat: -33.8688, lng: 151.2093 },
      climateZone: 'Cfa (Temperate Oceanic)',
    },
    pulse: 82,
    currentTemp: 24.1,
    apparentTemp: 24.5,
    surfaceAnomaly: 2.3,
    heatRisk: 'MODERATE',
    airQuality: 28,
    aqiLabel: 'Good',
    windSpeed: 24,
    precipitationProb: 15,
    activeAlertsCount: 0,
    activeAlerts: [],
    lastSync: '6m ago',
    status: 'STABLE',
    facilityType: 'Logistics Hub',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-syd-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Western Sydney Heat Delta', threshold: 3.2, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 2.3, lastEvaluated: '6m ago', actionProtocol: 'Deploy shade canopies over logistics bays' },
      { id: 'rule-syd-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Heatwave Day Alert', threshold: 35.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 24.1, lastEvaluated: '6m ago', actionProtocol: 'Issue worker hydration alerts' },
      { id: 'rule-syd-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Bushfire Smoke Particulate Cap', threshold: 85, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 28, lastEvaluated: '6m ago', actionProtocol: 'Activate HEPA bypass filtration' },
      { id: 'rule-syd-4', category: 'wind', categoryLabel: 'Wind', name: 'Southerly Buster Wind Warning', threshold: 50, unit: 'km/h', comparison: '>=', enabled: true, isTriggered: false, currentValue: 24, lastEvaluated: '6m ago', actionProtocol: 'Secure shipping container stacks' },
      { id: 'rule-syd-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'East Coast Low Rain Alert', threshold: 65, unit: '%', comparison: '>=', enabled: false, isTriggered: false, currentValue: 15, lastEvaluated: '15m ago', actionProtocol: 'Clear perimeter stormwater drains' },
      { id: 'rule-syd-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Pulse Index Baseline', threshold: 75, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 82, lastEvaluated: '6m ago', actionProtocol: 'Review site readiness plan' },
    ],
  },
  {
    id: 'site-miami-coastal',
    name: 'Miami Coastal Logistics Center',
    location: {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      address: '1000 NW 57th Ave, Miami, FL 33126',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      climateZone: 'Am (Tropical Monsoon)',
    },
    pulse: 74,
    currentTemp: 32.5,
    apparentTemp: 39.2,
    surfaceAnomaly: 2.9,
    heatRisk: 'HIGH',
    airQuality: 35,
    aqiLabel: 'Good',
    windSpeed: 20,
    precipitationProb: 55,
    activeAlertsCount: 2,
    activeAlerts: [
      { id: 'alt-mia-1', title: 'High Heat Index / Extreme Humidity Stress (39.2°C Feels)', severity: 'warning', category: 'heat', timestamp: '22m ago' },
      { id: 'alt-mia-2', title: 'Afternoon Convective Storm & King Tide Sump Watch', severity: 'warning', category: 'water', timestamp: '50m ago' },
    ],
    lastSync: '1m ago',
    status: 'ACTION_REQUIRED',
    facilityType: 'Logistics Hub',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-mia-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Urban Asphalt Heat Soak', threshold: 3.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 2.9, lastEvaluated: '1m ago', actionProtocol: 'Spray down apron surfaces' },
      { id: 'rule-mia-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Heat Index Exceedance', threshold: 38.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 39.2, lastEvaluated: '1m ago', actionProtocol: 'Mandate 15m cooling rests every hour' },
      { id: 'rule-mia-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Saharan Dust Cloud Alert', threshold: 80, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 35, lastEvaluated: '1m ago', actionProtocol: 'Seal perimeter docks' },
      { id: 'rule-mia-4', category: 'wind', categoryLabel: 'Wind', name: 'Tropical Storm Gust Threshold', threshold: 60, unit: 'km/h', comparison: '>=', enabled: true, isTriggered: false, currentValue: 20, lastEvaluated: '1m ago', actionProtocol: 'Engage hurricane shutter systems' },
      { id: 'rule-mia-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'High Rain & Tidal Flood Trigger', threshold: 50, unit: '%', comparison: '>=', enabled: true, isTriggered: true, currentValue: 55, lastEvaluated: '1m ago', actionProtocol: 'Test auxiliary backup sump generator' },
      { id: 'rule-mia-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Composite Facility Pulse', threshold: 75, unit: '/100', comparison: '<', enabled: true, isTriggered: true, currentValue: 74, lastEvaluated: '1m ago', actionProtocol: 'Notify facilities operations team' },
    ],
  },
  {
    id: 'site-frankfurt-dc',
    name: 'Frankfurt Central Data Center Hub',
    location: {
      city: 'Frankfurt',
      country: 'Germany',
      address: 'Hanauer Landstraße 300, 60314 Frankfurt',
      coordinates: { lat: 50.1109, lng: 8.6821 },
      climateZone: 'Cfb (Oceanic Temperate)',
    },
    pulse: 88,
    currentTemp: 23.8,
    apparentTemp: 24.1,
    surfaceAnomaly: 2.2,
    heatRisk: 'MODERATE',
    airQuality: 30,
    aqiLabel: 'Good',
    windSpeed: 14,
    precipitationProb: 10,
    activeAlertsCount: 0,
    activeAlerts: [],
    lastSync: '5m ago',
    status: 'OPTIMAL',
    facilityType: 'Data Center',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-fra-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Data Center Heat Island Delta', threshold: 3.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 2.2, lastEvaluated: '5m ago', actionProtocol: 'Adjust cooling chillers load factor' },
      { id: 'rule-fra-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Ambient Peak Temperature', threshold: 32.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 23.8, lastEvaluated: '5m ago', actionProtocol: 'Switch from free-cooling to hybrid chillers' },
      { id: 'rule-fra-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Particulate Intrusion Limit', threshold: 50, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 30, lastEvaluated: '5m ago', actionProtocol: 'Verify server hall positive pressure' },
      { id: 'rule-fra-4', category: 'wind', categoryLabel: 'Wind', name: 'High Wind / Storm Alarm', threshold: 55, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 14, lastEvaluated: '15m ago', actionProtocol: 'Inspect cooling tower fan guards' },
      { id: 'rule-fra-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Storm Inflow Alert', threshold: 60, unit: '%', comparison: '>=', enabled: false, isTriggered: false, currentValue: 10, lastEvaluated: '15m ago', actionProtocol: 'Verify fiber intake vaults' },
      { id: 'rule-fra-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Resilience Score Target', threshold: 85, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 88, lastEvaluated: '5m ago', actionProtocol: 'Maintain green nominal operations' },
    ],
  },
  {
    id: 'site-chicago-dist',
    name: 'Chicago Great Lakes Distribution Park',
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      address: '2800 S Western Ave, Chicago, IL 60608',
      coordinates: { lat: 41.8781, lng: -87.6298 },
      climateZone: 'Dfa (Hot-summer Humid Continental)',
    },
    pulse: 80,
    currentTemp: 26.4,
    apparentTemp: 27.2,
    surfaceAnomaly: 2.7,
    heatRisk: 'MODERATE',
    airQuality: 42,
    aqiLabel: 'Good',
    windSpeed: 26,
    precipitationProb: 25,
    activeAlertsCount: 1,
    activeAlerts: [
      { id: 'alt-chi-1', title: 'Lake Breeze Front Wind Gusts (26 km/h)', severity: 'info', category: 'wind', timestamp: '35m ago' },
    ],
    lastSync: '2m ago',
    status: 'STABLE',
    facilityType: 'Logistics Hub',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-chi-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Industrial Pavement Anomaly', threshold: 3.5, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 2.7, lastEvaluated: '2m ago', actionProtocol: 'Engage warehouse cross-ventilation fans' },
      { id: 'rule-chi-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Midwest Heatwave Threshold', threshold: 33.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 26.4, lastEvaluated: '2m ago', actionProtocol: 'Provide ice hydration stations' },
      { id: 'rule-chi-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Wildfire Smoke Inversion Cap', threshold: 75, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 42, lastEvaluated: '2m ago', actionProtocol: 'Seal loading dock perimeter gaskets' },
      { id: 'rule-chi-4', category: 'wind', categoryLabel: 'Wind', name: 'High Lakefront Wind Gust', threshold: 45, unit: 'km/h', comparison: '>=', enabled: true, isTriggered: false, currentValue: 26, lastEvaluated: '2m ago', actionProtocol: 'Restrict high-reach yard forklifts' },
      { id: 'rule-chi-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Severe Storm Warning', threshold: 60, unit: '%', comparison: '>=', enabled: true, isTriggered: false, currentValue: 25, lastEvaluated: '2m ago', actionProtocol: 'Inspect detention pond spillways' },
      { id: 'rule-chi-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Facility Pulse Target', threshold: 75, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 80, lastEvaluated: '2m ago', actionProtocol: 'Standard shift monitoring' },
    ],
  },
  {
    id: 'site-cairo-ind',
    name: 'Cairo Nile Industrial Zone',
    location: {
      city: 'Cairo',
      country: 'Egypt',
      address: '10th of Ramadan City, Cairo',
      coordinates: { lat: 30.0444, lng: 31.2357 },
      climateZone: 'BWh (Hot Desert Arid)',
    },
    pulse: 64,
    currentTemp: 38.8,
    apparentTemp: 41.0,
    surfaceAnomaly: 4.6,
    heatRisk: 'HIGH',
    airQuality: 88,
    aqiLabel: 'Moderate/Dust',
    windSpeed: 16,
    precipitationProb: 0,
    activeAlertsCount: 2,
    activeAlerts: [
      { id: 'alt-cai-1', title: 'Severe Surface Heat Anomaly (+4.6°C)', severity: 'warning', category: 'heat', timestamp: '15m ago' },
      { id: 'alt-cai-2', title: 'Khamsin Desert Dust & Particulate Influx', severity: 'warning', category: 'air', timestamp: '40m ago' },
    ],
    lastSync: '3m ago',
    status: 'ACTION_REQUIRED',
    facilityType: 'Manufacturing',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-cai-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Desert Surface Heat Spike', threshold: 4.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 4.6, lastEvaluated: '3m ago', actionProtocol: 'Deploy water sprayers on metal roofs' },
      { id: 'rule-cai-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'Extreme Heat Limit', threshold: 38.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: true, currentValue: 38.8, lastEvaluated: '3m ago', actionProtocol: 'Reduce furnace operating load' },
      { id: 'rule-cai-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Mineral Dust Particulate Limit', threshold: 85, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: true, currentValue: 88, lastEvaluated: '3m ago', actionProtocol: 'Pulse-clean industrial air intake baghouses' },
      { id: 'rule-cai-4', category: 'wind', categoryLabel: 'Wind', name: 'Desert Wind Speed Cap', threshold: 40, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 16, lastEvaluated: '10m ago', actionProtocol: 'Lock material staging silos' },
      { id: 'rule-cai-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Rare Desert Rain Event', threshold: 40, unit: '%', comparison: '>=', enabled: false, isTriggered: false, currentValue: 0, lastEvaluated: '20m ago', actionProtocol: 'Verify site perimeter berms' },
      { id: 'rule-cai-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Facility Pulse Minimum', threshold: 70, unit: '/100', comparison: '<', enabled: true, isTriggered: true, currentValue: 64, lastEvaluated: '3m ago', actionProtocol: 'Notify regional health & safety officer' },
    ],
  },
  {
    id: 'site-saopaulo-center',
    name: 'São Paulo Latin America Center',
    location: {
      city: 'São Paulo',
      country: 'Brazil',
      address: 'Av. Paulista 1000, Bela Vista, São Paulo SP',
      coordinates: { lat: -23.5505, lng: -46.6333 },
      climateZone: 'Cwa (Monsoon-influenced Subtropical)',
    },
    pulse: 85,
    currentTemp: 27.2,
    apparentTemp: 28.6,
    surfaceAnomaly: 2.5,
    heatRisk: 'MODERATE',
    airQuality: 48,
    aqiLabel: 'Good',
    windSpeed: 14,
    precipitationProb: 40,
    activeAlertsCount: 0,
    activeAlerts: [],
    lastSync: '7m ago',
    status: 'OPTIMAL',
    facilityType: 'Campus HQ',
    isDemo: true,
    monitoringRules: [
      { id: 'rule-sp-1', category: 'heat_anomaly', categoryLabel: 'Heat Anomaly', name: 'Paulista Urban Thermal Canyon', threshold: 3.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 2.5, lastEvaluated: '7m ago', actionProtocol: 'Engage solar shading louvers' },
      { id: 'rule-sp-2', category: 'extreme_temp', categoryLabel: 'Extreme Temperature', name: 'High Temperature Alert', threshold: 32.0, unit: '°C', comparison: '>=', enabled: true, isTriggered: false, currentValue: 27.2, lastEvaluated: '7m ago', actionProtocol: 'Optimize central chiller circuit' },
      { id: 'rule-sp-3', category: 'air_quality', categoryLabel: 'Air Quality', name: 'Winter Thermal Inversion AQI', threshold: 75, unit: 'AQI', comparison: '>=', enabled: true, isTriggered: false, currentValue: 48, lastEvaluated: '7m ago', actionProtocol: 'Increase fresh air pre-filtering' },
      { id: 'rule-sp-4', category: 'wind', categoryLabel: 'Wind', name: 'Convective Wind Gust Trigger', threshold: 50, unit: 'km/h', comparison: '>=', enabled: false, isTriggered: false, currentValue: 14, lastEvaluated: '15m ago', actionProtocol: 'Secure rooftop equipment' },
      { id: 'rule-sp-5', category: 'precipitation', categoryLabel: 'Precipitation', name: 'Summer Convective Downpour Watch', threshold: 60, unit: '%', comparison: '>=', enabled: true, isTriggered: false, currentValue: 40, lastEvaluated: '7m ago', actionProtocol: 'Check subterranean retention cisterns' },
      { id: 'rule-sp-6', category: 'environmental_risk', categoryLabel: 'Environmental Risk', name: 'Composite Stability Floor', threshold: 75, unit: '/100', comparison: '<', enabled: true, isTriggered: false, currentValue: 85, lastEvaluated: '7m ago', actionProtocol: 'Maintain normal business operations' },
    ],
  },
];

class SiteService {
  private static STORAGE_KEY = 'heatos_monitored_sites_v1';
  private static sites: MonitoredSite[] = [];

  private static loadSites(): MonitoredSite[] {
    if (this.sites.length > 0) {
      return this.sites;
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.sites = JSON.parse(stored);
        return this.sites;
      }
    } catch {
      // fallback
    }
    this.sites = [...INITIAL_DEMO_SITES];
    this.persist();
    return this.sites;
  }

  private static persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sites));
    } catch {
      // ignore
    }
  }

  public static getAllSites(): MonitoredSite[] {
    return this.loadSites();
  }

  public static getSiteById(id: string): MonitoredSite | undefined {
    const sites = this.loadSites();
    return sites.find((s) => s.id === id);
  }

  public static toggleRule(siteId: string, ruleId: string): boolean {
    const sites = this.loadSites();
    const site = sites.find((s) => s.id === siteId);
    if (!site) return false;
    const rule = site.monitoringRules.find((r) => r.id === ruleId);
    if (!rule) return false;
    rule.enabled = !rule.enabled;
    this.persist();
    return true;
  }

  public static updateRuleThreshold(siteId: string, ruleId: string, newThreshold: number): boolean {
    const sites = this.loadSites();
    const site = sites.find((s) => s.id === siteId);
    if (!site) return false;
    const rule = site.monitoringRules.find((r) => r.id === ruleId);
    if (!rule) return false;
    rule.threshold = newThreshold;
    rule.isTriggered = rule.comparison === '>=' ? rule.currentValue >= newThreshold : rule.comparison === '>' ? rule.currentValue > newThreshold : rule.currentValue < newThreshold;
    this.persist();
    return true;
  }

  public static addSite(site: Omit<MonitoredSite, 'id' | 'lastSync'>): MonitoredSite {
    const sites = this.loadSites();
    const newSite: MonitoredSite = {
      ...site,
      id: `site-${Date.now()}`,
      lastSync: 'Just now',
    };
    this.sites = [newSite, ...sites];
    this.persist();
    return newSite;
  }

  public static syncAllSites(): void {
    const sites = this.loadSites();
    this.sites = sites.map((s) => ({
      ...s,
      lastSync: 'Just now',
    }));
    this.persist();
  }

  public static resetToDemoSites(): void {
    this.sites = [...INITIAL_DEMO_SITES];
    this.persist();
  }
}

export const siteService = SiteService;
