const fs = require('fs');
let content = fs.readFileSync('src/server/ai/centralAIService.ts', 'utf8');
content = content.replace(/callGeminiChat/g, 'callNvidiaChat');
content = content.replace(/getGeminiConfig/g, 'getNvidiaConfig');
content = content.replace(/import \{ callGroqChat, callNvidiaChat, getGroqConfig, getNvidiaConfig \} from '\.\/providers';/g, "import { callGroqChat, callNvidiaChat, getGroqConfig, getNvidiaConfig } from './providers';");
fs.writeFileSync('src/server/ai/centralAIService.ts', content);
