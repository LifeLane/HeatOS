const fs = require('fs');
let code = fs.readFileSync('src/server/ai/providers.ts', 'utf8');

const getMoonshotConfig = `
export function getMoonshotConfig(): ProviderConfig {
  return {
    apiKey: process.env.NVIDIA_API_KEY,
    model: process.env.MOONSHOT_MODEL || 'moonshotai/kimi-k3',
    timeoutMs: parseInt(process.env.MOONSHOT_TIMEOUT || '15000', 10),
    maxRetries: parseInt(process.env.MOONSHOT_MAX_RETRIES || '2', 10),
  };
}
`;

if (!code.includes('getMoonshotConfig')) {
  code = code.replace('let nvidiaClient: OpenAI | null = null;', getMoonshotConfig + '\nlet nvidiaClient: OpenAI | null = null;');
}

const callNvidiaMoonshotChat = `
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
        { role: 'system', content: \`\${params.systemInstruction}\n\nIMPORTANT: Output MUST be a single raw valid JSON object with keys: "headline", "whatsHappening", "why", "whatsNext", "whatToDo", "suggestedQuestions". Do not include markdown code block backticks.\` },
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

      // We use raw fetch here to send the extra reasoning_effort parameter since the OpenAI SDK might not type it for all models
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${config.apiKey}\`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.2,
          max_tokens: 1024,
          reasoning_effort: 'max'
        })
      });

      if (!response.ok) {
        throw new Error(\`Moonshot HTTP error \${response.status}: \${await response.text()}\`);
      }

      const json = await response.json();
      let rawText = json.choices?.[0]?.message?.content;
      if (!rawText) return null;
      
      rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const parsed = JSON.parse(rawText);

      if (parsed.whatsHappening && parsed.why && parsed.whatsNext && parsed.whatToDo) {
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
      FortyGuardLogger.warn(\`Moonshot request error on attempt \${attempt}: \${err.message}\`);
      if (attempt <= config.maxRetries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      return null;
    }
  }
  return null;
}
`;

if (!code.includes('callNvidiaMoonshotChat')) {
  code += '\n' + callNvidiaMoonshotChat;
}

fs.writeFileSync('src/server/ai/providers.ts', code);
