import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { geocodeAddress } from '@/src/services/geocoding';
import { DEFAULT_MAP_REGION, roundCoordinate } from '@/src/utils/geo';

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

function buildRegion(latitude: number, longitude: number): Region {
  return {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
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

  useEffect(() => {
    userAdjustedRef.current = false;
  }, [addressKey]);

  useEffect(() => {
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      void (async () => {
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
          onLocationChange(
            roundCoordinate(coordinates.latitude),
            roundCoordinate(coordinates.longitude),
          );
        }

        setIsGeocoding(false);
      })();
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [addressKey, cep, city, neighborhood, number, onLocationChange, state, street]);

  const markerCoordinate =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : {
          latitude: DEFAULT_MAP_REGION.latitude,
          longitude: DEFAULT_MAP_REGION.longitude,
        };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirme no mapa</Text>
      <Text style={styles.subtitle}>
        Arraste o pin para marcar onde fica o estabelecimento.
      </Text>

      <View style={styles.mapWrap}>
        <MapView
          initialRegion={buildRegion(markerCoordinate.latitude, markerCoordinate.longitude)}
          region={buildRegion(markerCoordinate.latitude, markerCoordinate.longitude)}
          style={styles.map}
        >
          <Marker
            coordinate={markerCoordinate}
            draggable
            onDragEnd={(event) => {
              userAdjustedRef.current = true;
              onLocationChange(
                roundCoordinate(event.nativeEvent.coordinate.latitude),
                roundCoordinate(event.nativeEvent.coordinate.longitude),
              );
            }}
            pinColor={colors.primary}
          />
        </MapView>

        {isGeocoding ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
      </View>
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
    backgroundColor: colors.neutralSoft,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
