const fs = require('fs');
let code = fs.readFileSync('src/context/LocationContext.tsx', 'utf8');

// We will inject the detectLocation method inside LocationProvider.
const detectMethod = `  const detectLocation = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${latitude}&lon=\${longitude}\`);
          const data = await res.json();
          
          if (data && data.address && data.address.country_code === 'us') {
            // User is in USA, create a dynamic location
            const dynamicLocation = {
              ...SUPPORTED_LOCATIONS[0],
              id: 'local_usa',
              name: data.address.city || data.address.town || data.address.county || 'Local Area',
              state: data.address.state || 'USA',
              country: 'USA',
              displayName: \`\${data.address.city || data.address.town || 'Local Area'}, \${data.address.state || 'USA'}\`,
              coordinates: { lat: latitude, lng: longitude }
            };
            setCurrentLocation(dynamicLocation);
          } else {
            // User is NOT in USA, default to NYC
            setCurrentLocation(SUPPORTED_LOCATIONS[0]);
          }
        } catch (err) {
          console.error("Location detection failed", err);
          setCurrentLocation(SUPPORTED_LOCATIONS[0]); // fallback
        }
      },
      (error) => {
        console.warn("Geolocation denied/failed", error);
        setCurrentLocation(SUPPORTED_LOCATIONS[0]); // fallback
      }
    );
  };
  
  useEffect(() => {
    detectLocation();
  }, []);`;

// We inject it before the loadEnvironmentalData useCallback
code = code.replace("const loadEnvironmentalData = useCallback", detectMethod + "\n\n  const loadEnvironmentalData = useCallback");

fs.writeFileSync('src/context/LocationContext.tsx', code);
