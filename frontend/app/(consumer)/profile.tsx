import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditPersonalInfoModal } from '@/src/components/features/profile/EditPersonalInfoModal';
import { ChangePasswordModal } from '@/src/components/features/profile/ChangePasswordModal';
import { AvatarPicker } from '@/src/components/ui/AvatarPicker';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useAuthStore } from '@/src/stores/authStore';
import type { ApiStoreSummary } from '@/src/types/store';
import { getEstablishmentInitial } from '@/src/utils/establishmentRegistration';

type IconName = keyof typeof Ionicons.glyphMap;

interface ProfileRowProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  mutedIcon?: boolean;
  selected?: boolean;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
}

function ProfileRow({
  icon,
  label,
  subtitle,
  mutedIcon = false,
  selected = false,
  showChevron = false,
  showSwitch = false,
  switchValue = false,
  onPress,
  onSwitchChange,
}: ProfileRowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrap, mutedIcon && styles.mutedIconWrap]}>
          <Ionicons
            color={mutedIcon ? colors.textSecondary : colors.primary}
            name={icon}
            size={18}
          />
        </View>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {selected ? <Ionicons color={colors.primary} name="checkmark" size={18} /> : null}
      {showChevron ? (
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      ) : null}
      {showSwitch ? (
        <Switch
          ios_backgroundColor={colors.border}
          onValueChange={onSwitchChange}
          thumbColor={colors.white}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={switchValue}
        />
      ) : null}
    </Pressable>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function getStoreSubtitle(store: ApiStoreSummary): string {
  if (store.status === 'PENDING') {
    return 'Em análise';
  }

  if (store.status === 'REJECTED') {
    return 'Cadastro recusado';
  }

  if (store.status === 'INACTIVE') {
    return 'Loja desativada';
  }

  return store.subcategory?.trim() || store.category_name;
}

export default function ConsumerProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const { showAlert } = useAppModal();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshUser();
    }, [refreshUser]),
  );

  const stores = user?.stores ?? [];
  const userInitial = user ? getEstablishmentInitial(user.name) : 'U';

  const handleStorePress = async (store: ApiStoreSummary) => {
    if (store.status === 'ACTIVE') {
      router.push('/(merchant)' as never);
      return;
    }

    if (store.status === 'INACTIVE') {
      await showAlert({
        title: 'Loja desativada',
        subtitle:
          'Este estabelecimento está desativado e não aparece na vitrine para consumidores.',
      });
      return;
    }

    if (store.status === 'PENDING') {
      await showAlert({
        title: 'Cadastro em análise',
        subtitle: 'Aguarde a aprovação para acessar o painel da loja.',
      });
      return;
    }

    if (store.status === 'REJECTED') {
      await showAlert({
        title: 'Cadastro recusado',
        subtitle: 'Este estabelecimento não foi aprovado. Você pode cadastrar outro.',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSaveProfile = async (payload: { name: string; avatar_url?: string | null }) => {
    setIsSavingProfile(true);

    try {
      await updateUser(payload);
      setIsEditModalOpen(false);
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível salvar suas informações.',
      });
    } finally {
      setIsSavingProfile(false);
    }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
          </View>

          <View style={styles.profileSummary}>
            <AvatarPicker
              imageUri={user?.avatar_url ?? null}
              initial={userInitial}
              onImageSelected={() => setIsEditModalOpen(true)}
            />
            <Text style={styles.profileName}>{user?.name ?? 'Usuário'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolher perfil</Text>
            <SectionCard>
              <ProfileRow
                icon="person-outline"
                label={`${user?.name ?? 'Conta pessoal'} (conta pessoal)`}
                selected
              />
              {stores.map((store) => (
                <View key={store.id}>
                  <View style={styles.divider} />
                  <ProfileRow
                    icon="storefront-outline"
                    label={store.name}
                    mutedIcon={store.status !== 'ACTIVE'}
                    onPress={() => void handleStorePress(store)}
                    showChevron={store.status === 'ACTIVE'}
                    subtitle={getStoreSubtitle(store)}
                  />
                </View>
              ))}
              <View style={styles.divider} />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(consumer)/register-establishment/step1')}
                style={styles.registerRow}
              >
                <Ionicons color={colors.primary} name="add" size={20} />
                <Text style={styles.registerText}>Registrar meu estabelecimento</Text>
              </Pressable>
            </SectionCard>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minha conta</Text>
            <SectionCard>
              <ProfileRow
                icon="person-outline"
                label="Editar informações pessoais"
                onPress={() => setIsEditModalOpen(true)}
                showChevron
              />
              <View style={styles.divider} />
              <ProfileRow
                icon="notifications-outline"
                label="Notificações"
                onSwitchChange={(value) => void handleToggleNotifications(value)}
                showSwitch
                switchValue={user?.notifications_enabled ?? true}
              />
              <View style={styles.divider} />
              <ProfileRow
                icon="lock-closed-outline"
                label="Alterar senha"
                onPress={() => setIsPasswordModalOpen(true)}
                showChevron
              />
            </SectionCard>
          </View>

          <LogoutButton onPress={() => void handleLogout()} />
        </ScrollView>

        <BottomNav active="profile" />
      </View>

      <EditPersonalInfoModal
        initialAvatarUrl={user?.avatar_url}
        initialName={user?.name ?? ''}
        isSaving={isSavingProfile}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        visible={isEditModalOpen}
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
  scrollContent: {
    paddingTop: 24,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  profileSummary: {
    alignItems: 'center',
    gap: 10,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  profileEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.lg - 4,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
  rowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  mutedIconWrap: {
    backgroundColor: colors.neutralSoft,
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  registerRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  registerText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
