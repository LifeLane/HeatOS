import {
  IEnvironmentalDataProvider,
  ProviderConfig,
  GeoLocationQuery,
  ProviderRequestOptions,
  NormalizedProviderTelemetry,
  ProviderHealthStatus,
  DataQualityMetrics,
  ProviderAttribution
} from '../types';

export class EonetProvider implements IEnvironmentalDataProvider {
  public readonly id = 'nasa_eonet';
  public readonly name = 'NASA EONET (Earth Observatory Natural Event Tracker)';
  public readonly category = 'wildfire';
  
  public readonly config: ProviderConfig = {
    id: 'nasa_eonet', name: 'NASA EONET', category: 'wildfire', enabled: true,
    baseUrl: 'https://eonet.gsfc.nasa.gov/api/v3', authRequirements: 'none', timeout: 10000,
    rateLimit: { maxRequestsPerMinute: 60, windowMs: 60000 },
    cachePolicy: { defaultTtlMs: 1800000, staleWhileRevalidateMs: 300000 },
    dataTypes: ['natural_events', 'wildfires', 'severe_storms', 'volcanoes'],
    coverage: { region: 'Global', spatialResolution: 'Point/Polygon', temporalResolution: 'Near Real-time' },
    attribution: { name: 'NASA EONET', license: 'Public Domain', credit: 'NASA Earth Observatory', url: 'https://eonet.gsfc.nasa.gov' }
  };

  private readonly HEALTH_ENDPOINT = '/events?limit=1';

  async getCurrentData(location: GeoLocationQuery, options?: ProviderRequestOptions): Promise<NormalizedProviderTelemetry> {
    try {
      const response = await fetch(`${this.config.baseUrl}/events?status=open&days=10`, { signal: options?.signal });
      if (!response.ok) throw new Error('EONET API Error');
      const data = await response.json();

      let activeFiresCountInRadius = 0;
      let nearestFireDistanceKm = 1000;
      
      const events = data.events || [];
      const R = 6371; // Earth radius in km
      
      for (const event of events) {
        if (!event.geometries || event.geometries.length === 0) continue;
        const geom = event.geometries[0];
        if (geom.type === 'Point') {
          const [lng, lat] = geom.coordinates;
          const dLat = (lat - location.latitude) * Math.PI / 180;
          const dLon = (lng - location.longitude) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(location.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          if (distance < nearestFireDistanceKm) {
            nearestFireDistanceKm = distance;
          }
          if (distance <= 500) { // Using larger radius for global events
            activeFiresCountInRadius++;
          }
        }
      }

      let riskLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
      let smokePlume: 'clear' | 'light' | 'moderate' | 'heavy' = 'clear';
      
      if (nearestFireDistanceKm < 50) { riskLevel = 'extreme'; smokePlume = 'heavy'; }
      else if (nearestFireDistanceKm < 150) { riskLevel = 'high'; smokePlume = 'moderate'; }
      else if (nearestFireDistanceKm < 500) { riskLevel = 'moderate'; smokePlume = 'light'; }
      
      return {
        providerId: this.id, providerName: this.name, category: this.category,
        timestamp: new Date().toISOString(), attribution: this.config.attribution,
        quality: this.getDataQuality(),
        data: {
          activeFiresCountInRadius,
          nearestFireDistanceKm,
          wildfireRiskLevel: riskLevel,
          smokePlumeRisk: smokePlume,
          detectionSensor: 'EONET'
        },
        raw: data
      };
    } catch (err: any) {
      return this.getFallbackData();
    }
  }

  async getHealth(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}${this.HEALTH_ENDPOINT}`, { signal: AbortSignal.timeout(this.config.timeout) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { providerId: this.id, name: this.name, category: this.category, status: 'online', latencyMs: Date.now() - start, lastCheck: new Date().toISOString() };
    } catch (err: any) {
      return { providerId: this.id, name: this.name, category: this.category, status: 'offline', latencyMs: Date.now() - start, lastCheck: new Date().toISOString(), error: err.message };
    }
  }

  getAttribution(): ProviderAttribution { return this.config.attribution; }
  getDataQuality(): DataQualityMetrics { return { freshness: 'live', confidence: 95, availability: 'online', quality: 'high', lastUpdated: new Date().toISOString() }; }

  private getFallbackData(): NormalizedProviderTelemetry {
    return {
      providerId: this.id, providerName: this.name, category: this.category,
      timestamp: new Date().toISOString(), attribution: this.config.attribution,
      quality: { freshness: 'fallback', confidence: 50, availability: 'offline', quality: 'estimated', lastUpdated: new Date().toISOString() },
      data: { activeFiresCountInRadius: 0, nearestFireDistanceKm: undefined, wildfireRiskLevel: 'low', smokePlumeRisk: 'clear', detectionSensor: 'NASA EONET' }
    };
  }
}
