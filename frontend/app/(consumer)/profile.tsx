import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarPicker } from '@/src/components/ui/AvatarPicker';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, radius, spacing } from '@/src/constants/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

interface ProfileRowProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  mutedIcon?: boolean;
  selected?: boolean;
  showChevron?: boolean;
  showSwitch?: boolean;
}

function ProfileRow({
  icon,
  label,
  subtitle,
  mutedIcon = false,
  selected = false,
  showChevron = false,
  showSwitch = false,
}: ProfileRowProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.row}>
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
          thumbColor={colors.white}
          trackColor={{ false: colors.border, true: colors.primary }}
          value
        />
      ) : null}
    </Pressable>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function ConsumerProfileScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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
              imageUri={avatarUri}
              initial="M"
              onImageSelected={setAvatarUri}
            />
            <Text style={styles.profileName}>Maria Clara</Text>
            <Text style={styles.profileEmail}>maria.clara@email.com</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolher perfil</Text>
            <SectionCard>
              <ProfileRow
                icon="person-outline"
                label="Maria Clara (conta pessoal)"
                selected
              />
              <View style={styles.divider} />
              <ProfileRow
                icon="storefront-outline"
                label="Padaria São José"
                subtitle="Alimentação"
              />
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
                showChevron
              />
              <ProfileRow icon="notifications-outline" label="Notificações" showSwitch />
              <ProfileRow icon="location-outline" label="Endereço padrão" showChevron />
            </SectionCard>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suporte</Text>
            <SectionCard>
              <ProfileRow icon="chatbox-outline" label="Fale conosco" mutedIcon showChevron />
              <ProfileRow icon="star-outline" label="Avaliar o app" mutedIcon showChevron />
            </SectionCard>
          </View>

          <Pressable accessibilityRole="button" style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </ScrollView>

        <BottomNav active="profile" />
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
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
  logoutButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - 2,
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
