import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { MerchantTabKey } from '@/src/types/merchant';

type IconName = keyof typeof Ionicons.glyphMap;

interface MerchantBottomNavProps {
  active: MerchantTabKey;
}

interface MerchantNavItem {
  key: MerchantTabKey;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  href: string;
}

const navItems: MerchantNavItem[] = [
  {
    key: 'dashboard',
    label: 'Inicio',
    icon: 'home-outline',
    activeIcon: 'home',
    href: '/(merchant)',
  },
  {
    key: 'catalog',
    label: 'Catalogo',
    icon: 'file-tray-outline',
    activeIcon: 'file-tray',
    href: '/(merchant)/catalog',
  },
  {
    key: 'promotions',
    label: 'Promocoes',
    icon: 'megaphone-outline',
    activeIcon: 'megaphone',
    href: '/(merchant)/promotions',
  },
  {
    key: 'profile',
    label: 'Perfil',
    icon: 'person-outline',
    activeIcon: 'person',
    href: '/(merchant)/profile',
  },
];

export function MerchantBottomNav({ active }: MerchantBottomNavProps) {
  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = item.key === active;
        const color = isActive ? colors.primary : colors.textSecondary;

        return (
          <Pressable
            accessibilityRole="button"
            key={item.key}
            onPress={() => {
              if (!isActive) {
                router.navigate(item.href as never);
              }
            }}
            style={[styles.item, isActive && styles.activeItem]}
          >
            <Ionicons
              color={color}
              name={isActive ? item.activeIcon : item.icon}
              size={22}
            />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
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
