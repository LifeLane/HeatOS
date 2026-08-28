/**
 * HeatOS: Centralized AI Provider Client (Tabi Token Only)
 * 
 * Environment Variables (Server-side only):
 * - TABITOKEN_ENDPOINT (default: https://tabitoken.com/v1/chat/completions)
 * - TABITOKEN_API_KEY (default: sk-l1Ev24TEAoiVrLX0kTEIPMxvsHWSJYkw4tBgYVt1XJfPlxmp)
 * - TABITOKEN_MODEL (default: claude-opus-4-8)
 * - TABITOKEN_TIMEOUT (default: 55000 ms)
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
  const apiKey = process.env.TABITOKEN_API_KEY || process.env.GROQ_API_KEY || 'sk-l1Ev24TEAoiVrLX0kTEIPMxvsHWSJYkw4tBgYVt1XJfPlxmp';
  const endpoint = process.env.TABITOKEN_ENDPOINT || 'https://tabitoken.com/v1/chat/completions';
  const model = process.env.TABITOKEN_MODEL || process.env.GROQ_MODEL || 'claude-opus-4-8';
  const timeoutMs = parseInt(process.env.TABITOKEN_TIMEOUT || process.env.GROQ_TIMEOUT || '55000', 10);
  const maxRetries = parseInt(process.env.TABITOKEN_MAX_RETRIES || process.env.GROQ_MAX_RETRIES || '1', 10);

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
 * Executes a call to Tabi Token API with robust timeout, retries, and strict error handling.
 */
export async function callTabiTokenChat(params: {
  systemInstruction: string;
  userPrompt: string;
  imageUrl?: string;
}): Promise<RawAIProviderOutput | null> {
  const config = getTabiTokenConfig();
  if (!config.apiKey) {
    throw new Error('TABITOKEN_API_KEY environment variable is not configured.');
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

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        FortyGuardLogger.warn(`TabiToken HTTP ${response.status} on attempt ${attempt}: ${errText.substring(0, 200)}`);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(`TabiToken Authentication Error (${response.status}): Invalid API key.`);
        }

        if (attempt <= config.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`TabiToken API error: HTTP ${response.status} - ${errText.substring(0, 100)}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('TabiToken returned empty response content.');
      }
      
      const parsed = parseReasoningAndJsonOutput(content);
      if (parsed && parsed.whatsHappening && parsed.why && parsed.whatsNext && parsed.whatToDo) {
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
      throw new Error('Failed to parse valid structured JSON from TabiToken response.');
    } catch (err: any) {
      clearTimeout(timeoutId);
      FortyGuardLogger.warn(`TabiToken request error on attempt ${attempt}: ${err.message}`);
      if (err.name === 'AbortError') {
        throw new Error(`TabiToken request timed out after ${config.timeoutMs}ms.`);
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

// Backwards-compatibility aliases
export const callGroqChat = callTabiTokenChat;
export const callNvidiaChat = callTabiTokenChat;
export const callNvidiaMoonshotChat = callTabiTokenChat;
export function getGroqConfig() {
  return {
    apiKey: getTabiTokenConfig().apiKey,
    model: getTabiTokenConfig().model,
    timeoutMs: getTabiTokenConfig().timeoutMs,
    maxRetries: getTabiTokenConfig().maxRetries,
  };
}
export function getNvidiaConfig() { return getGroqConfig(); }
export function getMoonshotConfig() { return getGroqConfig(); }
