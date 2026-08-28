const fs = require('fs');
let code = fs.readFileSync('src/server/ai/centralAIService.ts', 'utf8');

const providerLogic = `
    // 6. Provider Selection & Invocation (Groq Primary -> Nvidia Fallback -> Deterministic Local)
    const groqConfig = getGroqConfig();
    const nvidiaConfig = getNvidiaConfig();
    const moonshotConfig = getMoonshotConfig();

    let provider: AIProviderName = 'local_deterministic';
    let modelName = 'HeatOS Local Intelligence';
    let rawOutput: any = null;
    let fallbackUsed = false;
    let retryCount = 0;

    // Check if advanced reasoning or explicit Nvidia was requested
    const requiresAdvancedNvidia = forceProvider === 'nvidia' || (prompt && prompt.toLowerCase().includes('deep advanced reasoning'));
    const requiresMoonshot = forceProvider === 'moonshot' || (prompt && prompt.toLowerCase().includes('vision'));

    if (requiresMoonshot && moonshotConfig.apiKey) {
      provider = 'moonshot';
      modelName = moonshotConfig.model;
      rawOutput = await callNvidiaMoonshotChat({ systemInstruction, userPrompt });
      if (!rawOutput) {
         fallbackUsed = true;
         retryCount++;
      }
    }

    if (!rawOutput && !requiresAdvancedNvidia && groqConfig.apiKey) {
      // ATTEMPT 1: GROQ PRIMARY
      provider = 'groq';
      modelName = groqConfig.model;
      rawOutput = await callGroqChat({ systemInstruction, userPrompt });
      if (!rawOutput) {
        // Groq failed, try Nvidia fallback
        fallbackUsed = true;
        retryCount++;
      }
    }

    if (!rawOutput && nvidiaConfig.apiKey && (requiresAdvancedNvidia || fallbackUsed || !groqConfig.apiKey)) {
      // ATTEMPT 2: NVIDIA FALLBACK / ADVANCED
      provider = 'nvidia';
      modelName = nvidiaConfig.model;
      rawOutput = await callNvidiaChat({ systemInstruction, userPrompt });
      if (!rawOutput) {
        fallbackUsed = true;
        retryCount++;
      }
    }
`;

code = code.replace(/\/\/ 6\. Provider Selection[\s\S]*?(?=\/\/ 7\. Assemble and Validate Final)/, providerLogic);

fs.writeFileSync('src/server/ai/centralAIService.ts', code);
