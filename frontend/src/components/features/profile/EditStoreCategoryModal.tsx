import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { SelectField } from '@/src/components/ui/SelectField';
import { colors, radius, spacing } from '@/src/constants/tokens';
import { useCategories } from '@/src/queries/useCategories';
import { categoryHasSubcategories } from '@/src/utils/establishmentRegistration';

interface EditStoreCategoryModalProps {
  initialCategoryId: string;
  initialSubcategory: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: { category_id: string; subcategory: string }) => Promise<void>;
  visible: boolean;
}

export function EditStoreCategoryModal({
  initialCategoryId,
  initialSubcategory,
  isSaving = false,
  onClose,
  onSave,
  visible,
}: EditStoreCategoryModalProps) {
  const { data: categories = [], isLoading } = useCategories();
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [subcategory, setSubcategory] = useState(initialSubcategory);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCategoryId(initialCategoryId);
    setSubcategory(initialSubcategory);
  }, [initialCategoryId, initialSubcategory, visible]);

  const selectedCategory = categories.find((category) => category.id === categoryId);
  const subcategoryOptions =
    selectedCategory?.children.map((child) => ({
      id: child.name,
      label: child.name,
    })) ?? [];
  const requiresSubcategory = categoryHasSubcategories(categoryId, categories);

  const handleSave = async () => {
    if (!categoryId) {
      return;
    }

    if (requiresSubcategory && !subcategory.trim()) {
      return;
    }

    await onSave({
      category_id: categoryId,
      subcategory: subcategory.trim(),
    });
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      subtitle="Defina a categoria exibida no perfil da loja."
      title="Categoria da loja"
      visible={visible}
    >
      <View style={styles.content}>
        <SelectField
          disabled={isLoading}
          label="Categoria"
          onSelect={(id) => {
            setCategoryId(id);
            setSubcategory('');
          }}
          options={categories.map((category) => ({
            id: category.id,
            label: category.name,
          }))}
          placeholder={isLoading ? 'Carregando...' : 'Selecione a categoria'}
          value={categoryId}
        />

        {requiresSubcategory ? (
          <SelectField
            label="Subcategoria"
            onSelect={(_, label) => setSubcategory(label)}
            options={subcategoryOptions}
            placeholder="Selecione a subcategoria"
            value={subcategory}
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSaving || !categoryId || (requiresSubcategory && !subcategory.trim())}
          onPress={() => void handleSave()}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar categoria</Text>
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
  saveButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
