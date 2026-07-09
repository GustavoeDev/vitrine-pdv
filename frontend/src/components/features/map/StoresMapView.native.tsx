import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { colors } from '@/src/constants/tokens';
import type { MapStore } from '@/src/types/map';
import type { UserCoordinates } from '@/src/hooks/useUserLocation';
import { DEFAULT_MAP_REGION } from '@/src/utils/geo';

interface StoresMapViewProps {
  stores: MapStore[];
  userLocation: UserCoordinates;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onLocateUser: () => void;
}

function buildRegion(
  userLocation: UserCoordinates,
  stores: MapStore[],
): Region {
  if (stores.length === 0) {
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
      longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
    };
  }

  const latitudes = stores.map((store) => store.latitude);
  const longitudes = stores.map((store) => store.longitude);

  const minLat = Math.min(userLocation.latitude, ...latitudes);
  const maxLat = Math.max(userLocation.latitude, ...latitudes);
  const minLng = Math.min(userLocation.longitude, ...longitudes);
  const maxLng = Math.max(userLocation.longitude, ...longitudes);

  const latitudeDelta = Math.max((maxLat - minLat) * 1.6, 0.02);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.6, 0.02);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

export function StoresMapView({
  onLocateUser,
  onSelectStore,
  selectedStoreId,
  stores,
  userLocation,
}: StoresMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const initialRegion = useMemo(
    () => buildRegion(userLocation, stores),
    [stores, userLocation],
  );

  useEffect(() => {
    if (!selectedStoreId) {
      return;
    }

    const selectedStore = stores.find((store) => store.id === selectedStoreId);
    if (!selectedStore) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: selectedStore.latitude,
        longitude: selectedStore.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      350,
    );
  }, [selectedStoreId, stores]);

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={initialRegion}
        ref={mapRef}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation
        style={styles.map}
      >
        {stores.map((store) => {
          const isSelected = store.id === selectedStoreId;

          return (
            <Marker
              coordinate={{
                latitude: store.latitude,
                longitude: store.longitude,
              }}
              key={store.id}
              onPress={() => onSelectStore(store.id)}
              pinColor={isSelected ? colors.primary : colors.textSecondary}
            />
          );
        })}
      </MapView>

      <View style={styles.resultsPill}>
        <Text style={styles.resultsText}>
          {stores.length} {stores.length === 1 ? 'loja encontrada' : 'lojas encontradas'}
        </Text>
      </View>

      <Pressable accessibilityRole="button" onPress={onLocateUser} style={styles.locateButton}>
        <Ionicons color={colors.primary} name="locate-outline" size={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#E8EAE6',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  resultsPill: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultsText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  locateButton: {
    position: 'absolute',
    right: 10,
    bottom: 14,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});
