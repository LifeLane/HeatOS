/**
 * HeatOS: Centralized AI Provider Clients (Groq Primary + Nvidia Fallback)
 * 
 * Environment Variables (Server-side only):
 * - GROQ_API_KEY, GROQ_MODEL, GROQ_TIMEOUT, GROQ_MAX_RETRIES
 * - NVIDIA_API_KEY, NVIDIA_MODEL, NVIDIA_TIMEOUT, NVIDIA_MAX_RETRIES
 */
import OpenAI from 'openai';
import { FortyGuardLogger } from '../fortyguard/logger';

export interface ProviderConfig {
  apiKey?: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

export function getGroqConfig(): ProviderConfig {
  return {
    apiKey: process.env.TABITOKEN_API_KEY || process.env.GROQ_API_KEY || 'sk-l1Ev24TEAoiVrLX0kTEIPMxvsHWSJYkw4tBgYVt1XJfPlxmp',
    model: process.env.TABITOKEN_MODEL || process.env.GROQ_MODEL || 'claude-opus-4-8',
    timeoutMs: parseInt(process.env.GROQ_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.GROQ_MAX_RETRIES || '2', 10),
  };
}

export function getNvidiaConfig(): ProviderConfig {
  return {
    apiKey: process.env.NVIDIA_API_KEY,
    model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
    timeoutMs: parseInt(process.env.NVIDIA_TIMEOUT || '12000', 10),
    maxRetries: parseInt(process.env.NVIDIA_MAX_RETRIES || '2', 10),
  };
}


export function getMoonshotConfig(): ProviderConfig {
  return {
    apiKey: process.env.NVIDIA_API_KEY,
    model: process.env.MOONSHOT_MODEL || 'moonshotai/kimi-k3',
    timeoutMs: parseInt(process.env.MOONSHOT_TIMEOUT || '15000', 10),
    maxRetries: parseInt(process.env.MOONSHOT_MAX_RETRIES || '2', 10),
  };
}

let nvidiaClient: OpenAI | null = null;
export function getNvidiaClient(): OpenAI | null {
  const config = getNvidiaConfig();
  if (!config.apiKey) return null;

  if (!nvidiaClient) {
    try {
      nvidiaClient = new OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });
    } catch (err: any) {
      FortyGuardLogger.error('Failed to initialize Nvidia OpenAI client', {
        error: err.message,
      });
      return null;
    }
  }
  return nvidiaClient;
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

/**
 * Robustly extracts and parses JSON from LLM outputs, handling reasoning tags (<think>...</think>),
 * markdown code blocks, and extra conversational text.
 */
function parseReasoningAndJsonOutput(rawContent: string): any {
  if (!rawContent) return null;

  // 1. Strip <think>...</think> reasoning blocks if present (e.g. from reasoning models)
  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // 2. Strip markdown code blocks (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 3. Find first { and last } to isolate JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Executes a call to Groq API (OpenAI-compatible /chat/completions) with retries & timeouts
 */
export async function callGroqChat(params: {
  systemInstruction: string;
  userPrompt: string;
}): Promise<RawAIProviderOutput | null> {
  const config = getGroqConfig();
  if (!config.apiKey) {
    return null;
  }

  const endpoint = process.env.TABITOKEN_ENDPOINT || 'https://tabitoken.com/v1/chat/completions';
  let attempt = 0;

  while (attempt <= config.maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: `${params.systemInstruction}\n\nIMPORTANT: Output MUST be a single raw valid JSON object with keys: "headline", "whatsHappening", "why", "whatsNext", "whatToDo", "suggestedQuestions". Do not include markdown code block backticks.`,
            },
            {
              role: 'user',
              content: params.userPrompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 1536,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        FortyGuardLogger.warn(`Groq HTTP ${response.status} on attempt ${attempt}: ${errText.substring(0, 150)}`);
        
        if (response.status === 401 || response.status === 403) {
          // Auth failure, do not retry
          return null;
        }

        if (attempt <= config.maxRetries) {
          await new Promise(r => setTimeout(r, 400 * attempt));
          continue;
        }
        return null;
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      
      if (!content) return null;
      
      const parsed = parseReasoningAndJsonOutput(content);
      if (parsed && parsed.whatsHappening && parsed.why && parsed.whatsNext && parsed.whatToDo) {
        return {
          headline: parsed.headline,
          whatsHappening: parsed.whatsHappening,
          why: parsed.why,
          whatsNext: parsed.whatsNext,
          whatToDo: parsed.whatToDo,
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : undefined,
          confidence: 92,
        };
      }
      return null;
    } catch (err: any) {
      clearTimeout(timeoutId);
      FortyGuardLogger.warn(`Groq request error on attempt ${attempt}: ${err.message}`);
      if (attempt <= config.maxRetries) {
        await new Promise(r => setTimeout(r, 400 * attempt));
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Executes a call to Nvidia API (OpenAI-compatible) with structured schema instruction
 */
export async function callNvidiaChat(params: {
  systemInstruction: string;
  userPrompt: string;
}): Promise<RawAIProviderOutput | null> {
  const openai = getNvidiaClient();
  const config = getNvidiaConfig();
  if (!openai) return null;

  let attempt = 0;
  while (attempt <= config.maxRetries) {
    attempt++;
    try {
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: `${params.systemInstruction}\n\nIMPORTANT: Output MUST be a single raw valid JSON object with keys: "headline", "whatsHappening", "why", "whatsNext", "whatToDo", "suggestedQuestions". Do not include markdown code block backticks.` },
          { role: 'user', content: params.userPrompt }
        ],
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 1536,
      });

      const rawText = response.choices[0]?.message?.content;
      if (!rawText) return null;
      
      const parsed = parseReasoningAndJsonOutput(rawText);

      if (parsed && parsed.whatsHappening && parsed.why && parsed.whatsNext && parsed.whatToDo) {
        return {
          headline: parsed.headline,
          whatsHappening: parsed.whatsHappening,
          why: parsed.why,
          whatsNext: parsed.whatsNext,
          whatToDo: parsed.whatToDo,
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : undefined,
          confidence: 95,
        };
      }
      return null;
    } catch (err: any) {
      FortyGuardLogger.warn(`Nvidia request error on attempt ${attempt}: ${err.message}`);
      if (attempt <= config.maxRetries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      return null;
    }
  }
  return null;
}


/**
 * Executes a call to Nvidia's Moonshot AI API (Kimi K3) with vision support
 */
export async function callNvidiaMoonshotChat(params: {
  systemInstruction: string;
  userPrompt: string;
  imageUrl?: string;
}): Promise<RawAIProviderOutput | null> {
  const openai = getNvidiaClient();
  const config = getMoonshotConfig();
  if (!openai) return null;

  let attempt = 0;
  while (attempt <= config.maxRetries) {
    attempt++;
    try {
      const messages: any[] = [
        { role: 'system', content: `${params.systemInstruction}

IMPORTANT: Output MUST be a single raw valid JSON object with keys: "headline", "whatsHappening", "why", "whatsNext", "whatToDo", "suggestedQuestions". Do not include markdown code block backticks.` },
      ];

      if (params.imageUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: params.userPrompt },
            { type: 'image_url', image_url: { url: params.imageUrl } }
          ]
        });
      } else {
        messages.push({ role: 'user', content: params.userPrompt });
      }

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.2,
          max_tokens: 1536,
          reasoning_effort: 'max'
        })
      });

      if (!response.ok) {
        throw new Error(`Moonshot HTTP error ${response.status}: ${await response.text()}`);
      }

      const json = await response.json();
      const rawText = json.choices?.[0]?.message?.content;
      if (!rawText) return null;
      
      const parsed = parseReasoningAndJsonOutput(rawText);

      if (parsed && parsed.whatsHappening && parsed.why && parsed.whatsNext && parsed.whatToDo) {
        return {
          headline: parsed.headline,
          whatsHappening: parsed.whatsHappening,          
          why: parsed.why,
          whatsNext: parsed.whatsNext,
          whatToDo: parsed.whatToDo,
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : undefined,
          confidence: 95,
        };
      }
      return null;
    } catch (err: any) {
      FortyGuardLogger.warn(`Moonshot request error on attempt ${attempt}: ${err.message}`);
      if (attempt <= config.maxRetries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      return null;
    }
  }
  return null;
}
