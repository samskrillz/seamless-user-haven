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
  const map = useRef<mapboxgl.Map | null>(null);
  const [markerRefs, setMarkerRefs] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHR3Z3k2NmowMDNqMmltb2V5ZnI0ZXd2In0.JDk_wHIhE_uVrPUm6YhMwA';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (onLocationSelect) {
      map.current.on('click', (e) => {
        onLocationSelect(e.lngLat.lat, e.lngLat.lng);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markerRefs.forEach(marker => marker.remove());
    
    // Add new markers
    const newMarkers = markers.map(({ lat, lng, color = '#FF0000' }) => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full bg-primary border-2 border-white shadow-lg';
      el.style.backgroundColor = color;
      
      return new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current!);
    });

    setMarkerRefs(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.remove());
    };
  }, [markers]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}