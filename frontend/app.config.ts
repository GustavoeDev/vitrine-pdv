import type { ConfigContext, ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        LSApplicationQueriesSchemes: [
          ...((config.ios?.infoPlist?.LSApplicationQueriesSchemes as string[] | undefined) ?? []),
          'whatsapp',
        ],
      },
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
  }) as ExpoConfig;
