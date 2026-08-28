const fs = require('fs');
let code = fs.readFileSync('src/server/ai/centralAIService.ts', 'utf8');

const target = "rawOutput = await callNvidiaMoonshotChat({ systemInstruction, userPrompt });";
const replacement = "rawOutput = await callNvidiaMoonshotChat({ systemInstruction, userPrompt, imageUrl: req.imageUrl });";

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/server/ai/centralAIService.ts', code);
}
