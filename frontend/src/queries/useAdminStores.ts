import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  activateAdminStore,
  approveAdminStore,
  deactivateAdminStore,
  fetchAdminStore,
  fetchAdminStores,
  fetchAdminStoreSummary,
  rejectAdminStore,
} from '@/src/services/adminStores';
import type { AdminStoreFilter } from '@/src/types/store';

export const adminStoreKeys = {
  all: ['admin-stores'] as const,
  summary: () => [...adminStoreKeys.all, 'summary'] as const,
  list: (status: AdminStoreFilter) => [...adminStoreKeys.all, 'list', status] as const,
  detail: (id: string) => [...adminStoreKeys.all, 'detail', id] as const,
};

export function useAdminStoreSummary() {
  return useQuery({
    queryKey: adminStoreKeys.summary(),
    queryFn: fetchAdminStoreSummary,
  });
}

export function useAdminStores(status: AdminStoreFilter) {
  return useQuery({
    queryKey: adminStoreKeys.list(status),
    queryFn: () => fetchAdminStores(status),
    staleTime: 0,
  });
}

export function useAdminStore(storeId?: string) {
  return useQuery({
    queryKey: adminStoreKeys.detail(storeId ?? 'unknown'),
    queryFn: () => fetchAdminStore(storeId!),
    enabled: Boolean(storeId),
  });
}

export function useApproveAdminStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveAdminStore,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminStoreKeys.all });
    },
  });
}

export function useRejectAdminStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, rejectionReason }: { storeId: string; rejectionReason: string }) =>
      rejectAdminStore(storeId, rejectionReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminStoreKeys.all });
    },
  });
}

export function useDeactivateAdminStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateAdminStore,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminStoreKeys.all });
    },
  });
}

export function useActivateAdminStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateAdminStore,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminStoreKeys.all });
    },
  });
}
