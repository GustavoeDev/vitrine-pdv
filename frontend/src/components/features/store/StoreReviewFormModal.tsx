import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';

interface StoreReviewFormModalProps {
  initialComment?: string;
  initialRating?: number;
  isSaving?: boolean;
  isUpdate?: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string }) => Promise<void>;
  visible: boolean;
}

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          accessibilityLabel={`${star} estrela${star > 1 ? 's' : ''}`}
          accessibilityRole="button"
          key={star}
          onPress={() => onChange(star)}
          style={styles.starButton}
        >
          <Text style={[styles.star, star <= value && styles.starActive]}>
            {star <= value ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function StoreReviewFormModal({
  initialComment = '',
  initialRating = 0,
  isSaving = false,
  isUpdate = false,
  onClose,
  onSubmit,
  visible,
}: StoreReviewFormModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setRating(initialRating);
    setComment(initialComment);
  }, [initialComment, initialRating, visible]);

  const handleSubmit = async () => {
    if (rating < 1) {
      return;
    }

    await onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      subtitle={
        isUpdate
          ? 'Atualize sua nota e comentário sobre esta loja.'
          : 'Conte como foi sua experiência com esta loja.'
      }
      title={isUpdate ? 'Editar avaliação' : 'Avaliar loja'}
      visible={visible}
    >
      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Sua nota</Text>
          <StarSelector onChange={setRating} value={rating} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Comentário</Text>
          <TextInput
            multiline
            onChangeText={setComment}
            placeholder="Descreva sua experiência (opcional)"
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            value={comment}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSaving || rating < 1}
          onPress={() => void handleSubmit()}
          style={[styles.saveButton, (isSaving || rating < 1) && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isUpdate ? 'Salvar alterações' : 'Publicar avaliação'}
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  field: {
    gap: 8,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    color: colors.textMuted,
    fontSize: 28,
    lineHeight: 32,
  },
  starActive: {
    color: colors.primary,
  },
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
