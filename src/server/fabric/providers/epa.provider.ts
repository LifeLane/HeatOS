import { BaseEnvironmentalDataProvider } from '../base.provider';
import {
  ProviderConfig,
  GeoLocationQuery,
  ProviderRequestOptions,
  NormalizedProviderTelemetry,
  AirQualityTelemetryBlock,
  DataQualityMetrics,
} from '../types';

export class EPAAirQualityProvider extends BaseEnvironmentalDataProvider {
  public readonly id = 'epa_airnow';
  public readonly name = 'EPA AirNow Air Quality';
  public readonly category = 'air_quality' as const;

  public readonly config: ProviderConfig = {
    id: 'epa_airnow',
    name: 'EPA AirNow Air Quality Service',
    category: 'air_quality',
    enabled: true,
    baseUrl: 'https://www.airnowapi.org/aq/observation/latLong/current',
    authRequirements: 'api_key',
    timeout: 7000,
    rateLimit: {
      maxRequestsPerMinute: 60,
      windowMs: 60000,
    },
    cachePolicy: {
      defaultTtlMs: 900000, // 15 minutes
      staleWhileRevalidateMs: 180000,
    },
    dataTypes: [
      'air_quality_index_aqi',
      'particulate_matter_pm25',
      'particulate_matter_pm10',
      'surface_ozone_o3',
      'nitrogen_dioxide_no2',
      'health_advisories',
    ],
    coverage: {
      region: 'United States & Border Regions',
      spatialResolution: 'Monitoring Station Mesh / Interpolated',
      temporalResolution: 'Hourly Observational',
    },
    attribution: {
      name: 'U.S. EPA AirNow',
      license: 'U.S. Government Work / Public Domain',
      credit: 'Air quality observations provided by the U.S. Environmental Protection Agency (EPA) AirNow Program.',
      url: 'https://www.airnow.gov',
      requiredNotice: 'EPA AirNow Official Air Quality Index',
    },
  };

  protected async ping(): Promise<void> {
    // Ping verification
  }

    public async getCurrentData(
    location: GeoLocationQuery,
    options: ProviderRequestOptions = {}
  ): Promise<NormalizedProviderTelemetry> {
    this.checkRateLimit();
    throw new Error("EPA API Key not configured");
  }

  private determineCategory(
    aqi: number
  ): 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  private determineGuideline(aqi: number): string {
    if (aqi <= 50) return 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
    if (aqi <= 100) return 'Air quality is acceptable. Sensitive individuals should consider reducing prolonged outdoor exertion.';
    if (aqi <= 150) return 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
    return 'Active children and adults, and people with respiratory disease should avoid prolonged outdoor exertion.';
  }
}
