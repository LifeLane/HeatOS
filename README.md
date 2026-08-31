# HeatOS

**The Environmental Operating System**

> HeatOS turns fragmented real-world environmental data into a unified, actionable environmental intelligence layer.

HeatOS is an engineered full-stack application that connects disparate environmental data sources (NOAA, EPA, NASA, and commercial thermal meshes) into a resilient **Environmental Data Fabric**. It transforms this data into a unified environmental state and leverages AI to make complex microclimates understandable and actionable.

## Overview

Traditional weather applications provide regional approximations. HeatOS provides an **Environmental Intelligence Engine** designed to handle localized thermal anomalies, compound hazard events, and operational monitoring.

Key features include:
- **Resilient Data Fabric:** Concurrently orchestrates and normalizes data from FortyGuard, NOAA, AirNow, PurpleAir, and NASA APIs.
- **Grounded AI Interpretation:** An integrated AI layer (Tabitoken) that strictly analyzes the observed deterministic telemetry, ensuring accurate, non-hallucinated insights.
- **Graceful Degradation:** A robust backend that handles API rate limits, 403 blocks, and timeouts via caching and automatic failovers (including a local deterministic AI engine).
- **Commercial Monitoring:** A watchlist system for tracking environmental risk across multiple operational assets or geographic sites.

## Documentation

For a complete technical overview, refer to the documentation directory:

- [Judge Quickstart](docs/JUDGE_QUICKSTART.md) - A two-minute technical overview for hackathon evaluation.
- [Architecture](docs/ARCHITECTURE.md) - High-level system design and data flow.
- [API Reference](docs/API.md) - Documentation for the HeatOS backend REST APIs.
- [Data Sources & Provenance](docs/DATA_SOURCES.md) - Verification of integrated environmental providers and failure strategies.
- [Environment Configuration](docs/ENVIRONMENT.md) - Guide to required environment variables.
- [Local Development](docs/LOCAL_DEVELOPMENT.md) - Instructions for building and running the project locally.

## Project Structure

- `/src/server/fabric/`: The core Environmental Data Fabric, housing provider adapters (NOAA, EPA, FortyGuard) and the orchestration engine.
- `/src/server/ai/`: The AI intelligence layer, featuring robust Tabitoken integration, caching, and deterministic fallback models.
- `/src/components/`: The React-based frontend interface, utilizing Tailwind CSS for pristine, data-dense layouts.
- `/docs/`: Extensive technical documentation.

## Running the Application

Ensure you have Node.js v22.x installed.

```bash
npm install
cp .env.example .env
# Edit .env with your TABITOKEN_API_KEY
npm run dev
```
Navigate to `http://localhost:3000`.
