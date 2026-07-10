import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { geocodeAddress } from '@/src/services/geocoding';
import { DEFAULT_MAP_REGION } from '@/src/utils/geo';

interface AddressLocationPickerProps {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (latitude: number, longitude: number) => void;
}

function projectCoordinate(
  latitude: number,
  longitude: number,
  centerLat: number,
  centerLng: number,
): { left: string; top: string } {
  const latSpan = DEFAULT_MAP_REGION.latitudeDelta;
  const lngSpan = DEFAULT_MAP_REGION.longitudeDelta;
  const xRatio = (longitude - (centerLng - lngSpan / 2)) / lngSpan;
  const yRatio = (centerLat + latSpan / 2 - latitude) / latSpan;

  return {
    left: `${Math.min(Math.max(xRatio * 100, 8), 92)}%`,
    top: `${Math.min(Math.max(yRatio * 100, 8), 92)}%`,
  };
}

export function AddressLocationPicker({
  cep,
  city,
  latitude,
  longitude,
  neighborhood,
  number,
  onLocationChange,
  state,
  street,
}: AddressLocationPickerProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const userAdjustedRef = useRef(false);
  const addressKey = `${street}|${number}|${neighborhood}|${city}|${state}|${cep}`;
  const center = {
    latitude: latitude ?? DEFAULT_MAP_REGION.latitude,
    longitude: longitude ?? DEFAULT_MAP_REGION.longitude,
  };

  useEffect(() => {
    userAdjustedRef.current = false;
  }, [addressKey]);

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialCoordinates() {
      if (userAdjustedRef.current) {
        return;
      }

      setIsGeocoding(true);
      const coordinates = await geocodeAddress({
        street,
        number,
        district: neighborhood,
        city,
        state,
        zipcode: cep,
      });

      if (cancelled || userAdjustedRef.current) {
        return;
      }

      if (coordinates) {
        onLocationChange(coordinates.latitude, coordinates.longitude);
      }

      setIsGeocoding(false);
    }

    void resolveInitialCoordinates();

    return () => {
      cancelled = true;
    };
  }, [addressKey, cep, city, neighborhood, number, onLocationChange, state, street]);

  function handleMapPress(event: { nativeEvent: { locationX: number; locationY: number } }) {
    const { locationX, locationY } = event.nativeEvent;
    const width = 320;
    const height = 220;
    const xRatio = locationX / width;
    const yRatio = locationY / height;
    const latSpan = DEFAULT_MAP_REGION.latitudeDelta;
    const lngSpan = DEFAULT_MAP_REGION.longitudeDelta;

    const nextLatitude = center.latitude + latSpan / 2 - yRatio * latSpan;
    const nextLongitude = center.longitude - lngSpan / 2 + xRatio * lngSpan;

    userAdjustedRef.current = true;
    onLocationChange(nextLatitude, nextLongitude);
  }

  const markerPosition =
    latitude !== null && longitude !== null
      ? projectCoordinate(latitude, longitude, center.latitude, center.longitude)
      : { left: '50%', top: '50%' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirme no mapa</Text>
      <Text style={styles.subtitle}>
        Toque no mapa para marcar onde fica o estabelecimento.
      </Text>

      <Pressable onPress={handleMapPress} style={styles.mapWrap}>
        <View style={styles.mapBackground} />
        <View
          style={[
            styles.pin,
            { left: markerPosition.left as `${number}%`, top: markerPosition.top as `${number}%` },
          ]}
        />
        {isGeocoding ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  mapWrap: {
    height: 220,
    overflow: 'hidden',
    borderRadius: radius.lg - 4,
    backgroundColor: '#E8EAE6',
    position: 'relative',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EAE6',
  },
  pin: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -28,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
