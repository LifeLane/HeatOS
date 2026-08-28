/**
 * HeatOS: Explanation Context & Hook
 * 
 * Global state provider for the Universal Explanation System.
 * Enables opening and rendering `<MetricExplanation />` from anywhere.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ExplanationMetadata } from '../types/explanation';
import { ExplanationService } from '../services/explanationService';
import { useLocation } from './LocationContext';
import { EnvironmentalEvent } from '../server/events/types';
import { SpatialZone } from '../types';
import { LocationSnapshotData } from '../components/map/LocationInspectorPanel';

interface ExplanationContextType {
  isOpen: boolean;
  activeExplanation: ExplanationMetadata | null;
  openExplanation: (data: ExplanationMetadata) => void;
  explainMetric: (
    metricKey: string,
    value?: string | number,
    overrides?: Partial<ExplanationMetadata>
  ) => void;
  explainAlert: (alert: EnvironmentalEvent) => void;
  explainForecastEvent: (event: {
    title: string;
    time: string;
    temperature: string;
    anomaly: string;
    why: string;
    keySignals?: string[];
    confidence?: number;
    limitations?: string;
  }) => void;
  explainZone: (zone: SpatialZone, metricKey?: string) => void;
  explainMapLocation: (snapshot: LocationSnapshotData, metricKey?: string) => void;
  explainAIInsight: (headline: string, summary: string, signals: string[]) => void;
  closeExplanation: () => void;
}

const ExplanationContext = createContext<ExplanationContextType | undefined>(undefined);

export const ExplanationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeExplanation, setActiveExplanation] = useState<ExplanationMetadata | null>(null);

  const { currentLocation, normalizedState, formatTemp } = useLocation();

  const openExplanation = useCallback((data: ExplanationMetadata) => {
    setActiveExplanation(data);
    setIsOpen(true);
  }, []);

  const closeExplanation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const explainMetric = useCallback(
    (
      metricKey: string,
      value?: string | number,
      overrides?: Partial<ExplanationMetadata>
    ) => {
      const metadata = ExplanationService.getMetricExplanation(
        metricKey,
        value,
        currentLocation,
        normalizedState,
        overrides
      );
      openExplanation(metadata);
    },
    [currentLocation, normalizedState, openExplanation]
  );

  const explainAlert = useCallback(
    (alert: EnvironmentalEvent) => {
      const metadata = ExplanationService.getAlertExplanation(alert, currentLocation);
      openExplanation(metadata);
    },
    [currentLocation, openExplanation]
  );

  const explainForecastEvent = useCallback(
    (event: {
      title: string;
      time: string;
      temperature: string;
      anomaly: string;
      why: string;
      keySignals?: string[];
      confidence?: number;
      limitations?: string;
    }) => {
      const metadata = ExplanationService.getForecastEventExplanation(event);
      openExplanation(metadata);
    },
    [openExplanation]
  );

  const explainZone = useCallback(
    (zone: SpatialZone, metricKey?: string) => {
      if (metricKey) {
        explainMetric(metricKey, undefined, {
          label: `${zone.name} • ${metricKey}`,
          status: zone.riskLevel,
        });
      } else {
        const metadata = ExplanationService.getMapLocationExplanation(
          zone.name,
          { lat: zone.coordinates[0], lng: zone.coordinates[1] },
          {
            temperature: formatTemp(zone.surfaceTemp),
            heatAnomaly: `+${zone.heatIslandFactor}°C`,
            aqi: '42 AQI',
            wind: '14 km/h',
            humidity: '52%',
            pulse: '76/100',
          },
          `Zone ${zone.name} exhibits +${zone.heatIslandFactor}°C localized surface heating due to high asphalt coverage and ${zone.canopyCover}% tree canopy coverage.`
        );
        openExplanation(metadata);
      }
    },
    [explainMetric, formatTemp, openExplanation]
  );

  const explainMapLocation = useCallback(
    (snapshot: LocationSnapshotData, metricKey?: string) => {
      if (metricKey) {
        let val: string | number | undefined;
        if (metricKey === 'temperature' || metricKey === 'ambientTemp') {
          val = `${snapshot.temperatureC.toFixed(1)}°C`;
        } else if (metricKey === 'surfaceHeatAnomaly' || metricKey === 'heatAnomaly') {
          val = `${snapshot.heatAnomalyC >= 0 ? '+' : ''}${snapshot.heatAnomalyC.toFixed(1)}°C`;
        } else if (metricKey === 'airQuality' || metricKey === 'aqi') {
          val = `${snapshot.airQualityAqi} AQI`;
        } else if (metricKey === 'wind') {
          val = `${snapshot.windSpeedKmh} km/h ${snapshot.windDirection}`;
        } else if (metricKey === 'humidity') {
          val = `${snapshot.humidityPct}%`;
        } else if (metricKey === 'environmentalPulse' || metricKey === 'pulse') {
          val = `${snapshot.environmentalPulseScore}/100`;
        }

        explainMetric(metricKey, val, {
          label: `${snapshot.locationName} • ${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}`,
        });
      } else {
        const metadata = ExplanationService.getMapLocationExplanation(
          snapshot.locationName,
          { lat: snapshot.latitude, lng: snapshot.longitude },
          {
            temperature: `${snapshot.temperatureC.toFixed(1)}°C`,
            heatAnomaly: `${snapshot.heatAnomalyC >= 0 ? '+' : ''}${snapshot.heatAnomalyC.toFixed(1)}°C`,
            aqi: `${snapshot.airQualityAqi} AQI`,
            wind: `${snapshot.windSpeedKmh} km/h`,
            humidity: `${snapshot.humidityPct}%`,
            pulse: `${snapshot.environmentalPulseScore}/100`,
          },
          `Coordinates in ${snapshot.locationName} exhibit ${
            snapshot.heatAnomalyC > 2
              ? `elevated +${snapshot.heatAnomalyC.toFixed(1)}°C microclimatic heat retention driven by paved surface density and ${snapshot.canopyCoveragePct || 20}% tree canopy.`
              : `balanced thermal regulation buffered by vegetation and open airflow.`
          }`
        );
        openExplanation(metadata);
      }
    },
    [explainMetric, openExplanation]
  );

  const explainAIInsight = useCallback(
    (headline: string, summary: string, signals: string[]) => {
      const metadata = ExplanationService.getAIInsightExplanation(headline, summary, signals);
      openExplanation(metadata);
    },
    [openExplanation]
  );

  return (
    <ExplanationContext.Provider
      value={{
        isOpen,
        activeExplanation,
        openExplanation,
        explainMetric,
        explainAlert,
        explainForecastEvent,
        explainZone,
        explainMapLocation,
        explainAIInsight,
        closeExplanation,
      }}
    >
      {children}
    </ExplanationContext.Provider>
  );
};

export const useExplanation = () => {
  const context = useContext(ExplanationContext);
  if (!context) {
    throw new Error('useExplanation must be used within an ExplanationProvider');
  }
  return context;
};
