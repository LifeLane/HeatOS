# HeatOS API Reference

The HeatOS backend API provides a unified entry point for requesting and interacting with the Environmental Data Fabric, monitoring services, and AI.

## Base URL
All endpoints are relative to `/api/`

---

## 1. Environmental Pulse
Returns the real-time Environmental Pulse (health/stability score) for a location.

**Endpoint:** `POST /api/environmental/pulse`

### Request Body
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "locationName": "San Francisco",
  "stateCode": "CA",
  "countryCode": "US"
}
```

### Response
```json
{
  "overallScore": 82,
  "overallStatus": "optimal",
  "overallStatusLabel": "Optimal Baseline",
  "indicators": [ ... ],
  "timestamp": "2026-08-31T17:00:00Z"
}
```

---

## 2. Environmental State Snapshot
Retrieves the complete, normalized environmental state for a location across all active data providers.

**Endpoint:** `POST /api/environmental/state/snapshot`

### Request Body
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "locationName": "San Francisco",
  "bypassCache": false
}
```

### Response
```json
{
  "location": { "lat": 37.7749, "lng": -122.4194 },
  "currentConditions": { ... },
  "spatialMetrics": { ... },
  "timestamp": "2026-08-31T17:00:00Z",
  "activeProviders": ["FortyGuard Thermal Fabric", "OpenAQ Data Layer"]
}
```

---

## 3. Environmental Events
Fetches active and historical environmental hazard events or threshold breaches.

**Endpoint:** `POST /api/environmental/events`

### Request Body
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "locationName": "San Francisco",
  "minConfidence": 60
}
```

### Response
```json
{
  "events": [
    {
      "id": "evt_123",
      "type": "HEAT_ANOMALY",
      "severity": "HIGH",
      "summary": { "headline": "Significant Localized Heating" },
      "confidence": 92
    }
  ],
  "totalActiveEvents": 1
}
```

---

## 4. HeatOS AI Analysis Route
Routes a contextual inquiry to the integrated AI models, grounded in the current Environmental Data Fabric state.

**Endpoint:** `POST /api/environmental/ai/route`

### Request Body
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "locationName": "San Francisco",
  "prompt": "What are the primary drivers of the current temperature anomaly?",
  "preferredSkill": "DIAGNOSTIC",
  "bypassCache": false
}
```

### Response
```json
{
  "response": {
    "headline": "Urban Heat Island Effect Detected",
    "whatsHappening": "Surface temperatures in the commercial district are elevated...",
    "why": "High density of low-albedo surfaces...",
    "whatsNext": "Cooling expected after 18:00 local time.",
    "whatToDo": "Route vulnerable populations away from active anomalies.",
    "suggestedQuestions": ["How does this compare to historical baselines?"]
  },
  "metadata": {
    "provider": "tabitoken",
    "modelName": "claude-opus-4-8",
    "latencyMs": 1200
  }
}
```

---

## 5. Map State / Heatmap
Generates spatial distribution data for the environmental map overlay.

**Endpoint:** `POST /api/environmental/heatmap`

### Request Body
```json
{
  "bounds": { "north": 37.8, "south": 37.7, "east": -122.3, "west": -122.5 },
  "resolution": "high",
  "target_parameter": "temperature"
}
```

### Response
```json
{
  "data": [
    { "lat": 37.75, "lng": -122.4, "value": 28.5 }
  ],
  "metadata": {
    "source": "FortyGuard Thermal Fabric"
  }
}
```

---

## 6. Monitoring Watchlist
Retrieves the user's active commercial watchlist of monitored locations.

**Endpoint:** `GET /api/environmental/monitoring/watchlist`

### Response
```json
{
  "watchlist": [
    {
      "id": "loc_1",
      "name": "Downtown Campus",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "status": "WATCH",
      "pulseScore": 85
    }
  ]
}
```
