import { useEffect, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface MyLocation {
  position?: Position | null;
  error?: any;
}

export const useMyLocation = () => {
  const [state, setState] = useState<MyLocation>({});

  useEffect(() => {
    let cancelled = false;
    let callbackId: string;

    async function startWatching() {
      // 1. Get initial position with browser-friendly options to prevent timeouts
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false, // Fallback to network/IP in browsers
          timeout: 10000,           // 10-second timeout
          maximumAge: 60000         // Accept cached location up to 1 minute old
        });
        if (!cancelled) {
          setState({ position, error: undefined });
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('getCurrentPosition error:', error);
          setState(prev => ({ ...prev, error }));
        }
      }

      // 2. Watch position for changes
      try {
        callbackId = await Geolocation.watchPosition(
          { enableHighAccuracy: false, timeout: 10000 },
          (position, error) => {
            if (!cancelled && (position || error)) {
              setState({ position, error: error || undefined });
            }
          }
        );
      } catch (error) {
        if (!cancelled) {
          console.warn('watchPosition error:', error);
        }
      }
    }

    startWatching();

    return () => {
      cancelled = true;
      if (callbackId) {
        Geolocation.clearWatch({ id: callbackId });
      }
    };
  }, []);

  return state;
};