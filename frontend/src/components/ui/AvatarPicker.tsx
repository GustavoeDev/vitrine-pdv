import { colors, radius } from '@/src/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function AvatarPicker() {
  return (
    <View style={styles.avatar}>
      <Text style={styles.initial}>M</Text>
      <View style={styles.cameraBadge}>
        <Ionicons name="camera" size={14} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  initial: {
    color: colors.primary,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});