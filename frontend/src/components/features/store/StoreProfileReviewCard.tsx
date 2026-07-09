import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/tokens';
import { Review } from '@/src/types';

interface StoreProfileReviewCardProps {
  review: Review;
}

export function StoreProfileReviewCard({ review }: StoreProfileReviewCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.author}>{review.authorName}</Text>
      <Text style={styles.stars}>{'★'.repeat(review.rating)}</Text>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: spacing.xs,
    borderRadius: radius.md - 2,
    backgroundColor: colors.surface,
  },
  author: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  stars: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  comment: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
