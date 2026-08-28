const fs = require('fs');

let content = fs.readFileSync('src/hooks/useOpenStreetMap.ts', 'utf8');
content = content.replace(
  `  const markersRef = useRef<{ [key: string]: L.Marker }>({});`,
  `  const markersRef = useRef<{ [key: string]: L.Marker }>({});\n  const callbacksRef = useRef({ onCameraChange, onClickMapLocation, onMarkerClick });\n  useEffect(() => { callbacksRef.current = { onCameraChange, onClickMapLocation, onMarkerClick }; }, [onCameraChange, onClickMapLocation, onMarkerClick]);`
);
content = content.replace(
  `    map.on('moveend', () => {\n      const center = map.getCenter();\n      const zoom = map.getZoom();\n      if (onCameraChange) onCameraChange(center.lat, center.lng, zoom);\n    });\n\n    map.on('click', (e) => {\n      if (onClickMapLocation) {\n        onClickMapLocation(e.latlng.lat, e.latlng.lng);\n      }\n    });`,
  `    map.on('moveend', () => {\n      const center = map.getCenter();\n      const zoom = map.getZoom();\n      const cb = callbacksRef.current.onCameraChange;\n      if (cb) cb(center.lat, center.lng, zoom);\n    });\n\n    map.on('click', (e) => {\n      const cb = callbacksRef.current.onClickMapLocation;\n      if (cb) cb(e.latlng.lat, e.latlng.lng);\n    });`
);
fs.writeFileSync('src/hooks/useOpenStreetMap.ts', content);
