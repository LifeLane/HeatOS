# HeatOS System Architecture

HeatOS is a full-stack Environmental Intelligence Operating System. It aggregates fragmented environmental APIs into a unified **Environmental Data Fabric**, normalizes the telemetry, and provides a contextual state via a robust REST API and an integrated AI interpretation layer.

## High-Level Flow

```mermaid
flowchart TD
    U[User]
    UI[HeatOS React Interface]
    API[HeatOS API (Express)]
    FABRIC[Environmental Data Fabric]

    FG[FortyGuard Thermal Mesh]
    NOAA[NOAA NWS]
    EPA[AirNow]
    NASA[NASA EONET / FIRMS]
    PA[PurpleAir]

    AI[HeatOS AI / Tabitoken]

    U -->|Interacts| UI
    UI -->|Requests State| API
    API -->|Orchestrates| FABRIC

    FABRIC --> FG
    FABRIC --> NOAA
    FABRIC --> EPA
    FABRIC --> NASA
    FABRIC --> PA

    FABRIC -->|Normalized Telemetry| API
    API -->|Contextual Evidence| AI
    AI -->|Grounded Insights| UI
```

## System Components

### 1. Frontend Interface (React + Vite)
- Built with React, Tailwind CSS, and standard mapping libraries.
- Operates primarily on the `NormalizedEnvironmentalState` object.
- Handles graceful degradation of UI components if specific telemetry streams are offline.

### 2. API Layer (Node.js + Express)
- Handles routing, input validation, and rate limiting.
- Maps domain-specific requests (e.g., `/api/environmental/pulse`) to internal services.

### 3. Environmental Data Fabric (`src/server/fabric/`)
- **Orchestrator:** Fetches data concurrently from multiple provider classes (`Promise.allSettled`).
- **Normalizer:** Merges diverse JSON structures into a unified `CompositeEnvironmentalState`.
- **Cache Service:** Caches responses based on geospatial grids and temporal TTLs to reduce external API pressure.

### 4. AI Intelligence Layer (`src/server/ai/`)
- Uses Tabitoken (or fallback deterministic models) to interpret environmental conditions.
- **Strict Grounding:** The AI layer *never* fetches raw data itself. It relies entirely on the `CompositeEnvironmentalState` provided by the Fabric.
- **Failure Handling:** If the upstream AI provider returns 403 (e.g., Cloudflare WAF block) or 5xx, the system automatically falls back to a local deterministic intelligence engine to ensure uninterrupted service.

## Resilience & Caching

- **Geospatial Deduplication:** Requests within a 1km radius within the TTL window share cache hits.
- **Graceful Degradation:** A missing API key or 429 response from an external provider simply omits that provider's layer from the final State block. The frontend indicates the reduced data fidelity.
