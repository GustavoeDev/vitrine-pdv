import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/tokens';
import { Review } from '@/src/types';

interface StoreReviewsSummaryProps {
  reviews: Review[];
}

function formatAverageRating(reviews: Review[]): string {
  if (reviews.length === 0) {
    return '0,0';
  }

  const average =
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return average.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatStars(rating: number): string {
  const rounded = Math.round(rating);
  return '★'.repeat(Math.min(5, Math.max(0, rounded)));
}

export function StoreReviewsSummary({ reviews }: StoreReviewsSummaryProps) {
  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return (
    <View style={styles.row}>
      <Text style={styles.score}>{formatAverageRating(reviews)}</Text>
      <Text style={styles.stars}>{formatStars(average)}</Text>
      <Text style={styles.count}>
        {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  stars: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
});
