import { useEffect, useRef } from 'react';
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clickListenerRef = useRef<((e: mapboxgl.MapMouseEvent) => void) | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initializeMap = () => {
      try {
        // Use a default token - in production, this should be replaced with your own token
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHR3Z3k2NmowMDNqMmltb2V5ZnI0ZXd2In0.JDk_wHIhE_uVrPUm6YhMwA';
        
        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center,
          zoom,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        if (onLocationSelect) {
          const clickHandler = (e: mapboxgl.MapMouseEvent) => {
            const { lat, lng } = e.lngLat;
            onLocationSelect(lat, lng);
          };
          
          map.on('click', clickHandler);
          clickListenerRef.current = clickHandler;
        }

        mapRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (clickListenerRef.current && mapRef.current) {
        mapRef.current.off('click', clickListenerRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, onLocationSelect]);

  // Handle markers
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = () => {
      try {
        // Remove existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        markersRef.current = markers.map(({ lat, lng, color = '#FF0000' }) => {
          const el = document.createElement('div');
          el.className = 'w-8 h-8 rounded-full bg-primary border-2 border-white shadow-lg';
          el.style.backgroundColor = color;
          
          return new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
        });
      } catch (error) {
        console.error('Error handling markers:', error);
      }
    };

    updateMarkers();

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