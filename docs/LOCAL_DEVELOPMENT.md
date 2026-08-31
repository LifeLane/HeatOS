# Local Development Guide

## Prerequisites
- **Node.js** (v22.x recommended)
- **npm** (v10+ recommended)

## Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment:
   ```bash
   cp .env.example .env
   ```
   Add your `TABITOKEN_API_KEY` and any optional environmental provider keys (e.g., `FORTYGUARD_API_KEY`) to the `.env` file.

## Running the Application

### Development Server
Start the full-stack development environment (Vite + Express):
```bash
npm run dev
```
The server will run at `http://localhost:3000`. 
*Note: The frontend and backend run concurrently on the same port using Vite middleware.*

### Production Build
To create an optimized production build:
```bash
npm run build
```
This compiles the React frontend into static assets in `dist/` and bundles the Express server into `dist/server.cjs`.

Run the production server:
```bash
npm run start
```

## Troubleshooting

- **Vite CJS Warning:** You may see a warning: *The CJS build of Vite's Node API is deprecated.* This is a known benign warning resulting from the `vite` dynamic import inside the Express server startup routine. It does not affect functionality.
- **Provider Timeouts:** If the UI shows partial data, check the server console logs (`FortyGuardLogger`). An upstream API may be rate-limiting your requests or experiencing an outage.
- **AI 403 Errors:** If Tabitoken returns an HTML block (Cloudflare challenge) or 403, the system will automatically fall back to the local deterministic engine. Ensure your API key is valid and not rate-limited.
