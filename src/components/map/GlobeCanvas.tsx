/**
 * HeatOS: The Living Weather Globe - 3D Spherical Earth & Spatial Canvas Engine
 * High-performance WebGL & 2D Canvas spherical orthographic engine with day/night terminator,
 * atmospheric glow, wind streamlines, thermal ribbons, and smooth fly-to animations.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapLayerKey, MapHotspotNode } from '../../server/map/types';

export interface GlobeCityNode {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  tempC: number;
  anomalyC: number;
  aqi: number;
  status: 'optimal' | 'moderate' | 'warning' | 'critical';
  isFortyGuardCovered: boolean;
}

export const GLOBAL_CITY_NODES: GlobeCityNode[] = [
  { id: 'nyc', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, tempC: 24.5, anomalyC: 2.8, aqi: 38, status: 'moderate', isFortyGuardCovered: true },
  { id: 'austin', name: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431, tempC: 34.2, anomalyC: 4.6, aqi: 44, status: 'warning', isFortyGuardCovered: true },
  { id: 'phoenix', name: 'Phoenix', country: 'USA', lat: 33.4484, lng: -112.074, tempC: 41.5, anomalyC: 6.2, aqi: 68, status: 'critical', isFortyGuardCovered: true },
  { id: 'miami', name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, tempC: 31.0, anomalyC: 1.9, aqi: 28, status: 'moderate', isFortyGuardCovered: true },
  { id: 'la', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, tempC: 26.8, anomalyC: 2.1, aqi: 55, status: 'optimal', isFortyGuardCovered: true },
  { id: 'chicago', name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, tempC: 21.4, anomalyC: 1.2, aqi: 32, status: 'optimal', isFortyGuardCovered: true },
  { id: 'seattle', name: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321, tempC: 19.8, anomalyC: 0.4, aqi: 22, status: 'optimal', isFortyGuardCovered: true },
  { id: 'london', name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, tempC: 19.2, anomalyC: 1.1, aqi: 29, status: 'optimal', isFortyGuardCovered: false },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tempC: 22.8, anomalyC: 1.8, aqi: 34, status: 'optimal', isFortyGuardCovered: false },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tempC: 28.6, anomalyC: 2.4, aqi: 31, status: 'moderate', isFortyGuardCovered: false },
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, tempC: 43.2, anomalyC: 5.8, aqi: 82, status: 'critical', isFortyGuardCovered: false },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, tempC: 32.1, anomalyC: 2.0, aqi: 38, status: 'moderate', isFortyGuardCovered: false },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, tempC: 17.5, anomalyC: 0.8, aqi: 18, status: 'optimal', isFortyGuardCovered: false },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, tempC: 38.4, anomalyC: 4.1, aqi: 74, status: 'warning', isFortyGuardCovered: false },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, tempC: 23.0, anomalyC: 1.5, aqi: 42, status: 'optimal', isFortyGuardCovered: false },
];

// Stylized continental landmass coordinate paths (lon, lat pairs)
const LANDMASS_POLYGONS: Array<Array<[number, number]>> = [
  // North America
  [
    [-165, 65], [-140, 70], [-100, 72], [-65, 68], [-55, 52], [-65, 44], [-75, 35],
    [-80, 25], [-82, 23], [-90, 30], [-97, 26], [-105, 20], [-90, 15], [-80, 8],
    [-85, 12], [-105, 20], [-120, 34], [-125, 48], [-135, 58], [-165, 65],
  ],
  // South America
  [
    [-80, 10], [-60, 10], [-50, -2], [-35, -5], [-38, -15], [-45, -25], [-55, -38],
    [-65, -55], [-72, -52], [-75, -40], [-72, -20], [-80, -5], [-80, 10],
  ],
  // Europe & Scandinavia
  [
    [-10, 36], [0, 44], [-5, 48], [-4, 58], [10, 58], [25, 70], [35, 68], [30, 55],
    [20, 45], [15, 38], [25, 36], [35, 32], [28, 41], [12, 44], [-5, 36], [-10, 36],
  ],
  // Africa
  [
    [-17, 32], [10, 37], [32, 31], [40, 22], [50, 12], [42, -5], [35, -25],
    [20, -35], [15, -30], [10, -5], [-5, 5], [-15, 12], [-17, 32],
  ],
  // Asia & Siberia
  [
    [35, 35], [45, 42], [60, 55], [75, 72], [110, 76], [170, 68], [160, 52],
    [140, 45], [130, 35], [120, 25], [105, 10], [95, 20], [80, 12], [70, 24],
    [55, 26], [45, 30], [35, 35],
  ],
  // Australia
  [
    [114, -22], [130, -12], [142, -11], [150, -22], [152, -34], [140, -38],
    [130, -32], [115, -35], [114, -22],
  ],
  // Antarctica
  [
    [-180, -75], [-120, -72], [-60, -68], [0, -70], [60, -68], [120, -72], [180, -75],
  ],
];

interface GlobeCanvasProps {
  activeLayer: MapLayerKey;
  selectedLat: number;
  selectedLng: number;
  timeHorizon?: string;
  onSelectLocation: (lat: number, lng: number, city?: GlobeCityNode) => void;
  onHoverLocation?: (city: GlobeCityNode | null) => void;
  isAutoRotate?: boolean;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  activeLayer,
  selectedLat,
  selectedLng,
  timeHorizon = 'now',
  onSelectLocation,
  onHoverLocation,
  isAutoRotate = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Globe orientation state: yaw (lon offset), pitch (lat tilt), scale
  const stateRef = useRef({
    yaw: -selectedLng * (Math.PI / 180),
    pitch: selectedLat * (Math.PI / 180),
    scale: 1.0,
    targetYaw: -selectedLng * (Math.PI / 180),
    targetPitch: selectedLat * (Math.PI / 180),
    targetScale: 1.0,
    isInteracting: false,
    lastX: 0,
    lastY: 0,
    animating: true,
    hoveredCity: null as GlobeCityNode | null,
    windParticles: Array.from({ length: 180 }, () => ({
      lon: (Math.random() - 0.5) * 360,
      lat: (Math.random() - 0.5) * 140,
      speed: 0.2 + Math.random() * 0.4,
      length: 8 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
    })),
  });

  // Smooth camera fly-to when selectedLat/selectedLng change
  useEffect(() => {
    const s = stateRef.current;
    s.targetYaw = -selectedLng * (Math.PI / 180);
    s.targetPitch = Math.max(-1.4, Math.min(1.4, selectedLat * (Math.PI / 180)));
    s.targetScale = 1.35; // gently zoom in upon location focus
  }, [selectedLat, selectedLng]);

  // Handle pointer interactions (drag to rotate, pinch/wheel to zoom)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    s.isInteracting = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.isInteracting) {
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;

      const sensitivity = 0.005 / s.scale;
      s.yaw += dx * sensitivity;
      s.pitch -= dy * sensitivity;
      s.pitch = Math.max(-1.4, Math.min(1.4, s.pitch));

      s.targetYaw = s.yaw;
      s.targetPitch = s.pitch;
    } else {
      // Check hover on cities
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.78 * s.scale;

      let found: GlobeCityNode | null = null;
      for (const city of GLOBAL_CITY_NODES) {
        const p = projectToScreen(city.lat, city.lng, s.yaw, s.pitch, radius, cx, cy);
        if (p && p.visible) {
          const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
          if (dist < 18) {
            found = city;
            break;
          }
        }
      }

      if (found !== s.hoveredCity) {
        s.hoveredCity = found;
        if (onHoverLocation) onHoverLocation(found);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.isInteracting = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const s = stateRef.current;
    const delta = -e.deltaY * 0.0015;
    s.targetScale = Math.max(0.65, Math.min(3.5, s.targetScale + delta));
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const s = stateRef.current;
    const radius = Math.min(cx, cy) * 0.78 * s.scale;

    // Check if clicked city node
    for (const city of GLOBAL_CITY_NODES) {
      const p = projectToScreen(city.lat, city.lng, s.yaw, s.pitch, radius, cx, cy);
      if (p && p.visible) {
        const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
        if (dist < 22) {
          onSelectLocation(city.lat, city.lng, city);
          return;
        }
      }
    }

    // Otherwise calculate clicked sphere coordinate
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq <= radius * radius) {
      const z = Math.sqrt(radius * radius - distSq);
      // Inverse orthographic spherical rotation
      const xNorm = dx / radius;
      const yNorm = -dy / radius;
      const zNorm = z / radius;

      const cosP = Math.cos(s.pitch);
      const sinP = Math.sin(s.pitch);
      const cosY = Math.cos(s.yaw);
      const sinY = Math.sin(s.yaw);

      // Rotate pitch then yaw
      const y1 = yNorm * cosP - zNorm * sinP;
      const z1 = yNorm * sinP + zNorm * cosP;
      const x1 = xNorm * cosY + z1 * sinY;
      const z2 = -xNorm * sinY + z1 * cosY;

      const clickedLat = Math.asin(y1) * (180 / Math.PI);
      const clickedLng = Math.atan2(x1, z2) * (180 / Math.PI);

      if (!isNaN(clickedLat) && !isNaN(clickedLng)) {
        onSelectLocation(
          Math.round(clickedLat * 1000) / 1000,
          Math.round(clickedLng * 1000) / 1000
        );
      }
    }
  };

  // 3D Orthographic Spherical Projection Math
  function projectToScreen(
    latDeg: number,
    lngDeg: number,
    yaw: number,
    pitch: number,
    radius: number,
    cx: number,
    cy: number
  ): { x: number; y: number; visible: boolean; z: number } {
    const latRad = latDeg * (Math.PI / 180);
    const lngRad = lngDeg * (Math.PI / 180);

    // Spherical to 3D Cartesian (x right, y up, z out)
    const x0 = Math.cos(latRad) * Math.sin(lngRad);
    const y0 = Math.sin(latRad);
    const z0 = Math.cos(latRad) * Math.cos(lngRad);

    // Apply Yaw (Y-axis rotation)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x1 = x0 * cosY - z0 * sinY;
    const z1 = x0 * sinY + z0 * cosY;

    // Apply Pitch (X-axis rotation)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y2 = y0 * cosP + z1 * sinP;
    const z2 = -y0 * sinP + z1 * cosP;

    return {
      x: cx + x1 * radius,
      y: cy - y2 * radius,
      visible: z2 > 0,
      z: z2,
    };
  }

  // Main Render Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      const s = stateRef.current;

      // Handle resize
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const renderW = rect.width;
      const renderH = rect.height;
      const cx = renderW / 2;
      const cy = renderH / 2;

      // Smooth camera interpolation
      if (!s.isInteracting) {
        if (isAutoRotate) {
          s.targetYaw += 0.0012;
          s.yaw = s.targetYaw;
        } else {
          s.yaw += (s.targetYaw - s.yaw) * 0.08;
        }
        s.pitch += (s.targetPitch - s.pitch) * 0.08;
      }
      s.scale += (s.targetScale - s.scale) * 0.08;

      const radius = Math.min(cx, cy) * 0.78 * s.scale;

      // Clear canvas with crisp space background
      ctx.clearRect(0, 0, renderW, renderH);

      // Deep space subtle gradient & stars
      const bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.2);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(0.5, '#090D16');
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, renderW, renderH);

      // Planetary Outer Atmospheric Glow Ring
      const atmoGlow = ctx.createRadialGradient(cx, cy, radius * 0.96, cx, cy, radius * 1.22);
      if (activeLayer === 'heat' || activeLayer === 'heat_risk') {
        atmoGlow.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
        atmoGlow.addColorStop(0.4, 'rgba(239, 68, 68, 0.18)');
        atmoGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (activeLayer === 'air') {
        atmoGlow.addColorStop(0, 'rgba(20, 184, 166, 0.45)');
        atmoGlow.addColorStop(0.4, 'rgba(45, 212, 191, 0.15)');
        atmoGlow.addColorStop(1, 'rgba(20, 184, 166, 0)');
      } else if (activeLayer === 'wind' || activeLayer === 'precipitation' || activeLayer === 'humidity') {
        atmoGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        atmoGlow.addColorStop(0.4, 'rgba(2, 132, 199, 0.18)');
        atmoGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        atmoGlow.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
        atmoGlow.addColorStop(0.4, 'rgba(37, 99, 235, 0.15)');
        atmoGlow.addColorStop(1, 'rgba(37, 99, 235, 0)');
      }
      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // Clip Globe Sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Oceanic Base Gradient (Deep Indigo / Marine Navy)
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
      oceanGrad.addColorStop(0, '#1E293B');
      oceanGrad.addColorStop(0.5, '#0F172A');
      oceanGrad.addColorStop(1, '#020617');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Latitude / Longitude Graticule Grid Lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;

      // Parallels (Latitude lines every 30 deg)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 6) {
          const p = projectToScreen(lat, lng, s.yaw, s.pitch, radius, cx, cy);
          if (p.visible) {
            if (first) {
              ctx.moveTo(p.x, p.y);
              first = false;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Meridians (Longitude lines every 45 deg)
      for (let lng = -180; lng < 180; lng += 45) {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 4) {
          const p = projectToScreen(lat, lng, s.yaw, s.pitch, radius, cx, cy);
          if (p.visible) {
            if (first) {
              ctx.moveTo(p.x, p.y);
              first = false;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Draw Continents & Landmasses
      for (const poly of LANDMASS_POLYGONS) {
        ctx.beginPath();
        let started = false;
        for (const [lon, lat] of poly) {
          const p = projectToScreen(lat, lon, s.yaw, s.pitch, radius, cx, cy);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          }
        }
        if (started) {
          ctx.closePath();
          // Landmass color based on active layer
          if (activeLayer === 'nature') {
            ctx.fillStyle = 'rgba(22, 101, 52, 0.45)';
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
          } else if (activeLayer === 'heat' || activeLayer === 'heat_risk') {
            ctx.fillStyle = 'rgba(51, 65, 85, 0.75)';
            ctx.strokeStyle = 'rgba(251, 146, 60, 0.4)';
          } else {
            ctx.fillStyle = 'rgba(51, 65, 85, 0.65)';
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          }
          ctx.lineWidth = 1.2;
          ctx.fill();
          ctx.stroke();
        }
      }

      // Dynamic Environmental Layer Overlays on Globe
      if (activeLayer === 'heat' || activeLayer === 'heat_risk') {
        // Planetary Thermal Belts & Isotherms (Equatorial / Tropical Heat Ribbons)
        for (let lat = -15; lat <= 35; lat += 12) {
          ctx.beginPath();
          let started = false;
          for (let lng = -180; lng <= 180; lng += 8) {
            const wobble = Math.sin((lng * Math.PI) / 60 + tick * 0.02) * 4;
            const p = projectToScreen(lat + wobble, lng, s.yaw, s.pitch, radius, cx, cy);
            if (p.visible) {
              if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
              } else {
                ctx.lineTo(p.x, p.y);
              }
            } else {
              started = false;
            }
          }
          ctx.strokeStyle = lat > 15 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(249, 115, 22, 0.3)';
          ctx.lineWidth = 14 * s.scale;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Wind Flow Streamlines Animation
      if (activeLayer === 'wind' || activeLayer === 'precipitation' || activeLayer === 'heat') {
        ctx.lineWidth = 1.5;
        for (const wp of s.windParticles) {
          wp.lon = (wp.lon + wp.speed) % 360;
          if (wp.lon > 180) wp.lon -= 360;

          const p1 = projectToScreen(wp.lat, wp.lon, s.yaw, s.pitch, radius, cx, cy);
          const p2 = projectToScreen(wp.lat + Math.sin(tick * 0.05 + wp.phase) * 1.5, wp.lon - wp.length * 0.5, s.yaw, s.pitch, radius, cx, cy);

          if (p1.visible && p2.visible) {
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 + Math.sin(tick * 0.08 + wp.phase) * 0.15})`;
            ctx.stroke();
          }
        }
      }

      // Active Cities & Telemetry Hotspot Nodes
      for (const city of GLOBAL_CITY_NODES) {
        const p = projectToScreen(city.lat, city.lng, s.yaw, s.pitch, radius, cx, cy);
        if (p.visible) {
          const isSelected =
            Math.abs(city.lat - selectedLat) < 0.01 &&
            Math.abs(city.lng - selectedLng) < 0.01;
          const isHovered = s.hoveredCity?.id === city.id;

          // Glowing pulse ring
          const pulseSize = (isSelected ? 10 : 6) + Math.sin(tick * 0.1) * 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseSize * s.scale, 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? 'rgba(59, 130, 246, 0.4)'
            : city.status === 'critical'
            ? 'rgba(239, 68, 68, 0.35)'
            : city.status === 'warning'
            ? 'rgba(249, 115, 22, 0.35)'
            : 'rgba(16, 185, 129, 0.35)';
          ctx.fill();

          // Solid core marker
          ctx.beginPath();
          ctx.arc(p.x, p.y, (isSelected ? 5.5 : 3.5) * s.scale, 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? '#3B82F6'
            : city.status === 'critical'
            ? '#EF4444'
            : city.status === 'warning'
            ? '#F97316'
            : '#10B981';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // City Name & Temperature Label (Always shown for selected or on hover, or when zoomed in)
          if (isSelected || isHovered || s.scale > 1.2) {
            ctx.font = `bold ${Math.max(10, Math.round(11 * Math.min(1.5, s.scale)))}px sans-serif`;
            const text = `${city.name} ${city.tempC.toFixed(0)}°`;
            const metrics = ctx.measureText(text);
            const boxW = metrics.width + 12;
            const boxH = 20;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.strokeStyle = isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(p.x + 8, p.y - 10, boxW, boxH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#F8FAFC';
            ctx.fillText(text, p.x + 14, p.y + 4);
          }
        }
      }

      // Shading / Solar Day-Night Terminator Overlay
      const sunGrad = ctx.createRadialGradient(cx - radius * 0.5, cy - radius * 0.4, radius * 0.2, cx, cy, radius * 1.05);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      sunGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore(); // end globe clipping

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeLayer, selectedLat, selectedLng, isAutoRotate, timeHorizon]);

  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
