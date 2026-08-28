const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf8');

if (!code.includes('MOONSHOT_MODEL')) {
  code = code.replace(
    /NVIDIA_API_KEY="MY_NVIDIA_API_KEY"/, 
    'NVIDIA_API_KEY="MY_NVIDIA_API_KEY"\n# MOONSHOT_MODEL="moonshotai/kimi-k3"'
  );
  fs.writeFileSync('.env.example', code);
}
