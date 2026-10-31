import React, { useEffect, useRef } from 'react';
import { GoogleMap } from '@capacitor/google-maps';
import { mapsApiKey } from './mapsApiKey';

interface MyMapProps {
  lat: number;
  lng: number;
  readOnly?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, readOnly = false, onLocationChange }) => {
  const mapRef = useRef<HTMLElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markerIdRef = useRef<string | null>(null);
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;
  const mapIdRef = useRef(`todo-map-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const placeMarker = async (lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (markerIdRef.current) {
      await map.removeMarker(markerIdRef.current);
    }
    markerIdRef.current = await map.addMarker({
      coordinate: { lat, lng },
      title: 'Task Location',
    });
  };

  // Create the map once, on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mapRef.current) return;
      const map = await GoogleMap.create({
        id: mapIdRef.current,
        element: mapRef.current,
        apiKey: mapsApiKey,
        config: { center: { lat, lng }, zoom: 15 },
      });

      if (!mounted) {
        await map.destroy();
        return;
      }

      mapInstanceRef.current = map;

      if (!readOnly) {
        await map.setOnMapClickListener(e => {
          onChangeRef.current?.(e.latitude, e.longitude);
        });
      }

      await placeMarker(lat, lng);
    })();

    return () => {
      mounted = false;
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
      markerIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move the marker whenever the location changes
  useEffect(() => {
    placeMarker(lat, lng);
  }, [lat, lng]);

  return (
    <div className="component-wrapper" style={{ width: '100%', height: '100%' }}>
      <capacitor-google-map
        ref={mapRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MyMap;