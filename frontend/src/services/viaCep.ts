import { z } from 'zod';

import { api } from './api';

const viaCepResponseSchema = z.object({
  cep: z.string(),
  logradouro: z.string(),
  complemento: z.string(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string(),
  erro: z.boolean().optional(),
});

export interface ViaCepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
  const digits = cep.replace(/\D/g, '');

  if (digits.length !== 8) {
    return null;
  }

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  const data = viaCepResponseSchema.parse(await response.json());

  if (data.erro) {
    return null;
  }

  return {
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
  };
}
