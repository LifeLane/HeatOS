/**
 * Centralized FortyGuard Endpoint Registry
 * All endpoints are scoped to /v1
 */

export const FORTYGUARD_API_VERSION = '/v1';

export const FORTYGUARD_ENDPOINTS = {
  // Core Endpoints
  ENV_PARAMS: `${FORTYGUARD_API_VERSION}/env_params`,
  HEATMAP: `${FORTYGUARD_API_VERSION}/heatmap`,
  STATUS: (activityId: string) => `${FORTYGUARD_API_VERSION}/status/${encodeURIComponent(activityId)}`,

  // Optional Premium Capabilities (Not required for core HeatOS)
  HEAT_INTELLIGENCE: `${FORTYGUARD_API_VERSION}/heat_intelligence`,
  SATELLITE: `${FORTYGUARD_API_VERSION}/satellite`,
  STREETVIEW: `${FORTYGUARD_API_VERSION}/streetview`,
} as const;

export type FortyGuardEndpointKey = keyof typeof FORTYGUARD_ENDPOINTS;
