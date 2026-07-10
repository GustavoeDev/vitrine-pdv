import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { DateRangeField } from '@/src/components/ui/DateRangeField';
import { ImagePickerSheet } from '@/src/components/ui/ImagePickerSheet';
import { SelectField } from '@/src/components/ui/SelectField';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useMerchant } from '@/src/contexts/MerchantContext';
import { MerchantPromotionType } from '@/src/types/merchant';
import {
  createDefaultPromotionEndDate,
  endOfDay,
  isEndDateBeforeStartDate,
  startOfDay,
} from '@/src/utils/dates';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';

function createInitialStartDate(): Date {
  return startOfDay(new Date());
}

export default function MerchantPromotionCreateScreen() {
  const { products, addPromotion, isSavingPromotion } = useMerchant();
  const { showAlert } = useAppModal();
  const [type, setType] = useState<MerchantPromotionType>('daily');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(createInitialStartDate);
  const [endDate, setEndDate] = useState<Date>(() =>
    createDefaultPromotionEndDate(createInitialStartDate()),
  );
  const [productId, setProductId] = useState('');
  const [discountTotal, setDiscountTotal] = useState('');
  const [notifyFavorites, setNotifyFavorites] = useState(true);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const productOptions = useMemo(
    () => products.map((product) => ({ id: product.id, label: product.name })),
    [products],
  );

  const handleSelectBanner = async (source: 'camera' | 'gallery') => {
    const uri =
      source === 'camera' && Platform.OS !== 'web'
        ? await launchCamera([16, 9])
        : await launchGallery([16, 9]);

    if (uri) {
      setBannerUri(uri);
    }

    setIsPickerOpen(false);
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      await showAlert({
        title: 'Campos obrigatórios',
        subtitle: 'Informe a data inicial e final da promoção.',
      });
      return;
    }

    if (isEndDateBeforeStartDate(startDate, endDate)) {
      await showAlert({
        title: 'Validade inválida',
        subtitle: 'A data final deve ser igual ou posterior à data inicial.',
      });
      return;
    }

    if (type === 'daily' && (!title || !description || !bannerUri)) {
      await showAlert({
        title: 'Campos obrigatórios',
        subtitle: 'Preencha título, descrição e banner da promoção do dia.',
      });
      return;
    }

    if (type === 'product-discount' && (!productId || !discountTotal)) {
      await showAlert({
        title: 'Campos obrigatórios',
        subtitle: 'Selecione um produto e o total de desconto.',
      });
      return;
    }

    try {
      await addPromotion({
        promotion_type: type,
        title: type === 'daily' ? title : products.find((product) => product.id === productId)?.name ?? 'Promocao',
        description: type === 'daily' ? description : 'Desconto aplicado em produto do catalogo.',
        start_date: startOfDay(startDate).toISOString(),
        end_date: endOfDay(endDate).toISOString(),
        notify_favorites: notifyFavorites,
        product_id: type === 'product-discount' ? productId : undefined,
        discount_total: discountTotal ? Number(discountTotal.replace(',', '.')) : undefined,
        banner_url: type === 'daily' ? bannerUri ?? undefined : undefined,
      });

      router.replace('/(merchant)/promotions');
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível publicar a promoção.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Criar Promocao</Text>
          </View>

          <View style={styles.typeRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setType('daily')}
              style={[styles.typeCard, type === 'daily' && styles.typeCardActive]}
            >
              <Text style={[styles.typeTitle, type === 'daily' && styles.typeTitleActive]}>Promocao do Dia</Text>
              <Text style={[styles.typeDescription, type === 'daily' && styles.typeDescriptionActive]}>
                Destaque na home e notificacao para favoritos
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setType('product-discount')}
              style={[styles.typeCard, type === 'product-discount' && styles.typeCardActive]}
            >
              <Text style={[styles.typeTitle, type === 'product-discount' && styles.typeTitleActive]}>
                Desconto em Produto
              </Text>
              <Text style={[styles.typeDescription, type === 'product-discount' && styles.typeDescriptionActive]}>
                Aplique desconto em um produto do catalogo
              </Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {type === 'daily' ? 'Promocao do Dia' : 'Desconto em Produto'}
            </Text>

            {type === 'daily' ? (
              <>
                <Pressable
                  accessibilityLabel="Adicionar banner da promoção"
                  accessibilityRole="button"
                  onPress={() => setIsPickerOpen(true)}
                  style={styles.bannerField}
                >
                  {bannerUri ? (
                    <Image source={{ uri: bannerUri }} style={styles.bannerImage} />
                  ) : (
                    <View style={styles.bannerPlaceholder}>
                      <Ionicons color={colors.primary} name="image-outline" size={28} />
                      <Text style={styles.bannerPlaceholderText}>Toque para adicionar o banner</Text>
                    </View>
                  )}
                </Pressable>
                <View style={styles.field}>
                  <Text style={styles.label}>Titulo da promocao</Text>
                  <TextInput
                    onChangeText={setTitle}
                    placeholder="Ex.: Cafe da manha especial"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={title}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Descricao</Text>
                  <TextInput
                    multiline
                    onChangeText={setDescription}
                    placeholder="Descreva a oferta com detalhes"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.textArea]}
                    value={description}
                  />
                </View>
              </>
            ) : (
              <>
                <SelectField
                  label="Produto"
                  onSelect={(id) => setProductId(id)}
                  options={productOptions}
                  placeholder="Selecione um produto"
                  value={productId}
                />
                <View style={styles.field}>
                  <Text style={styles.label}>Total de Desconto</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setDiscountTotal}
                    placeholder="Informe o preco total de desconto"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={discountTotal}
                  />
                </View>
              </>
            )}

            <DateRangeField
              endDate={endDate}
              label="Validade"
              onChangeEnd={setEndDate}
              onChangeStart={(date) => {
                setStartDate(date);

                if (isEndDateBeforeStartDate(date, endDate)) {
                  setEndDate(date);
                }
              }}
              startDate={startDate}
            />

            {type === 'daily' ? (
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Clientes que favoritaram recebem alerta</Text>
                <Switch
                  ios_backgroundColor={colors.border}
                  onValueChange={setNotifyFavorites}
                  thumbColor={colors.white}
                  trackColor={{ false: colors.border, true: '#DCFCE7' }}
                  value={notifyFavorites}
                />
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSavingPromotion}
              onPress={() => void handleSave()}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {isSavingPromotion ? 'Publicando...' : 'Publicar Promocao'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <MerchantBottomNav active="promotions" />
      </View>

      <ImagePickerSheet
        onClose={() => setIsPickerOpen(false)}
        onSelect={(source) => void handleSelectBanner(source)}
        subtitle="Escolha como deseja adicionar o banner da promoção."
        title="Banner da promoção"
        visible={isPickerOpen}
      />
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
  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: { flex: 1, gap: 6, padding: 12, borderWidth: 1, borderColor: colors.primary, borderRadius: 16 },
  typeCardActive: { backgroundColor: colors.primary },
  typeTitle: { color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  typeTitleActive: { color: colors.white },
  typeDescription: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  typeDescriptionActive: { color: colors.white },
  formCard: {
    gap: spacing.sm,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  formTitle: { color: colors.textPrimary, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  bannerField: {
    width: '100%',
    height: 140,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.neutralSoft,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
  },
  bannerPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  field: { gap: 6 },
  label: { ...typography.label, color: colors.textPrimary },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, color: colors.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '400' },
  textArea: { height: 60, paddingTop: 12, textAlignVertical: 'top' },
  toggleRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  toggleText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  saveButton: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.primary },
  saveButtonText: { color: colors.white, fontSize: 16, lineHeight: 22, fontWeight: '700' },
});
