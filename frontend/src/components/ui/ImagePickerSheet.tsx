import { Platform } from 'react-native';

import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { BottomSheetOption } from '@/src/components/ui/BottomSheetOption';

interface ImagePickerSheetProps {
  onClose: () => void;
  onSelect: (source: 'camera' | 'gallery') => void;
  subtitle: string;
  title: string;
  visible: boolean;
}

export function ImagePickerSheet({
  onClose,
  onSelect,
  subtitle,
  title,
  visible,
}: ImagePickerSheetProps) {
  return (
    <BottomSheetModal onClose={onClose} subtitle={subtitle} title={title} visible={visible}>
      {Platform.OS !== 'web' ? (
        <BottomSheetOption
          icon="camera-outline"
          onPress={() => onSelect('camera')}
          subtitle="Abra a câmera para registrar uma imagem."
          title="Tirar foto"
        />
      ) : null}

      <BottomSheetOption
        icon="images-outline"
        onPress={() => onSelect('gallery')}
        subtitle="Selecione uma imagem já salva no dispositivo."
        title="Escolher da galeria"
      />
    </BottomSheetModal>
  );
}
