import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/tokens';
import type { UserCoordinates } from '@/src/hooks/useUserLocation';
import type { MapStore } from '@/src/types/map';
import { DEFAULT_MAP_REGION } from '@/src/utils/geo';

interface StoresMapViewProps {
  stores: MapStore[];
  userLocation: UserCoordinates;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onLocateUser: () => void;
}

function projectCoordinate(
  latitude: number,
  longitude: number,
  userLocation: UserCoordinates,
): { left: number; top: number } {
  const latSpan = DEFAULT_MAP_REGION.latitudeDelta;
  const lngSpan = DEFAULT_MAP_REGION.longitudeDelta;
  const centerLat = userLocation.latitude;
  const centerLng = userLocation.longitude;

  const xRatio = (longitude - (centerLng - lngSpan / 2)) / lngSpan;
  const yRatio = ((centerLat + latSpan / 2) - latitude) / latSpan;

  return {
    left: Math.min(Math.max(xRatio * 100, 8), 84),
    top: Math.min(Math.max(yRatio * 100, 12), 78),
  };
}

function StorePin({
  left,
  onPress,
  selected,
  top,
}: {
  left: number;
  top: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.pin,
        { left: `${left}%`, top: `${top}%` },
        selected ? styles.selectedPin : styles.defaultPin,
      ]}
    >
      <Ionicons color={colors.white} name="location" size={28} />
    </Pressable>
  );
}

export function StoresMapView({
  onLocateUser,
  onSelectStore,
  selectedStoreId,
  stores,
  userLocation,
}: StoresMapViewProps) {
  const projectedStores = useMemo(
    () =>
      stores.map((store) => ({
        store,
        position: projectCoordinate(store.latitude, store.longitude, userLocation),
      })),
    [stores, userLocation],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.horizontalStreet, styles.horizontalStreetTop]} />
      <View style={[styles.horizontalStreet, styles.horizontalStreetMiddle]} />
      <View style={[styles.horizontalStreet, styles.horizontalStreetBottom]} />
      <View style={[styles.verticalStreet, styles.verticalStreetLeft]} />
      <View style={[styles.verticalStreet, styles.verticalStreetMiddle]} />
      <View style={[styles.verticalStreet, styles.verticalStreetRight]} />

      <View style={styles.resultsPill}>
        <Text style={styles.resultsText}>
          {stores.length} {stores.length === 1 ? 'loja encontrada' : 'lojas encontradas'}
        </Text>
      </View>

      {projectedStores.map(({ position, store }) => (
        <StorePin
          key={store.id}
          left={position.left}
          onPress={() => onSelectStore(store.id)}
          selected={store.id === selectedStoreId}
          top={position.top}
        />
      ))}

      <View style={styles.userArea}>
        <View style={styles.userHalo} />
        <View style={styles.userDot} />
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
    position: 'relative',
    borderRadius: 12,
    backgroundColor: '#E8EAE6',
  },
  horizontalStreet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.white,
  },
  horizontalStreetTop: {
    top: '30%',
  },
  horizontalStreetMiddle: {
    top: '58%',
  },
  horizontalStreetBottom: {
    top: '82%',
  },
  verticalStreet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.white,
  },
  verticalStreetLeft: {
    left: '22%',
  },
  verticalStreetMiddle: {
    left: '62%',
  },
  verticalStreetRight: {
    right: 0,
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
  pin: {
    position: 'absolute',
    width: 44,
    height: 52,
    marginLeft: -22,
    marginTop: -44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  selectedPin: {
    backgroundColor: colors.primary,
  },
  defaultPin: {
    backgroundColor: colors.textSecondary,
  },
  userArea: {
    position: 'absolute',
    left: '49%',
    top: '52%',
    width: 48,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userHalo: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BFDBFE',
  },
  userDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
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
