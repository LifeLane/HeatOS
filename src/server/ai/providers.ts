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
  const apiKey = process.env.TABITOKEN_API_KEY || '';
  const endpoint = process.env.TABITOKEN_ENDPOINT || 'https://tabitoken.com/v1/chat/completions';
  const model = process.env.TABITOKEN_MODEL || 'claude-opus-4-8';
  const timeoutMs = parseInt(process.env.TABITOKEN_TIMEOUT || '55000', 10);
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

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        FortyGuardLogger.warn(`TabiToken HTTP ${response.status} on attempt ${attempt}`, {
          requestId,
          status: response.status,
          latencyMs,
          errorSnippet: errText.substring(0, 200),
        });

        let errorCode = 'TABITOKEN_UPSTREAM_ERROR';
        if (response.status === 401 || response.status === 403) {
          errorCode = 'TABITOKEN_AUTH_ERROR';
          const authErr: any = new Error(`TabiToken Authentication Error (${response.status}): Access denied or invalid API key.`);
          authErr.code = errorCode;
          throw authErr;
        } else if (response.status === 429) {
          errorCode = 'TABITOKEN_RATE_LIMIT';
        } else if (response.status >= 500) {
          errorCode = 'TABITOKEN_MODEL_ERROR';
        }

        if (attempt <= config.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }

        const upErr: any = new Error(`TabiToken API error: HTTP ${response.status} - ${errText.substring(0, 100)}`);
        upErr.code = errorCode;
        throw upErr;
      }

      const json = await response.json();
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

      if (attempt <= config.maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
  return null;
}
