import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_COVER_IMAGE, DEFAULT_LOGO_IMAGE } from '@/src/constants/establishment';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAdminStore } from '@/src/queries/useAdminStores';
import {
  formatBusinessHoursSummary,
  formatRegisteredAt,
  formatStoreAddressLines,
  formatStoreCategoryLine,
  formatStorePhone,
  getStoreInitial,
} from '@/src/utils/storePresentation';

export default function AdminStoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: store, isLoading } = useAdminStore(id);

  if (isLoading || !store) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const coverUri = store.cover_photo_url ?? DEFAULT_COVER_IMAGE;
  const ownerAvatar = store.owner.avatar_url ?? DEFAULT_LOGO_IMAGE;
  const [addressLine1, addressLine2] = formatStoreAddressLines(store.address);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Detalhes do Estabelecimento</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: coverUri }} style={styles.coverImage} />

          <View style={styles.mainContent}>
            <View style={styles.basicInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.categoryLine}>
                {formatStoreCategoryLine(store.category_name, store.subcategory)}
              </Text>
              <Text style={styles.registeredAt}>{formatRegisteredAt(store.created_at)}</Text>

              <View style={styles.ownerRow}>
                {store.owner.avatar_url ? (
                  <Image source={{ uri: ownerAvatar }} style={styles.ownerAvatar} />
                ) : (
                  <View style={styles.ownerAvatarFallback}>
                    <Text style={styles.ownerInitial}>{getStoreInitial(store.owner.name)}</Text>
                  </View>
                )}
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{store.owner.name}</Text>
                  <Text style={styles.ownerEmail}>{store.owner.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contato</Text>
              <View style={styles.contactRow}>
                <Ionicons color={colors.textPrimary} name="call-outline" size={16} />
                <Text style={styles.sectionValue}>{formatStorePhone(store.phone_number)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Endereço</Text>
              <Text style={styles.sectionValue}>{addressLine1}</Text>
              <Text style={styles.sectionValue}>{addressLine2}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horário de funcionamento</Text>
              <Text style={styles.sectionValue}>
                {formatBusinessHoursSummary(store.business_hours)}
              </Text>
            </View>
          </View>
        </ScrollView>
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
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  coverImage: {
    width: '100%',
    height: 212,
    borderRadius: radius.sm,
  },
  mainContent: {
    gap: 16,
    paddingTop: 16,
  },
  basicInfo: {
    gap: 8,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  categoryLine: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  registeredAt: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  ownerAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  ownerInitial: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  ownerInfo: {
    flex: 1,
    gap: 2,
  },
  ownerName: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  ownerEmail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  sectionValue: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
