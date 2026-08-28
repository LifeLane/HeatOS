import {
  IEnvironmentalDataProvider,
  ProviderCategory,
  ProviderHealthStatus,
  ProviderConfig,
  ProviderAttribution,
} from './types';
import { FortyGuardFabricProvider } from './providers/fortyguard.provider';
import { NOAAWeatherProvider } from './providers/noaa.provider';
import { EPAAirQualityProvider } from './providers/epa.provider';
import { NASAFIRMSWildfireProvider } from './providers/nasa-firms.provider';
import { OpenSatelliteVegetationProvider } from './providers/satellite-ndvi.provider';
import { USGSWaterProvider } from './providers/usgs-water.provider';
import { EonetProvider } from './providers/eonet.provider';
import { PurpleAirProvider } from './providers/purpleair.provider';


export class EnvironmentalProviderRegistry {
  private providers: Map<string, IEnvironmentalDataProvider> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // 1. Primary Thermal Layer
    this.register(new FortyGuardFabricProvider());

    // 2. Open Environmental Context Layers
    this.register(new NOAAWeatherProvider());
    this.register(new EPAAirQualityProvider());
    this.register(new NASAFIRMSWildfireProvider());
    this.register(new OpenSatelliteVegetationProvider());
    this.register(new USGSWaterProvider());
    this.register(new EonetProvider());
    this.register(new PurpleAirProvider());
  }

  public register(provider: IEnvironmentalDataProvider): void {
    this.providers.set(provider.id, provider);
  }

  public unregister(providerId: string): boolean {
    return this.providers.delete(providerId);
  }

  public get(providerId: string): IEnvironmentalDataProvider | undefined {
    return this.providers.get(providerId);
  }

  public getByCategory(category: ProviderCategory): IEnvironmentalDataProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.category === category);
  }

  public getAll(): IEnvironmentalDataProvider[] {
    return Array.from(this.providers.values());
  }

  public getAllConfigs(): ProviderConfig[] {
    return this.getAll().map((p) => p.config);
  }

  public getAllAttributions(): ProviderAttribution[] {
    return this.getAll().map((p) => p.getAttribution());
  }

  public setEnabled(providerId: string, enabled: boolean): boolean {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.config.enabled = enabled;
      return true;
    }
    return false;
  }

  public async getHealthReport(): Promise<ProviderHealthStatus[]> {
    const providers = this.getAll();
    const results = await Promise.allSettled(providers.map((p) => p.getHealth()));

    return results.map((res, index) => {
      if (res.status === 'fulfilled') {
        return res.value;
      }
      const p = providers[index];
      return {
        providerId: p.id,
        name: p.name,
        category: p.category,
        status: 'offline',
        latencyMs: 0,
        lastCheck: new Date().toISOString(),
        error: res.reason?.message || 'Health check failed',
      };
    });
  }
}

export const globalProviderRegistry = new EnvironmentalProviderRegistry();
