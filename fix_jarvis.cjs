const fs = require('fs');
let code = fs.readFileSync('src/components/common/JarvisOrb.tsx', 'utf8');

code = code.replace("const { openAssistant } = useAIAnalyst();", "const { openAIWithContext } = useAIAnalyst();");
code = code.replace("openAssistant('NATURE_ANALYST', 'analyze_environment', command);", "openAIWithContext({ question: command, sourceModule: 'Jarvis Voice' });");

fs.writeFileSync('src/components/common/JarvisOrb.tsx', code);
