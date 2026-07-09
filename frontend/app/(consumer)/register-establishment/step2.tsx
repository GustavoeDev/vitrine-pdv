import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { RegisterScreenLayout } from '@/src/components/features/establishment/RegisterScreenLayout';
import { RegisterStepBar } from '@/src/components/features/establishment/RegisterHeader';
import { AuthButton } from '@/src/components/ui/AuthButton';
import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import { isLocationStepComplete } from '@/src/utils/establishmentRegistration';

export default function RegisterEstablishmentStep2Screen() {
  const { data, updateData } = useEstablishmentRegistration();

  const handleContinue = () => {
    if (!isLocationStepComplete(data)) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha CEP, rua, número, bairro, cidade e estado para continuar.',
      );
      return;
    }

    router.push('/(consumer)/register-establishment/step3');
  };

  const handleSkip = () => {
    router.push('/(consumer)/register-establishment/step3');
  };

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
          onChangeText={(cep) => updateData({ cep })}
          placeholder="Digite o CEP"
          value={data.cep}
        />

        <AuthTextInput
          label="Rua"
          onChangeText={(street) => updateData({ street })}
          placeholder="Digite a Rua"
          value={data.street}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <AuthTextInput
              label="Número"
              onChangeText={(number) => updateData({ number })}
              placeholder="Digite o Número"
              value={data.number}
            />
          </View>
          <View style={styles.halfField}>
            <AuthTextInput
              label="Complemento"
              onChangeText={(complement) => updateData({ complement })}
              placeholder="Casa, Apartamento..."
              value={data.complement}
            />
          </View>
        </View>

        <AuthTextInput
          label="Bairro"
          onChangeText={(neighborhood) => updateData({ neighborhood })}
          placeholder="Digite o Bairro"
          value={data.neighborhood}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <AuthTextInput
              label="Cidade"
              onChangeText={(city) => updateData({ city })}
              placeholder="Informe a Cidade"
              value={data.city}
            />
          </View>
          <View style={styles.halfField}>
            <AuthTextInput
              autoCapitalize="characters"
              label="Estado"
              maxLength={2}
              onChangeText={(state) => updateData({ state: state.toUpperCase() })}
              placeholder="Informe o Estado"
              value={data.state}
            />
          </View>
        </View>

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
});
