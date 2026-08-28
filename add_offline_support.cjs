const fs = require('fs');

let content = fs.readFileSync('src/context/LocationContext.tsx', 'utf8');

const additionalEffect = `
  // Handle network online/offline events for intermittent connectivity
  useEffect(() => {
    const handleOnline = () => loadEnvironmentalData(currentLocation, true);
    const handleOffline = () => loadEnvironmentalData(currentLocation, false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentLocation, loadEnvironmentalData]);
`;

content = content.replace(
  `  // Periodic polling heartbeat\n  useEffect(() => {\n    if (!isLive) return;\n    const timer = setInterval(() => {\n      loadEnvironmentalData(currentLocation);\n    }, 30000);\n    return () => clearInterval(timer);\n  }, [isLive, currentLocation, loadEnvironmentalData]);`,
  `  // Periodic polling heartbeat\n  useEffect(() => {\n    if (!isLive) return;\n    const timer = setInterval(() => {\n      loadEnvironmentalData(currentLocation);\n    }, 30000);\n    return () => clearInterval(timer);\n  }, [isLive, currentLocation, loadEnvironmentalData]);\n\n${additionalEffect}`
);

fs.writeFileSync('src/context/LocationContext.tsx', content);
