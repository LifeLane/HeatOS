const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

const target = `      // Calculate horizon delta if future time is selected
      let tempDelta = 0;
      let feelsDelta = 0;
      if ('now' === '+2h') {
        tempDelta = +1.1;
        feelsDelta = +1.4;
      } else if ('now' === '+4h') {
        tempDelta = +2.5;
        feelsDelta = +3.1;
      } else if ('now' === '+6h') {
        tempDelta = -0.7;
        feelsDelta = -0.9;
      } else if ('now' === '+12h') {
        tempDelta = -4.2;
        feelsDelta = -4.8;
      } else if ('now' === '+24h') {
        tempDelta = +0.3;
        feelsDelta = +0.4;
      }`;
code = code.replace(target, '      let tempDelta = 0;\n      let feelsDelta = 0;');

const labelTarget = `timeHorizonLabel: 'now' !== 'now' ? 'now'.toUpperCase() : undefined,`;
code = code.replace(labelTarget, '');

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
