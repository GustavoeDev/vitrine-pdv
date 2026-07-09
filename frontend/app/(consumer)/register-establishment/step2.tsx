import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AddressLocationPicker } from '@/src/components/features/establishment/AddressLocationPicker';
import { RegisterScreenLayout } from '@/src/components/features/establishment/RegisterScreenLayout';
import { RegisterStepBar } from '@/src/components/features/establishment/RegisterHeader';
import { AuthButton } from '@/src/components/ui/AuthButton';
import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { colors } from '@/src/constants/tokens';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import { fetchAddressByCep } from '@/src/services/viaCep';
import {
  formatCep,
  isAddressFieldsComplete,
  isLocationStepComplete,
} from '@/src/utils/establishmentRegistration';

export default function RegisterEstablishmentStep2Screen() {
  const { data, updateData } = useEstablishmentRegistration();
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const lastResolvedCepRef = useRef('');

  const handleLocationChange = useCallback(
    (latitude: number, longitude: number) => {
      updateData({ latitude, longitude });
    },
    [updateData],
  );

  const handleCepChange = (value: string) => {
    const formattedCep = formatCep(value);
    const digits = formattedCep.replace(/\D/g, '');

    if (digits.length < 8) {
      updateData({
        cep: formattedCep,
        ...(data.cityStateLocked
          ? {
              city: '',
              state: '',
              cityStateLocked: false,
              latitude: null,
              longitude: null,
            }
          : { latitude: null, longitude: null }),
      });
      setCepError(null);
      lastResolvedCepRef.current = '';
      return;
    }

    updateData({ cep: formattedCep, latitude: null, longitude: null });
  };

  useEffect(() => {
    const digits = data.cep.replace(/\D/g, '');

    if (digits.length !== 8 || digits === lastResolvedCepRef.current) {
      return;
    }

    let cancelled = false;

    async function resolveCep() {
      setIsLoadingCep(true);
      setCepError(null);

      try {
        const address = await fetchAddressByCep(digits);

        if (cancelled) {
          return;
        }

        if (!address) {
          setCepError('CEP não encontrado. Verifique e tente novamente.');
          updateData({
            cityStateLocked: false,
            latitude: null,
            longitude: null,
          });
          return;
        }

        lastResolvedCepRef.current = digits;
        updateData({
          street: address.street || '',
          neighborhood: address.neighborhood || '',
          city: address.city,
          state: address.state,
          cityStateLocked: true,
          latitude: null,
          longitude: null,
        });
      } finally {
        if (!cancelled) {
          setIsLoadingCep(false);
        }
      }
    }

    void resolveCep();

    return () => {
      cancelled = true;
    };
  }, [data.cep, updateData]);

  const handleContinue = () => {
    if (!isLocationStepComplete(data)) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha o endereço completo e confirme a localização no mapa para continuar.',
      );
      return;
    }

    router.push('/(consumer)/register-establishment/step3');
  };

  const handleSkip = () => {
    router.push('/(consumer)/register-establishment/step3');
  };

  const showLocationPicker = isAddressFieldsComplete(data);

  return (
    <RegisterScreenLayout
      stepBar={
        <RegisterStepBar
          currentStep={2}
          onBack={() => router.back()}
          onSkip={handleSkip}
          showBackLink
          showSkipLink
          title="Onde fica?"
        />
      }
    >
      <View style={styles.form}>
        <AuthTextInput
          keyboardType="number-pad"
          label="CEP"
          maxLength={9}
          onChangeText={handleCepChange}
          placeholder="Digite o CEP"
          value={data.cep}
        />
        {isLoadingCep ? <Text style={styles.helperText}>Buscando CEP...</Text> : null}
        {cepError ? <Text style={styles.errorText}>{cepError}</Text> : null}

        <AuthTextInput
          label="Rua"
          onChangeText={(street) => updateData({ street, latitude: null, longitude: null })}
          placeholder="Digite a Rua"
          value={data.street}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <AuthTextInput
              keyboardType="numeric"
              label="Número"
              onChangeText={(number) => updateData({ number, latitude: null, longitude: null })}
              placeholder="Digite o Número"
              value={data.number}
            />
          </View>
          <View style={styles.halfField}>
            <AuthTextInput
              label="Complemento (opcional)"
              onChangeText={(complement) => updateData({ complement })}
              placeholder="Casa, apartamento..."
              value={data.complement}
            />
          </View>
        </View>

        <AuthTextInput
          label="Bairro"
          onChangeText={(neighborhood) =>
            updateData({ neighborhood, latitude: null, longitude: null })
          }
          placeholder="Digite o Bairro"
          value={data.neighborhood}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <AuthTextInput
              editable={!data.cityStateLocked}
              label="Cidade"
              onChangeText={(city) => updateData({ city, latitude: null, longitude: null })}
              placeholder="Informe a Cidade"
              value={data.city}
            />
          </View>
          <View style={styles.halfField}>
            <AuthTextInput
              autoCapitalize="characters"
              editable={!data.cityStateLocked}
              label="Estado"
              maxLength={2}
              onChangeText={(state) =>
                updateData({ state: state.toUpperCase(), latitude: null, longitude: null })
              }
              placeholder="UF"
              value={data.state}
            />
          </View>
        </View>

        {showLocationPicker ? (
          <AddressLocationPicker
            cep={data.cep}
            city={data.city}
            latitude={data.latitude}
            longitude={data.longitude}
            neighborhood={data.neighborhood}
            number={data.number}
            onLocationChange={handleLocationChange}
            state={data.state}
            street={data.street}
          />
        ) : null}

        <AuthButton label="Continuar" onPress={handleContinue} />
      </View>
    </RegisterScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  halfField: {
    flex: 1,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
  },
});
