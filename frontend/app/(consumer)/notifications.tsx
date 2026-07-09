import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationCard } from '@/src/components/features/NotificationCard';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { colors, spacing } from '@/src/constants/tokens';
import { notificationGroups } from '@/src/mocks/consumer';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Notificações</Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notificationGroups.map((group) => (
            <View key={group.id} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupList}>
                {group.items.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <BottomNav active="home" isRootScreen={false} />
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: 24,
  },
  titleRow: {
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
    backgroundColor: colors.neutralSoft,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  markAllText: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  groupList: {
    gap: 12,
  },
});
