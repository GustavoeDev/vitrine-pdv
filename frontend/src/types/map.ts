import type { Store } from '@/src/types';

export interface MapStore extends Store {
  latitude: number;
  longitude: number;
  distanceKm: number | null;
}
