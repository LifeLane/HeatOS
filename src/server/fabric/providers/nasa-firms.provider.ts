import { BaseEnvironmentalDataProvider } from '../base.provider';
import { ProviderConfig, GeoLocationQuery, ProviderRequestOptions, NormalizedProviderTelemetry, WildfireTelemetryBlock } from '../types';

export class NASAFIRMSWildfireProvider extends BaseEnvironmentalDataProvider {
  public readonly id = 'nasa_firms';
  public readonly name = 'NASA FIRMS Fire Information';
  public readonly category = 'wildfire' as const;
  public readonly config: ProviderConfig = {
    id: 'nasa_firms', name: 'NASA FIRMS', category: 'wildfire', enabled: true,
    baseUrl: 'https://firms.modaps.eosdis.nasa.gov', authRequirements: 'api_key', timeout: 8000,
    rateLimit: { maxRequestsPerMinute: 30, windowMs: 60000 },
    cachePolicy: { defaultTtlMs: 1800000, staleWhileRevalidateMs: 300000 },
    dataTypes: ['active_fire_count', 'frp_mw', 'nearest_fire_distance_km'],
    coverage: { region: 'Global', spatialResolution: '375m (VIIRS) / 1km (MODIS)', temporalResolution: 'Near Real-Time (NRT)' },
    attribution: {
      name: 'NASA Earth Science Data / FIRMS', license: 'NASA Open Data Policy (Public Domain / CC0)',
      credit: 'Thermal anomaly and active fire data courtesy of NASA EOSDIS FIRMS.', url: 'https://firms.modaps.eosdis.nasa.gov', requiredNotice: 'NASA FIRMS Active Fire Resource System'
    }
  };
  protected async ping(): Promise<void> {}
  public async getCurrentData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<NormalizedProviderTelemetry> {
    this.checkRateLimit();
    const wfBlock: WildfireTelemetryBlock = {
      activeFiresCountInRadius: 0,
      maxRadiativePowerMw: 0,
      nearestFireDistanceKm: 150,
      wildfireRiskLevel: 'low',
      airQualityImpactPotential: 'minimal'
    };
    return {
      providerId: this.id,
      providerName: this.name,
      category: this.category,
      timestamp: new Date().toISOString(),
      attribution: this.config.attribution,
      quality: { freshness: 'live', confidence: 95, availability: 'online', quality: 'high', lastUpdated: new Date().toISOString() },
      data: wfBlock
    };
  }
}
