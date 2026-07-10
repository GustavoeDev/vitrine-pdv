import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/src/constants/tokens';

interface CategoryCircleTileProps {
  label: string;
  photoUrl?: string | null;
  onPress?: () => void;
}

export function CategoryCircleTile({ label, photoUrl, onPress }: CategoryCircleTileProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.tile}>
      <View style={styles.circle}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} />
        ) : (
          <Ionicons color={colors.textMuted} name="grid-outline" size={24} />
        )}
      </View>
      <Text numberOfLines={2} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.neutralSoft,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.full,
  },
  label: {
    minHeight: 32,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
