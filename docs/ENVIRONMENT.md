# Environment Variables

HeatOS uses environment variables to configure external API integrations, server behavior, and AI models.

**Never commit real API keys to version control.** Use the `.env.example` file as a template.

## Required Variables

| Variable | Purpose | Used By |
|----------|---------|---------|
| `APP_URL` | The fully qualified URL where this applet is hosted (e.g., for OAuth or CORS). | API Layer |

## AI Configuration (Tabitoken)

| Variable | Purpose | Used By |
|----------|---------|---------|
| `TABITOKEN_API_KEY` | (Required) API key for the Tabitoken LLM service. | `src/server/ai/providers.ts` |
| `TABITOKEN_ENDPOINT` | The chat completions endpoint URL. Default: `https://tabitoken.com/v1/chat/completions` | `src/server/ai/providers.ts` |
| `TABITOKEN_MODEL` | The model alias to use. Default: `claude-opus-4-8` | `src/server/ai/providers.ts` |
| `TABITOKEN_TIMEOUT` | Max MS to wait for an AI response before timing out. Default: `20000` | `src/server/ai/providers.ts` |
| `TABITOKEN_MAX_RETRIES` | Number of times to retry failed AI requests (excluding 401/403). Default: `1` | `src/server/ai/providers.ts` |

## Environmental Providers

| Variable | Purpose | Used By |
|----------|---------|---------|
| `FORTYGUARD_API_KEY` | (Optional) API key for the FortyGuard Thermal Mesh integration. | `src/server/fabric/providers/fortyguard.provider.ts` |
| `FORTYGUARD_BASE_URL` | Override for the FortyGuard API URL. | `src/server/fortyguard/config.ts` |
| `FORTYGUARD_MOCK` | Set to `true` to force mock responses for testing without an API key. | `src/server/fortyguard/config.ts` |
| `AIRNOW_API_KEY` | (Optional) API key for the EPA AirNow API. | `src/server/fabric/providers/epa.provider.ts` |
| `PURPLEAIR_API_KEY` | (Optional) API key for the PurpleAir API. | `src/server/fabric/providers/purpleair.provider.ts` |

*Note: If optional environmental API keys are omitted, HeatOS will gracefully bypass those specific integrations or fall back to open data sources.*
