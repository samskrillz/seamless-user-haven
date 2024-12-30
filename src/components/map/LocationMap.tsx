import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: { lat: number; lng: number; color?: string }[];
  center?: [number, number];
  zoom?: number;
}

export function LocationMap({ 
  onLocationSelect, 
  markers = [], 
  center = [-74.0060, 40.7128], 
  zoom = 12 
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Use a valid Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHR3Z3k2NmowMDNqMmltb2V5ZnI0ZXd2In0.JDk_wHIhE_uVrPUm6YhMwA';
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (onLocationSelect) {
      map.on('click', (e) => {
        onLocationSelect(e.lngLat.lat, e.lngLat.lng);
      });
    }

    mapInstance.current = map;

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add new markers
    const newMarkers = markers.map(({ lat, lng, color = '#FF0000' }) => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full bg-primary border-2 border-white shadow-lg';
      el.style.backgroundColor = color;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapInstance.current!);

      return marker;
    });

    markersRef.current = newMarkers;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [markers]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}