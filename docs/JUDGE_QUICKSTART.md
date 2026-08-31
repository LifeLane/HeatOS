# HeatOS Judge Quickstart

## What is HeatOS?
HeatOS is a full-stack **Environmental Intelligence Operating System**. It connects fragmented real-world environmental data sources, transforms them into a unified, actionable environmental state, and allows users to interpret microclimates through software and AI.

## The Problem
Environmental data (temperature, air quality, solar radiation, heat anomalies) is currently fragmented across dozens of specialized APIs (NOAA, EPA, NASA, commercial thermal meshes). This fragmentation prevents clear decision-making during environmental hazard events (e.g., urban heat waves or localized pollution spikes).

## The Solution
HeatOS operates a server-side **Environmental Data Fabric** that ingests, normalizes, and fuses these desperate data streams in real-time. Instead of displaying generic "weather" data, HeatOS calculates localized environmental stress, identifies surface heat anomalies, and leverages AI to provide grounded, contextual action plans.

## Why it is different (The "OS" Concept)
Most weather apps are static dashboards. HeatOS is an engineered system featuring:
- **Resilient Orchestration:** Multiple providers queried concurrently with strict timeouts and automatic failover.
- **Contextual Grounding:** AI does not hallucinate data; it interprets the deterministic `CompositeEnvironmentalState` matrix provided by the Fabric.
- **Microclimate Focus:** Analyzes hyper-local variances (e.g., thermal anomalies across urban block boundaries), not just city-wide averages.

## Core Capabilities
- **Environmental Data Fabric:** Parallel synthesis of FortyGuard, NOAA, AirNow, PurpleAir, and NASA data.
- **Unified State API:** REST endpoints delivering normalized environmental snapshots.
- **Grounded AI Interpretation:** Fallback-capable AI analysis strictly bound to observed telemetry.
- **Multi-Location Watchlist:** Concurrent monitoring of operational assets with health scoring.
- **Graceful Degradation:** Resilient UI that adapts if upstream data providers experience outages.

## Architecture at a Glance
```text
REAL ENVIRONMENTAL SOURCES (FortyGuard, NOAA, EPA)
        ↓
PROVIDER ADAPTERS (Fetch, Timeout, Cache)
        ↓
ENVIRONMENTAL DATA FABRIC (Parallel Aggregation)
        ↓
HEATOS API (/api/environmental/state/snapshot)
        ↓
AI INTERPRETATION (Tabitoken / Local Deterministic Engine)
        ↓
USER INTERFACE (HeatOS React App)
```

## Documentation Reference
- **API Reference:** [docs/API.md](API.md)
- **Data Provenance:** [docs/DATA_SOURCES.md](DATA_SOURCES.md)
- **Architecture Details:** [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **Local Setup:** [docs/LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)

## Known Limitations
- The accuracy of microclimate thermal anomalies is dependent on the availability of commercial provider coverage (e.g., FortyGuard) for the requested coordinates.
- Satellite-derived data (e.g., NASA) is subject to orbital revisit times and may reflect "near real-time" rather than absolute real-time conditions.
