import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import {
  EstablishmentMediaPickers,
} from '@/src/components/features/establishment/EstablishmentMediaPickers';
import { RegisterScreenLayout } from '@/src/components/features/establishment/RegisterScreenLayout';
import { RegisterStepBar } from '@/src/components/features/establishment/RegisterHeader';
import { AuthButton } from '@/src/components/ui/AuthButton';
import { AuthTextInput } from '@/src/components/ui/AuthTextInput';
import { SelectField } from '@/src/components/ui/SelectField';
import { useEstablishmentRegistration } from '@/src/contexts/EstablishmentRegistrationContext';
import { useCategories } from '@/src/queries/useCategories';
import { isBusinessStepComplete } from '@/src/utils/establishmentRegistration';

export default function RegisterEstablishmentStep1Screen() {
  const { data, updateData } = useEstablishmentRegistration();
  const { data: categories = [], isLoading } = useCategories();

  const selectedCategory = categories.find((category) => category.id === data.categoryId);
  const subcategoryOptions =
    selectedCategory?.children.map((child) => ({
      id: child.name,
      label: child.name,
    })) ?? [];
  const showSubcategoryField = Boolean(data.categoryId && subcategoryOptions.length > 0);

  const handleContinue = () => {
    if (!isBusinessStepComplete(data, categories)) {
      Alert.alert(
        'Campos obrigatórios',
        showSubcategoryField
          ? 'Preencha nome, categoria, subcategoria e telefone para continuar.'
          : 'Preencha nome, categoria e telefone para continuar.',
      );
      return;
    }

    router.push('/(consumer)/register-establishment/step2');
  };

  const handleSkip = () => {
    router.push('/(consumer)/register-establishment/step2');
  };

  return (
    <RegisterScreenLayout
      stepBar={
        <RegisterStepBar
          currentStep={1}
          onSkip={handleSkip}
          showSkipLink
          title="Sobre o seu negócio"
        />
      }
    >
      <View style={styles.form}>
        <EstablishmentMediaPickers
          coverImageUri={data.coverImageUri}
          logoImageUri={data.logoImageUri}
          name={data.name}
          onPickCover={(coverImageUri) => updateData({ coverImageUri })}
          onPickLogo={(logoImageUri) => updateData({ logoImageUri })}
        />

        <AuthTextInput
          label="Nome do estabelecimento"
          onChangeText={(name) => updateData({ name })}
          placeholder="Digite seu nome"
          value={data.name}
        />

        <SelectField
          disabled={isLoading}
          label="Categoria"
          onSelect={(categoryId) => updateData({ categoryId, subcategory: '' })}
          options={categories.map((category) => ({
            id: category.id,
            label: category.name,
          }))}
          placeholder={isLoading ? 'Carregando categorias...' : 'Informe a categoria'}
          value={data.categoryId}
        />

        {showSubcategoryField ? (
          <SelectField
            label="Subcategoria"
            onSelect={(_, subcategory) => updateData({ subcategory })}
            options={subcategoryOptions}
            placeholder="Informe a subcategoria"
            value={data.subcategory}
          />
        ) : null}

        <AuthTextInput
          keyboardType="phone-pad"
          label="Telefone"
          onChangeText={(phone) => updateData({ phone })}
          placeholder="Digite o seu telefone"
          value={data.phone}
        />

        <AuthButton label="Continuar" onPress={handleContinue} />
      </View>
    </RegisterScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
});
