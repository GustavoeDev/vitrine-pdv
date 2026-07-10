import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantBottomNav } from '@/src/components/merchant/MerchantBottomNav';
import { DateRangeField } from '@/src/components/ui/DateRangeField';
import { ImagePickerSheet } from '@/src/components/ui/ImagePickerSheet';
import { colors, radius, spacing, typography } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import { useMerchant } from '@/src/contexts/MerchantContext';
import {
  endOfDay,
  isEndDateBeforeStartDate,
  startOfDay,
} from '@/src/utils/dates';
import { resolvePromotionDiscountTotal } from '@/src/utils/merchantPromotions';
import { normalizeRouteParam } from '@/src/utils/routeParams';
import { launchCamera, launchGallery } from '@/src/utils/imagePicker';

export default function MerchantPromotionEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const promotionId = normalizeRouteParam(id);
  const { promotions, isLoadingPromotions, isSavingPromotion, updatePromotion } = useMerchant();
  const { showAlert } = useAppModal();

  const promotion = useMemo(
    () => promotions.find((item) => item.id === promotionId),
    [promotionId, promotions],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [discountTotal, setDiscountTotal] = useState('');
  const [notifyFavorites, setNotifyFavorites] = useState(false);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!promotion) {
      return;
    }

    setTitle(promotion.title);
    setDescription(promotion.description ?? '');
    setStartDate(startOfDay(new Date(promotion.start_date)));
    setEndDate(startOfDay(new Date(promotion.end_date)));
    setDiscountTotal(resolvePromotionDiscountTotal(promotion));
    setNotifyFavorites(promotion.notify_favorites);
    setBannerUri(promotion.banner_url ?? null);
  }, [promotion]);

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
    if (!promotion || !startDate || !endDate) {
      return;
    }

    if (isEndDateBeforeStartDate(startDate, endDate)) {
      await showAlert({
        title: 'Validade inválida',
        subtitle: 'A data final deve ser igual ou posterior à data inicial.',
      });
      return;
    }

    if (promotion.promotion_type === 'daily' && (!title.trim() || !description.trim() || !bannerUri)) {
      await showAlert({
        title: 'Campos obrigatórios',
        subtitle: 'Preencha título, descrição e banner da promoção.',
      });
      return;
    }

    if (promotion.promotion_type === 'product-discount' && !discountTotal) {
      await showAlert({
        title: 'Campos obrigatórios',
        subtitle: 'Informe o valor do desconto.',
      });
      return;
    }

    try {
      await updatePromotion(promotion.id, {
        promotion_type: promotion.promotion_type,
        ...(promotion.promotion_type === 'daily'
          ? {
              title: title.trim(),
              description: description.trim(),
              notify_favorites: notifyFavorites,
              banner_url: bannerUri,
            }
          : {
              discount_total: Number(discountTotal.replace(',', '.')),
            }),
        start_date: startOfDay(startDate).toISOString(),
        end_date: endOfDay(endDate).toISOString(),
      });

      router.back();
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível salvar as alterações.',
      });
    }
  };

  if (isLoadingPromotions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!promotion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Promoção não encontrada</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isDaily = promotion.promotion_type === 'daily';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Editar Promoção</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>
                {isDaily ? 'Promoção do Dia' : 'Desconto em Produto'}
              </Text>
            </View>

            {isDaily ? (
              <>
                <Pressable
                  accessibilityLabel="Alterar banner da promoção"
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
                  <Text style={styles.label}>Título da promoção</Text>
                  <TextInput
                    onChangeText={setTitle}
                    placeholder="Ex.: Café da manhã especial"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={title}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Descrição</Text>
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
                <View style={styles.readonlyField}>
                  <Text style={styles.label}>Produto</Text>
                  <Text style={styles.readonlyValue}>{promotion.title}</Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Total de desconto (R$)</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setDiscountTotal}
                    placeholder="Informe o valor do desconto"
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

                if (endDate && isEndDateBeforeStartDate(date, endDate)) {
                  setEndDate(date);
                }
              }}
              startDate={startDate}
            />

            {isDaily ? (
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
                {isSavingPromotion ? 'Salvando...' : 'Salvar alterações'}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  backLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
  },
  title: { color: colors.textPrimary, fontSize: 20, lineHeight: 26, fontWeight: '700' },
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
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  typePillText: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
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
  readonlyField: {
    gap: 6,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  readonlyValue: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  label: { ...typography.label, color: colors.textPrimary },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
  textArea: { height: 60, paddingTop: 12, textAlignVertical: 'top' },
  toggleRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  toggleText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
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
