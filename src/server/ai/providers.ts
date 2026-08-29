/**
 * HeatOS: Centralized AI Provider Client (Tabi Token Only)
 * 
 * Environment Variables (Server-side only):
 * - TABITOKEN_ENDPOINT (default: https://tabitoken.com/v1/chat/completions)
 * - TABITOKEN_API_KEY
 * - TABITOKEN_MODEL (default: claude-opus-4-8)
 * - TABITOKEN_TIMEOUT (default: 55000 ms)
 * - TABITOKEN_MAX_RETRIES (default: 1)
 */
import { FortyGuardLogger } from '../fortyguard/logger';

export interface ProviderConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

export function getTabiTokenConfig(): ProviderConfig {
  let rawApiKey = (process.env.TABITOKEN_API_KEY || '').trim();
  // Remove wrapping quotes if present
  if ((rawApiKey.startsWith('"') && rawApiKey.endsWith('"')) || (rawApiKey.startsWith("'") && rawApiKey.endsWith("'"))) {
    rawApiKey = rawApiKey.slice(1, -1).trim();
  }
  if (
    rawApiKey === 'MY_TABITOKEN_API_KEY' ||
    rawApiKey === 'your_tabitoken_api_key' ||
    rawApiKey === 'undefined' ||
    rawApiKey === 'null' ||
    rawApiKey.includes('PLACEHOLDER') ||
    rawApiKey.length < 8
  ) {
    rawApiKey = '';
  }
  if (rawApiKey.includes('\n') || rawApiKey.includes('\r')) {
    const lines = rawApiKey.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
    const skLine = lines.find(l => l.startsWith('sk-') || l.startsWith('Bearer ') || l.startsWith('-'));
    rawApiKey = skLine || lines[0] || '';
  }
  if (rawApiKey.startsWith('Bearer ')) {
    rawApiKey = rawApiKey.substring(7).trim();
  }
  const apiKey = rawApiKey.trim();
  const endpoint = (process.env.TABITOKEN_ENDPOINT || 'https://tabitoken.com/v1/chat/completions').trim();
  const model = (process.env.TABITOKEN_MODEL || 'claude-opus-4-8').trim();
  const timeoutMs = parseInt(process.env.TABITOKEN_TIMEOUT || '20000', 10);
  const maxRetries = parseInt(process.env.TABITOKEN_MAX_RETRIES || '1', 10);

  return {
    endpoint,
    apiKey,
    model,
    timeoutMs,
    maxRetries,
  };
}

export interface RawAIProviderOutput {
  headline?: string;
  whatsHappening: string;
  why: string;
  whatsNext: string;
  whatToDo: string;
  suggestedQuestions?: string[];
  confidence?: number;
}

function parseReasoningAndJsonOutput(rawContent: string): any {
  if (!rawContent) return null;
  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

/**
 * Executes a call to Tabi Token API with robust timeout, retries, and structured error handling.
 */
export async function callTabiTokenChat(params: {
  requestId?: string;
  systemInstruction: string;
  userPrompt: string;
  imageUrl?: string;
}): Promise<RawAIProviderOutput | null> {
  const startTime = Date.now();
  const requestId = params.requestId || `tabi_req_${startTime}`;
  const config = getTabiTokenConfig();

  if (!config.apiKey) {
    FortyGuardLogger.error('TabiToken configuration error: API key missing', { requestId, errorCode: 'TABITOKEN_CONFIG_ERROR' });
    const err: any = new Error('TABITOKEN_API_KEY is not configured on the server.');
    err.code = 'TABITOKEN_CONFIG_ERROR';
    throw err;
  }

  let attempt = 0;
  while (attempt <= config.maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const messages: any[] = [
        {
          role: 'system',
          content: `${params.systemInstruction}\n\nIMPORTANT: Output MUST be a single raw valid JSON object with keys: "headline", "whatsHappening", "why", "whatsNext", "whatToDo", "suggestedQuestions". Do not include markdown code block backticks.`,
        },
      ];

      if (params.imageUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: params.userPrompt },
            { type: 'image_url', image_url: { url: params.imageUrl } },
          ],
        });
      } else {
        messages.push({
          role: 'user',
          content: params.userPrompt,
        });
      }

      FortyGuardLogger.info('TabiToken request start', {
        requestId,
        model: config.model,
        attempt,
        endpoint: config.endpoint,
      });

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'HeatOS-Environmental-Fabric/1.0 (Enterprise Engine; +https://heatos.vercel.app)',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.1,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (contentType.includes('text/html') || responseText.trim().toLowerCase().startsWith('<!doctype') || responseText.trim().toLowerCase().startsWith('<html')) {
        FortyGuardLogger.warn(`TabiToken upstream returned HTML block (Cloudflare/WAF) instead of JSON on attempt ${attempt}`, {
          requestId,
          status: response.status,
          contentType,
          snippet: responseText.substring(0, 150),
        });
        const htmlErr: any = new Error(`TabiToken upstream returned HTML protection/challenge page (HTTP ${response.status}). Access blocked.`);
        htmlErr.code = 'TABITOKEN_UPSTREAM_BLOCKED';
        throw htmlErr;
      }

      if (!response.ok) {
        let errorCode = 'TABITOKEN_UPSTREAM_ERROR';
        if (response.status === 401 || response.status === 403) {
          errorCode = 'TABITOKEN_AUTH_ERROR';
          FortyGuardLogger.info(`TabiToken auth unavailable (${response.status}), switching to local deterministic intelligence`, {
            requestId,
            status: response.status,
            latencyMs,
          });
          const authErr: any = new Error(`TabiToken Authentication Error (${response.status}): Access denied or invalid API key.`);
          authErr.code = errorCode;
          throw authErr;
        } else if (response.status === 429) {
          errorCode = 'TABITOKEN_RATE_LIMIT';
        } else if (response.status >= 500) {
          errorCode = 'TABITOKEN_MODEL_ERROR';
        }

        FortyGuardLogger.warn(`TabiToken HTTP ${response.status} on attempt ${attempt}`, {
          requestId,
          status: response.status,
          latencyMs,
          errorSnippet: responseText.substring(0, 200),
        });

        if (attempt <= config.maxRetries && response.status !== 401 && response.status !== 403) {
          await new Promise(r => setTimeout(r, 500 * attempt));
          continue;
        }

        const upErr: any = new Error(`TabiToken API error: HTTP ${response.status} - ${responseText.substring(0, 100)}`);
        upErr.code = errorCode;
        throw upErr;
      }

      let json: any;
      try {
        json = JSON.parse(responseText);
      } catch (parseErr: any) {
        throw new Error(`Failed to parse JSON from TabiToken response: ${parseErr.message}`);
      }

      const content = json.choices?.[0]?.message?.content;

      FortyGuardLogger.info('TabiToken response received', {
        requestId,
        model: config.model,
        status: response.status,
        latencyMs,
      });

      if (!content) {
        const emptyErr: any = new Error('TabiToken returned empty response content.');
        emptyErr.code = 'TABITOKEN_INVALID_RESPONSE';
        throw emptyErr;
      }

      const parsed = parseReasoningAndJsonOutput(content);
      if (parsed && parsed.whatsHappening && parsed.why && parsed.whatsNext && parsed.whatToDo) {
        FortyGuardLogger.info('TabiToken JSON successfully parsed', { requestId, model: config.model });
        return {
          headline: parsed.headline,
          whatsHappening: parsed.whatsHappening,
          why: parsed.why,
          whatsNext: parsed.whatsNext,
          whatToDo: parsed.whatToDo,
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : undefined,
          confidence: 96,
        };
      }

      const parseErr: any = new Error('Failed to parse valid structured JSON from TabiToken response.');
      parseErr.code = 'TABITOKEN_INVALID_RESPONSE';
      throw parseErr;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      FortyGuardLogger.warn(`TabiToken request error on attempt ${attempt}: ${err.message}`, {
        requestId,
        model: config.model,
        latencyMs,
        errorCode: err.code || 'AI_INTERNAL_ERROR',
      });

      if (err.name === 'AbortError') {
        const timeoutErr: any = new Error(`TabiToken request timed out after ${config.timeoutMs}ms.`);
        timeoutErr.code = 'TABITOKEN_TIMEOUT';
        throw timeoutErr;
      }

      const nonRetryableCodes = ['TABITOKEN_AUTH_ERROR', 'TABITOKEN_CONFIG_ERROR', 'TABITOKEN_UPSTREAM_BLOCKED'];
      if (!nonRetryableCodes.includes(err.code) && attempt <= config.maxRetries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      throw err;
    }
  }
  return null;
}
