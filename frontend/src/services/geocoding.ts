import { z } from 'zod';

import { api } from './api';

const geocodeResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export interface GeocodeAddressInput {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipcode: string;
}

export async function geocodeAddress(
  input: GeocodeAddressInput,
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { data } = await api.get('/geocode/', {
      params: {
        street: input.street,
        number: input.number,
        district: input.district,
        city: input.city,
        state: input.state,
        zipcode: input.zipcode.replace(/\D/g, ''),
      },
    });

    return geocodeResponseSchema.parse(data);
  } catch {
    return null;
  }
}
