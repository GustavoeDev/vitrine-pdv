import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { BusinessHoursDisplay } from '@/src/components/features/BusinessHoursDisplay';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { buildBusinessHoursRowsFromApi } from '@/src/utils/businessHours';

function Row({
  icon,
  label,
  subtitle,
  chevron = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  chevron?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.primary} name={icon} size={18} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {chevron ? <Ionicons color={colors.textMuted} name="chevron-forward" size={18} /> : null}
    </View>
  );
}

export default function MerchantProfileScreen() {
  const { profile, activeStoreId, activeStoreName } = useMerchant();
  const storeName = activeStoreName ?? profile.store.name;
  const logoUrl = profile.logo_url ?? profile.user.avatar_url ?? profile.store.cover_photo_url ?? '';
  const storeSubtitle = `${profile.category.name}`;
  const addressLabel = `${profile.address.street}, ${profile.address.number} - ${profile.address.district}`;
  const businessHoursRows = buildBusinessHoursRowsFromApi(profile.business_hours);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Minha Loja</Text>
            <View style={styles.editButton}>
              <Ionicons color={colors.textPrimary} name="pencil-outline" size={20} />
            </View>
          </View>

          <Image source={{ uri: profile.store.cover_photo_url ?? '' }} style={styles.coverImage} />

          <View style={styles.identityRow}>
            <Image source={{ uri: logoUrl }} style={styles.avatar} />
            <View style={styles.identityText}>
              <Text style={styles.storeName}>{storeName}</Text>
              <Text style={styles.storeSubtitle}>{storeSubtitle}</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Ativa</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolher perfil</Text>
            <View style={styles.card}>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/(consumer)/profile')} style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons color={colors.primary} name="person-outline" size={18} />
                  </View>
                  <Text style={styles.rowLabel}>Maria Clara (conta pessoal)</Text>
                </View>
              </Pressable>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons color={colors.primary} name="storefront-outline" size={18} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{storeName}</Text>
                    <Text style={styles.rowSubtitle}>{profile.category.name}</Text>
                  </View>
                </View>
                <Ionicons color={colors.primary} name="checkmark" size={18} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacoes da loja</Text>
            <View style={styles.card}>
              {activeStoreId ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(`/(consumer)/stores/${activeStoreId}?origin=profile` as never)
                    }
                    style={styles.row}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.iconWrap}>
                        <Ionicons color={colors.primary} name="eye-outline" size={18} />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowLabel}>Ver loja como cliente</Text>
                        <Text style={styles.rowSubtitle}>Abre o perfil público de {storeName}</Text>
                      </View>
                    </View>
                    <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
                  </Pressable>
                  <View style={styles.divider} />
                </>
              ) : null}
              <Row icon="location-outline" label="Endereco" subtitle={addressLabel} />
              <View style={styles.divider} />
              <Row icon="logo-whatsapp" label="WhatsApp" subtitle={profile.store.phone_number} />
              <View style={styles.divider} />
              <Row icon="grid-outline" label="Categoria" subtitle={profile.category.name} />
              <View style={styles.divider} />
              <View style={styles.hoursSection}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons color={colors.primary} name="time-outline" size={18} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>Horário de funcionamento</Text>
                    <BusinessHoursDisplay rows={businessHoursRows} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, styles.mutedIconWrap]}>
                    <Ionicons color={colors.textSecondary} name="notifications-outline" size={18} />
                  </View>
                  <Text style={styles.rowLabel}>Notificacoes</Text>
                </View>
                <Switch
                  ios_backgroundColor={colors.border}
                  thumbColor={colors.white}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  value={profile.user.notifications_enabled}
                />
              </View>
              <View style={styles.divider} />
              <Row icon="lock-closed-outline" label="Alterar senha" />
              <View style={styles.divider} />
              <Row icon="help-circle-outline" label="Ajuda" />
              <View style={styles.divider} />
              <Row icon="chatbox-ellipses-outline" label="Fale conosco" />
            </View>
          </View>

          <Pressable accessibilityRole="button" style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </ScrollView>

        <MerchantBottomNav active="profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  editButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutralSoft },
  coverImage: { width: '100%', height: 110, borderRadius: radius.lg, backgroundColor: colors.neutralSoft },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: 18, backgroundColor: colors.neutralSoft },
  identityText: { flex: 1, gap: 4 },
  storeName: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  storeSubtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  activePill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, backgroundColor: '#DCFCE7' },
  activePillText: { color: '#16A34A', fontSize: 12, lineHeight: 16, fontWeight: '700' },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  card: { borderRadius: 16, backgroundColor: colors.background, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, overflow: 'hidden' },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 12 },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1, gap: 2 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  mutedIconWrap: { backgroundColor: colors.neutralSoft },
  rowLabel: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  rowSubtitle: { color: colors.textMuted, fontSize: 10, lineHeight: 14, fontWeight: '400' },
  divider: { height: 1, backgroundColor: colors.border },
  hoursSection: { paddingHorizontal: spacing.md, paddingVertical: 12 },
  logoutButton: { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.surface },
  logoutText: { color: colors.danger, fontSize: 15, lineHeight: 20, fontWeight: '700' },
});
