import appJson from './app.json';
import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default (): ExpoConfig =>
  ({
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...appJson.expo.ios,
      config: {
        googleMapsApiKey,
      },
    },
  }) as ExpoConfig;
