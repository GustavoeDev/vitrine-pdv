import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/tokens';
import { Review } from '@/src/types';

interface StoreReviewsSummaryProps {
  averageRating?: number | null;
  reviews?: Review[];
  reviewsCount?: number;
}

function formatAverageRating(average: number): string {
  return average.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatStars(rating: number): string {
  const rounded = Math.round(rating);
  return '★'.repeat(Math.min(5, Math.max(0, rounded)));
}

function resolveSummaryStats({
  averageRating,
  reviews = [],
  reviewsCount,
}: StoreReviewsSummaryProps) {
  if (averageRating != null && reviewsCount != null) {
    return {
      average: averageRating,
      count: reviewsCount,
    };
  }

  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  return {
    average: reviews.reduce((total, review) => total + review.rating, 0) / reviews.length,
    count: reviews.length,
  };
}

export function StoreReviewsSummary({
  averageRating,
  reviews = [],
  reviewsCount,
}: StoreReviewsSummaryProps) {
  const { average, count } = resolveSummaryStats({ averageRating, reviews, reviewsCount });

  return (
    <View style={styles.row}>
      <Text style={styles.score}>{formatAverageRating(average)}</Text>
      <Text style={styles.stars}>{formatStars(average)}</Text>
      <Text style={styles.count}>
        {count} {count === 1 ? 'avaliação' : 'avaliações'}
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
