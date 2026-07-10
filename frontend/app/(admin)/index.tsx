import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminFilterChips } from '@/src/components/admin/AdminFilterChips';
import { AdminStoreCard } from '@/src/components/admin/AdminStoreCard';
import { AdminSummaryCards } from '@/src/components/admin/AdminSummaryCards';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { BottomSheetOption } from '@/src/components/ui/BottomSheetOption';
import { colors, spacing } from '@/src/constants/tokens';
import { useAppModal } from '@/src/contexts/AppModalContext';
import {
  useAdminStoreSummary,
  useAdminStores,
  useApproveAdminStore,
  useRejectAdminStore,
} from '@/src/queries/useAdminStores';
import { useAuthStore } from '@/src/stores/authStore';
import type { AdminStoreFilter } from '@/src/types/store';

export default function AdminPanelScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { showAlert, showConfirm } = useAppModal();
  const [filter, setFilter] = useState<AdminStoreFilter>('PENDING');
  const [rejectStoreId, setRejectStoreId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingStoreId, setProcessingStoreId] = useState<string | null>(null);

  const { data: summary, isLoading: isSummaryLoading } = useAdminStoreSummary();
  const { data: stores = [], isLoading: isListLoading, refetch } = useAdminStores(filter);
  const approveMutation = useApproveAdminStore();
  const rejectMutation = useRejectAdminStore();

  useEffect(() => {
    if (user && !user.is_staff) {
      router.replace('/(consumer)' as never);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleApprove = async (storeId: string, storeName: string) => {
    const confirmed = await showConfirm({
      title: 'Aprovar estabelecimento',
      subtitle: `Deseja aprovar "${storeName}"?`,
      confirmLabel: 'Aprovar',
    });

    if (!confirmed) {
      return;
    }

    try {
      setProcessingStoreId(storeId);
      await approveMutation.mutateAsync(storeId);
      await refetch();
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível aprovar o estabelecimento.',
      });
    } finally {
      setProcessingStoreId(null);
    }
  };

  const openRejectModal = (storeId: string) => {
    setRejectStoreId(storeId);
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setRejectStoreId(null);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectStoreId) {
      return;
    }

    const reason = rejectionReason.trim();
    if (!reason) {
      await showAlert({
        title: 'Motivo obrigatório',
        subtitle: 'Informe o motivo da recusa.',
      });
      return;
    }

    try {
      setProcessingStoreId(rejectStoreId);
      await rejectMutation.mutateAsync({ storeId: rejectStoreId, rejectionReason: reason });
      closeRejectModal();
      await refetch();
    } catch {
      await showAlert({
        title: 'Erro',
        subtitle: 'Não foi possível recusar o estabelecimento.',
      });
    } finally {
      setProcessingStoreId(null);
    }
  };

  const isLoading = isSummaryLoading || isListLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Pressable accessibilityRole="button" onPress={() => void handleLogout()}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AdminSummaryCards summary={summary} />

          <AdminFilterChips activeFilter={filter} onChange={setFilter} />

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : stores.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Nenhum estabelecimento nesta categoria.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {stores.map((store) => (
                <AdminStoreCard
                  key={store.id}
                  isProcessing={processingStoreId === store.id}
                  onApprove={
                    store.status === 'PENDING'
                      ? () => void handleApprove(store.id, store.name)
                      : undefined
                  }
                  onDetails={() =>
                    router.push(`/(admin)/stores/${store.id}` as never)
                  }
                  onReject={
                    store.status === 'PENDING'
                      ? () => openRejectModal(store.id)
                      : undefined
                  }
                  store={store}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <BottomSheetModal
        onClose={closeRejectModal}
        subtitle="Descreva o motivo da recusa para o lojista."
        title="Recusar estabelecimento"
        visible={Boolean(rejectStoreId)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Motivo da recusa</Text>
          <TextInput
            multiline
            numberOfLines={4}
            onChangeText={setRejectionReason}
            placeholder="Ex.: Documentação incompleta"
            placeholderTextColor={colors.textMuted}
            style={styles.reasonInput}
            textAlignVertical="top"
            value={rejectionReason}
          />
        </View>

        <BottomSheetOption
          destructive
          icon="close-circle-outline"
          onPress={() => void handleReject()}
          subtitle="O lojista receberá o motivo informado."
          title="Confirmar recusa"
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: 12,
    gap: 12,
    paddingBottom: spacing.xl,
  },
  list: {
    gap: 12,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  modalContent: {
    gap: 12,
    marginBottom: spacing.sm,
  },
  modalLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  reasonInput: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    backgroundColor: colors.surface,
  },
});
