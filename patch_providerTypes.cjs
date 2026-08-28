const fs = require('fs');
let code = fs.readFileSync('src/server/ai/providerTypes.ts', 'utf8');

if (!code.includes('imageUrl?: string;')) {
  code = code.replace(
    'forceProvider?: AIProviderName;',
    'forceProvider?: AIProviderName;\n  imageUrl?: string;'
  );
  fs.writeFileSync('src/server/ai/providerTypes.ts', code);
}
