import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { BottomSheetOption } from '@/src/components/ui/BottomSheetOption';

interface AlertOptions {
  subtitle?: string;
  title: string;
}

interface ConfirmOptions extends AlertOptions {
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
}

interface AppModalContextValue {
  showAlert: (options: AlertOptions) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

type ModalState =
  | { type: 'alert'; options: AlertOptions; resolve: () => void }
  | { type: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | null;

const AppModalContext = createContext<AppModalContextValue | null>(null);

let modalController: AppModalContextValue | null = null;

export function showAppAlert(title: string, subtitle?: string): Promise<void> {
  if (!modalController) {
    return Promise.resolve();
  }

  return modalController.showAlert({ title, subtitle });
}

export function showAppConfirm(options: ConfirmOptions): Promise<boolean> {
  if (!modalController) {
    return Promise.resolve(false);
  }

  return modalController.showConfirm(options);
}

export function AppModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setModal({
        type: 'alert',
        options,
        resolve: () => {
          resolve();
          setModal(null);
        },
      });
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModal({
        type: 'confirm',
        options,
        resolve: (value) => {
          resolve(value);
          setModal(null);
        },
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      showAlert,
      showConfirm,
    }),
    [showAlert, showConfirm],
  );

  useEffect(() => {
    modalController = value;
    return () => {
      modalController = null;
    };
  }, [value]);

  return (
    <AppModalContext.Provider value={value}>
      {children}

      <BottomSheetModal
        onClose={() => {
          if (modal?.type === 'alert') {
            modal.resolve();
            return;
          }

          if (modal?.type === 'confirm') {
            modal.resolve(false);
          }
        }}
        subtitle={modal?.options.subtitle}
        title={modal?.options.title ?? ''}
        visible={modal !== null}
      >
        {modal?.type === 'alert' ? (
          <BottomSheetOption
            icon="checkmark-circle-outline"
            onPress={() => modal.resolve()}
            showChevron={false}
            subtitle="Toque para fechar e continuar."
            title="Entendi"
          />
        ) : null}

        {modal?.type === 'confirm' ? (
          <>
            <BottomSheetOption
              destructive={modal.options.destructive}
              icon={modal.options.destructive ? 'trash-outline' : 'checkmark-circle-outline'}
              onPress={() => modal.resolve(true)}
              subtitle={
                modal.options.destructive
                  ? 'Esta ação não pode ser desfeita.'
                  : 'Confirmar e continuar.'
              }
              title={modal.options.confirmLabel ?? 'Confirmar'}
            />
            <BottomSheetOption
              icon="close-circle-outline"
              onPress={() => modal.resolve(false)}
              subtitle="Voltar sem alterar nada."
              title={modal.options.cancelLabel ?? 'Cancelar'}
            />
          </>
        ) : null}
      </BottomSheetModal>
    </AppModalContext.Provider>
  );
}

export function useAppModal(): AppModalContextValue {
  const context = useContext(AppModalContext);

  if (!context) {
    throw new Error('useAppModal must be used within AppModalProvider');
  }

  return context;
}
