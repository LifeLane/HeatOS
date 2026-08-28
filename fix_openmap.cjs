const fs = require('fs');
let code = fs.readFileSync('src/components/map/OpenMapView.tsx', 'utf8');

const cameraControllerOld = `// Component to handle camera changes
const CameraController: React.FC<{
  center: [number, number];
  zoom: number;
  onCameraChange?: (lat: number, lng: number, zoom: number) => void;
}> = ({ center, zoom, onCameraChange }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);

  useEffect(() => {
    if (!onCameraChange) return;
    
    const handleMoveEnd = () => {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      onCameraChange(currentCenter.lat, currentCenter.lng, currentZoom);
    };
    
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onCameraChange]);

  return null;
};`;

const cameraControllerNew = `// Component to handle camera changes
const CameraController: React.FC<{
  latitude: number;
  longitude: number;
  zoom: number;
  onCameraChange?: (lat: number, lng: number, zoom: number) => void;
}> = ({ latitude, longitude, zoom, onCameraChange }) => {
  const map = useMap();
  const isProgrammaticMove = useRef(false);
  
  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    // Only fly if we're actually changing coordinates to avoid feedback loops
    const dist = currentCenter.distanceTo([latitude, longitude]);
    if (dist > 50 || currentZoom !== zoom) {
      isProgrammaticMove.current = true;
      map.flyTo([latitude, longitude], zoom, { duration: 1.5 });
    }
  }, [latitude, longitude, zoom, map]);

  useEffect(() => {
    if (!onCameraChange) return;
    
    const handleMoveEnd = () => {
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return; // Skip notifying parent if this move was initiated by props
      }
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      onCameraChange(currentCenter.lat, currentCenter.lng, currentZoom);
    };
    
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onCameraChange]);

  return null;
};`;

code = code.replace(cameraControllerOld, cameraControllerNew);

code = code.replace(
  "<CameraController center={center} zoom={zoom} onCameraChange={onCameraChange} />",
  "<CameraController latitude={latitude} longitude={longitude} zoom={zoom} onCameraChange={onCameraChange} />"
);

fs.writeFileSync('src/components/map/OpenMapView.tsx', code);
