import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChangePasswordModal } from '@/src/components/features/profile/ChangePasswordModal';
import { EditStoreAddressModal } from '@/src/components/features/profile/EditStoreAddressModal';
import { EditStoreBusinessHoursModal } from '@/src/components/features/profile/EditStoreBusinessHoursModal';
import { EditStoreCategoryModal } from '@/src/components/features/profile/EditStoreCategoryModal';
import { EditStorePhoneModal } from '@/src/components/features/profile/EditStorePhoneModal';
import { MerchantStoreMediaHeader } from '@/src/components/features/profile/MerchantStoreMediaHeader';
import { BusinessHoursDisplay } from '@/src/components/features/BusinessHoursDisplay';
import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { useAuthStore } from '@/src/stores/authStore';
import { buildBusinessHoursRowsFromApi } from '@/src/utils/businessHours';
import { formatPhone } from '@/src/utils/establishmentRegistration';
import { getStoreStatusLabel, scheduleToBusinessHoursInput } from '@/src/utils/merchantStoreProfile';

type EditField = 'address' | 'phone' | 'category' | 'hours' | null;

function ProfileActionRow({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.primary} name={icon} size={18} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

export default function MerchantProfileScreen() {
  const authUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const { showAlert } = useAppModal();
  const {
    profile,
    activeStoreId,
    activeStoreName,
    isLoadingStore,
    isSavingStore,
    updateStore,
  } = useMerchant();

  const [activeEdit, setActiveEdit] = useState<EditField>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const storeName = activeStoreName ?? profile.store.name;
  const logoUrl = profile.logo_url ?? profile.store.logo_url ?? null;
  const coverUrl = profile.store.cover_photo_url ?? null;
  const storeSubtitle = profile.store.subcategory?.trim() || profile.category.name;
  const addressLabel = `${profile.address.street}, ${profile.address.number} - ${profile.address.district}`;
  const businessHoursRows = buildBusinessHoursRowsFromApi(profile.business_hours);
  const statusLabel = getStoreStatusLabel(profile.store.status);
  const statusIsActive = profile.store.status === 'ACTIVE';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsUpdatingNotifications(true);

    try {
      await updateUser({ notifications_enabled: enabled });
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível atualizar as notificações.',
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const closeEditModal = () => setActiveEdit(null);

  const handleUpdateCover = async (uri: string) => {
    try {
      await updateStore({ cover_photo_url: uri });
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível atualizar a capa da loja.',
      });
    }
  };

  const handleUpdateLogo = async (uri: string) => {
    try {
      await updateStore({ logo_url: uri });
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível atualizar o logo da loja.',
      });
    }
  };

  if (isLoadingStore && activeStoreId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!activeStoreId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Minha Loja</Text>

          <MerchantStoreMediaHeader
            coverImageUri={coverUrl}
            isSaving={isSavingStore}
            logoImageUri={logoUrl}
            onPickCover={handleUpdateCover}
            onPickLogo={handleUpdateLogo}
            storeName={storeName}
          >
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={styles.storeSubtitle}>{storeSubtitle}</Text>
            <View style={[styles.statusPill, !statusIsActive && styles.statusPillMuted]}>
              <Text style={[styles.statusPillText, !statusIsActive && styles.statusPillTextMuted]}>
                {statusLabel}
              </Text>
            </View>
          </MerchantStoreMediaHeader>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolher perfil</Text>
            <View style={styles.card}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(consumer)/profile')}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons color={colors.primary} name="person-outline" size={18} />
                  </View>
                  <Text style={styles.rowLabel}>
                    {authUser?.name ?? profile.user.name} (conta pessoal)
                  </Text>
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
            <Text style={styles.sectionTitle}>Informações da loja</Text>
            <View style={styles.card}>
              <ProfileActionRow
                icon="location-outline"
                label="Endereço"
                onPress={() => setActiveEdit('address')}
                subtitle={addressLabel}
              />
              <View style={styles.divider} />
              <ProfileActionRow
                icon="logo-whatsapp"
                label="WhatsApp"
                onPress={() => setActiveEdit('phone')}
                subtitle={formatPhone(profile.store.phone_number)}
              />
              <View style={styles.divider} />
              <ProfileActionRow
                icon="grid-outline"
                label="Categoria"
                onPress={() => setActiveEdit('category')}
                subtitle={profile.category.name}
              />
              <View style={styles.divider} />
              <Pressable
                accessibilityRole="button"
                onPress={() => setActiveEdit('hours')}
                style={styles.hoursSection}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons color={colors.primary} name="time-outline" size={18} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>Horário de funcionamento</Text>
                    <BusinessHoursDisplay rows={businessHoursRows} />
                  </View>
                </View>
                <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons color={colors.primary} name="notifications-outline" size={18} />
                  </View>
                  <Text style={styles.rowLabel}>Notificações</Text>
                </View>
                <Switch
                  disabled={isUpdatingNotifications}
                  ios_backgroundColor={colors.border}
                  onValueChange={(value) => void handleToggleNotifications(value)}
                  thumbColor={colors.white}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  value={authUser?.notifications_enabled ?? profile.user.notifications_enabled}
                />
              </View>
              <View style={styles.divider} />
              <ProfileActionRow
                icon="mail-outline"
                label="Central de notificações"
                subtitle="Avaliações recebidas pela sua loja"
                onPress={() => router.push('/(merchant)/notifications')}
              />
              <View style={styles.divider} />
              <ProfileActionRow
                icon="lock-closed-outline"
                label="Alterar senha"
                onPress={() => setIsPasswordModalOpen(true)}
              />
            </View>
          </View>

          <LogoutButton onPress={() => void handleLogout()} />
        </ScrollView>

        <MerchantBottomNav active="profile" />
      </View>

      <EditStoreAddressModal
        initialAddress={profile.address}
        isSaving={isSavingStore}
        onClose={closeEditModal}
        onSave={async (address) => {
          await updateStore({ address });
          closeEditModal();
        }}
        visible={activeEdit === 'address'}
      />

      <EditStorePhoneModal
        initialPhone={profile.store.phone_number}
        isSaving={isSavingStore}
        onClose={closeEditModal}
        onSave={async (phone_number) => {
          await updateStore({ phone_number });
          closeEditModal();
        }}
        visible={activeEdit === 'phone'}
      />

      <EditStoreCategoryModal
        initialCategoryId={profile.store.category_id}
        initialSubcategory={profile.store.subcategory ?? ''}
        isSaving={isSavingStore}
        onClose={closeEditModal}
        onSave={async ({ category_id, subcategory }) => {
          await updateStore({ category_id, subcategory });
          closeEditModal();
        }}
        visible={activeEdit === 'category'}
      />

      <EditStoreBusinessHoursModal
        initialHours={profile.business_hours}
        isSaving={isSavingStore}
        onClose={closeEditModal}
        onSave={async (schedule) => {
          await updateStore({
            business_hours: scheduleToBusinessHoursInput(schedule),
          });
          closeEditModal();
        }}
        visible={activeEdit === 'hours'}
      />

      <ChangePasswordModal
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() =>
          void showAlert({
            title: 'Senha alterada',
            subtitle: 'Sua nova senha foi salva com sucesso.',
          })
        }
        visible={isPasswordModalOpen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: spacing.lg, gap: spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  storeName: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  storeSubtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#DCFCE7',
  },
  statusPillMuted: {
    backgroundColor: colors.neutralSoft,
  },
  statusPillText: { color: '#16A34A', fontSize: 12, lineHeight: 16, fontWeight: '700' },
  statusPillTextMuted: { color: colors.textSecondary },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  card: {
    borderRadius: 16,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1, gap: 2 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  mutedIconWrap: { backgroundColor: colors.neutralSoft },
  rowLabel: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  rowSubtitle: { color: colors.textMuted, fontSize: 10, lineHeight: 14, fontWeight: '400' },
  divider: { height: 1, backgroundColor: colors.border },
  hoursSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
});
