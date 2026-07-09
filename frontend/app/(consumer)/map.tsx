import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { consumerStore } from '@/src/mocks/consumer';

function StorePin({ left, top, muted = false }: { left: number; top: number; muted?: boolean }) {
  return (
    <View style={[styles.pin, { left, top }, muted && styles.mutedPin]}>
      <Ionicons color={colors.white} name="location" size={30} />
    </View>
  );
}

function MockMap() {
  return (
    <View style={styles.mapArea}>
      <View style={[styles.horizontalStreet, styles.horizontalStreetTop]} />
      <View style={[styles.horizontalStreet, styles.horizontalStreetMiddle]} />
      <View style={[styles.horizontalStreet, styles.horizontalStreetBottom]} />
      <View style={[styles.verticalStreet, styles.verticalStreetLeft]} />
      <View style={[styles.verticalStreet, styles.verticalStreetMiddle]} />
      <View style={[styles.verticalStreet, styles.verticalStreetRight]} />
      <View style={styles.resultsPill}>
        <Text style={styles.resultsText}>4 lojas encontradas</Text>
      </View>

      <StorePin left={39} muted top={80} />
      <StorePin left={83} top={200} />
      <StorePin left={280} top={101} />
      <StorePin left={300} top={280} />

      <View style={styles.userArea}>
        <View style={styles.userHalo} />
        <View style={styles.userDot} />
      </View>

      <Pressable accessibilityRole="button" style={styles.locateButton}>
        <Ionicons color={colors.primary} name="locate-outline" size={24} />
      </Pressable>
    </View>
  );
}

export default function ConsumerMapScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Lojas Próximas</Text>
          </View>

          <MockMap />

          <View style={styles.storeSheet}>
            <View style={styles.dragHandle} />
            <View style={styles.cardContent}>
              <Image source={{ uri: consumerStore.avatarUrl }} style={styles.storeImage} />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>Padaria São José</Text>
                <Text style={styles.storeSubtitle}>Alimentação • Padaria artesanal</Text>
                <Text style={styles.distanceText}>📍 1,2 km de você</Text>
                <Text style={styles.reviewText}>⭐ 4,8 • 124 avaliações</Text>
              </View>
            </View>
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>Promoção ativa 🔥</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push('/(consumer)/stores/loja-dos-calcados?origin=stores' as never)
              }
              style={styles.viewStoreButton}
            >
              <Text style={styles.viewStoreText}>Ver loja</Text>
            </Pressable>
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
    gap: spacing.lg,
  },
  content: {
    flex: 1,
    gap: spacing.md,
    paddingTop: 24,
  },
  header: {
    height: 40,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    minHeight: 400,
    overflow: 'hidden',
    position: 'relative',
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
    top: 120,
  },
  horizontalStreetMiddle: {
    top: 280,
  },
  horizontalStreetBottom: {
    top: 390,
  },
  verticalStreet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.white,
  },
  verticalStreetLeft: {
    left: 80,
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
    left: 55,
    right: 39,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  resultsText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  pin: {
    position: 'absolute',
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  mutedPin: {
    backgroundColor: colors.textSecondary,
  },
  userArea: {
    position: 'absolute',
    left: '49%',
    top: 229,
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
  storeSheet: {
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderTopLeftRadius: radius.lg - 4,
    borderTopRightRadius: radius.lg - 4,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeImage: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  storeInfo: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  storeSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  distanceText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  reviewText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md - 2,
    backgroundColor: colors.primary,
  },
  promoText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  viewStoreButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  viewStoreText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
});
