import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';

export default function MerchantProductCreateScreen() {
  const { addProduct } = useMerchant();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [active, setActive] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelect = async (source: 'camera' | 'gallery') => {
    const uri =
      source === 'camera' && Platform.OS !== 'web'
        ? await launchCamera([1, 1])
        : await launchGallery([1, 1]);

    if (uri) {
      setImageUrl(uri);
    }

    setIsPickerOpen(false);
  };

  const handleSave = () => {
    const numericPrice = Number(price.replace(',', '.'));

    if (!name || !description || !numericPrice || !imageUrl) {
      Alert.alert('Campos obrigatorios', 'Preencha nome, preco, descricao e imagem.');
      return;
    }

    addProduct({
      name,
      description,
      price: numericPrice,
      discounted_price: discountPrice ? Number(discountPrice.replace(',', '.')) : undefined,
      photo_url: imageUrl,
      is_active: active,
    });

    router.replace('/(merchant)/catalog');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Novo Produto</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={() => setIsPickerOpen(true)} style={styles.imageField}>
            <View style={styles.imageCircle}>
              <Ionicons color={colors.primary} name="camera-outline" size={30} />
            </View>
            <Text style={styles.imageTitle}>Toque para adicionar foto</Text>
            <Text style={styles.imageSubtitle}>Imagem clara ajuda a vender mais.</Text>
          </Pressable>

          <View style={styles.field}>
            <Text style={styles.label}>Nome do produto</Text>
            <TextInput placeholder="Ex.: Camiseta gola careca" placeholderTextColor={colors.textMuted} style={styles.input} value={name} onChangeText={setName} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Preco</Text>
            <TextInput keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={colors.textMuted} style={styles.input} value={price} onChangeText={setPrice} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Descricao</Text>
            <TextInput multiline numberOfLines={4} placeholder="Descreva material, tamanho e cores" placeholderTextColor={colors.textMuted} style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Desconto (opcional)</Text>
            <TextInput keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={colors.textMuted} style={styles.input} value={discountPrice} onChangeText={setDiscountPrice} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Produto ativo</Text>
            <Switch ios_backgroundColor={colors.border} onValueChange={setActive} thumbColor={colors.white} trackColor={{ false: colors.border, true: '#DCFCE7' }} value={active} />
          </View>

          <Pressable accessibilityRole="button" onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Salvar Produto</Text>
          </Pressable>
        </ScrollView>

        <MerchantBottomNav active="catalog" />
      </View>

      <BottomSheetModal
        onClose={() => setIsPickerOpen(false)}
        subtitle="Escolha como deseja adicionar a foto do produto."
        title="Imagem do produto"
        visible={isPickerOpen}
      >
        {Platform.OS !== 'web' ? (
          <Pressable accessibilityRole="button" onPress={() => void handleSelect('camera')} style={styles.modalOption}>
            <Ionicons color={colors.primary} name="camera-outline" size={20} />
            <Text style={styles.modalOptionText}>Tirar foto</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => void handleSelect('gallery')} style={styles.modalOption}>
          <Ionicons color={colors.primary} name="images-outline" size={20} />
          <Text style={styles.modalOptionText}>Escolher da galeria</Text>
        </Pressable>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 10 },
  scrollContent: { paddingTop: 24, paddingBottom: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutralSoft },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  imageField: { alignItems: 'center', justifyContent: 'center', gap: 8, height: 180, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 12 },
  imageCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  imageTitle: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  imageSubtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  field: { gap: 6 },
  label: { ...typography.label, color: colors.textPrimary },
  input: { height: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '400' },
  textArea: { height: 88, paddingTop: 12, textAlignVertical: 'top' },
  toggleRow: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  toggleLabel: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '400' },
  saveButton: { height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.primary },
  saveButtonText: { color: colors.white, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  modalOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  modalOptionText: { color: colors.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '600' },
});
