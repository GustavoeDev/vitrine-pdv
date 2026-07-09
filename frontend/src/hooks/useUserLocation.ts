import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_MAP_REGION } from '@/src/utils/geo';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  location: UserCoordinates | null;
  isLoading: boolean;
  permissionDenied: boolean;
  refreshLocation: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const refreshLocation = useCallback(async () => {
    setIsLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setPermissionDenied(true);
        setLocation({
          latitude: DEFAULT_MAP_REGION.latitude,
          longitude: DEFAULT_MAP_REGION.longitude,
        });
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setPermissionDenied(false);
      setLocation({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      });
    } catch {
      setPermissionDenied(true);
      setLocation({
        latitude: DEFAULT_MAP_REGION.latitude,
        longitude: DEFAULT_MAP_REGION.longitude,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  return {
    location,
    isLoading,
    permissionDenied,
    refreshLocation,
  };
}
