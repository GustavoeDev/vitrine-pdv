import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';

type IconName = keyof typeof Ionicons.glyphMap;
export type BottomNavKey = 'home' | 'search' | 'favorites' | 'stores' | 'profile';

interface BottomNavProps {
  active: BottomNavKey;
  isRootScreen?: boolean;
}

interface BottomNavItem {
  key: BottomNavKey;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  href?: string;
}

const navItems: BottomNavItem[] = [
  { key: 'home', label: 'Início', icon: 'home-outline', activeIcon: 'home', href: '/(consumer)' },
  {
    key: 'search',
    label: 'Buscar',
    icon: 'search-outline',
    activeIcon: 'search',
    href: '/(consumer)/search',
  },
  {
    key: 'favorites',
    label: 'Favoritos',
    icon: 'heart-outline',
    activeIcon: 'heart',
    href: '/(consumer)/favorites',
  },
  {
    key: 'stores',
    label: 'Lojas',
    icon: 'location-outline',
    activeIcon: 'location',
    href: '/(consumer)/map',
  },
  {
    key: 'profile',
    label: 'Perfil',
    icon: 'person-outline',
    activeIcon: 'person',
    href: '/(consumer)/profile',
  },
];

export function resolveBottomNavKey(value?: string | string[]): BottomNavKey {
  const candidate = Array.isArray(value) ? value[0] : value;
  const isValid = navItems.some((item) => item.key === candidate);

  return isValid ? (candidate as BottomNavKey) : 'home';
}

export function BottomNav({ active, isRootScreen = true }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = item.key === active;
        const contentColor = isActive ? colors.primary : colors.textSecondary;

        return (
          <Pressable
            accessibilityRole="button"
            disabled={!item.href}
            key={item.key}
            onPress={() => {
              if (item.href && (!isActive || !isRootScreen)) {
                router.navigate(item.href as never);
              }
            }}
            style={[styles.item, isActive && styles.activeItem]}
          >
            <Ionicons
              color={contentColor}
              name={isActive ? item.activeIcon : item.icon}
              size={24}
            />
            <Text style={[styles.label, { color: contentColor }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 28,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg - 4,
  },
  activeItem: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
