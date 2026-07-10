import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { BottomSheetModal } from '@/src/components/ui/BottomSheetModal';
import { colors, radius, spacing } from '@/src/constants/tokens';
import type { AddressRecord } from '@/src/types';
import { formatCep } from '@/src/utils/establishmentRegistration';

interface EditStoreAddressModalProps {
  initialAddress: AddressRecord;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (address: {
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    zipcode: string;
  }) => Promise<void>;
  visible: boolean;
}

export function EditStoreAddressModal({
  initialAddress,
  isSaving = false,
  onClose,
  onSave,
  visible,
}: EditStoreAddressModalProps) {
  const [street, setStreet] = useState(initialAddress.street);
  const [number, setNumber] = useState(initialAddress.number);
  const [complement, setComplement] = useState(initialAddress.complement ?? '');
  const [district, setDistrict] = useState(initialAddress.district);
  const [city, setCity] = useState(initialAddress.city);
  const [stateValue, setStateValue] = useState(initialAddress.state);
  const [zipcode, setZipcode] = useState(initialAddress.zipcode);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setStreet(initialAddress.street);
    setNumber(initialAddress.number);
    setComplement(initialAddress.complement ?? '');
    setDistrict(initialAddress.district);
    setCity(initialAddress.city);
    setStateValue(initialAddress.state);
    setZipcode(initialAddress.zipcode);
  }, [initialAddress, visible]);

  const handleSave = async () => {
    if (!street.trim() || !number.trim() || !district.trim() || !city.trim() || !stateValue.trim()) {
      return;
    }

    await onSave({
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim(),
      district: district.trim(),
      city: city.trim(),
      state: stateValue.trim().toUpperCase(),
      zipcode: zipcode.replace(/\D/g, ''),
    });
  };

  return (
    <BottomSheetModal
      onClose={onClose}
      subtitle="Atualize o endereço exibido no perfil da loja."
      title="Endereço da loja"
      visible={visible}
    >
      <View style={styles.content}>
        <AuthTextInput
          keyboardType="number-pad"
          label="CEP"
          onChangeText={(value) => setZipcode(formatCep(value))}
          value={zipcode}
        />
        <AuthTextInput label="Rua" onChangeText={setStreet} value={street} />
        <AuthTextInput label="Número" onChangeText={setNumber} value={number} />
        <AuthTextInput label="Complemento" onChangeText={setComplement} value={complement} />
        <AuthTextInput label="Bairro" onChangeText={setDistrict} value={district} />
        <AuthTextInput label="Cidade" onChangeText={setCity} value={city} />
        <AuthTextInput
          autoCapitalize="characters"
          label="Estado"
          maxLength={2}
          onChangeText={setStateValue}
          value={stateValue}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => void handleSave()}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar endereço</Text>
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
