import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapStoreSheet } from '@/src/components/features/map/MapStoreSheet';
import { StoresMapView } from '@/src/components/features/map/StoresMapView';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useMapStores } from '@/src/queries/useDiscovery';
import { mapApiPublicStoreToMapStore } from '@/src/utils/consumerMappers';

export default function ConsumerMapScreen() {
  const { isLoading: isLoadingLocation, location, refreshLocation } = useUserLocation();
  const { data: apiStores = [], isLoading: isLoadingStores } = useMapStores(location);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const mapStores = useMemo(
    () =>
      apiStores
        .map(mapApiPublicStoreToMapStore)
        .filter((store): store is NonNullable<typeof store> => store !== null),
    [apiStores],
  );

  const selectedStore = useMemo(
    () => mapStores.find((store) => store.id === selectedStoreId) ?? null,
    [mapStores, selectedStoreId],
  );

  useEffect(() => {
    if (mapStores.length === 0) {
      setSelectedStoreId(null);
      return;
    }

    if (!selectedStoreId || !mapStores.some((store) => store.id === selectedStoreId)) {
      setSelectedStoreId(mapStores[0].id);
    }
  }, [mapStores, selectedStoreId]);

  const isLoading = isLoadingLocation || isLoadingStores;

  function handleLocateUser() {
    void refreshLocation();
  }

  function handleViewStore(storeId: string) {
    router.push(`/(consumer)/stores/${storeId}?origin=stores` as never);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Lojas Próximas</Text>
          </View>

          <View style={styles.mapSection}>
            {isLoading || !location ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Carregando mapa e lojas próximas...</Text>
              </View>
            ) : mapStores.length > 0 ? (
              <StoresMapView
                onLocateUser={handleLocateUser}
                onSelectStore={setSelectedStoreId}
                selectedStoreId={selectedStoreId}
                stores={mapStores}
                userLocation={location}
              />
            ) : (
              <View style={styles.loadingState}>
                <Text style={styles.emptyTitle}>Nenhuma loja com localização ainda</Text>
                <Text style={styles.loadingText}>
                  As lojas aprovadas aparecerão aqui quando tiverem coordenadas no endereço.
                </Text>
              </View>
            )}

            {!isLoading && location ? (
              <View style={styles.sheetOverlay}>
                <MapStoreSheet onViewStore={handleViewStore} store={selectedStore} />
              </View>
            ) : null}
          </View>
        </View>

        <BottomNav active="stores" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 10,
  },
  content: {
    flex: 1,
    gap: spacing.md,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  mapSection: {
    flex: 1,
    position: 'relative',
    gap: spacing.sm,
  },
  loadingState: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.neutralSoft,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  sheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
