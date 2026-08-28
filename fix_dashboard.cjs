const fs = require('fs');
let code = fs.readFileSync('src/components/views/DashboardView.tsx', 'utf8');

// Inject import
code = code.replace(
  "import MetricCard from '../ui/MetricCard';",
  "import MetricCard from '../ui/MetricCard';\nimport { AnimatedTelemetryCards } from '../dashboard/AnimatedTelemetryCards';"
);

// Inject component
const target = "{/* ========================================================================= */}\n        {/* COMPACT METRICS GRID */}\n        {/* ========================================================================= */}";
code = code.replace(target, "{/* ========================================================================= */}\n        {/* ANIMATED TELEMETRY (Heat Index, Air Quality, Humidity) */}\n        {/* ========================================================================= */}\n        <AnimatedTelemetryCards />\n\n        " + target);

fs.writeFileSync('src/components/views/DashboardView.tsx', code);
