import Constants from 'expo-constants';

function getExpoDevHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost,
  ];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate.split(':')[0];
    }
  }

  return null;
}

export function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured;
  }

  const expoHost = getExpoDevHost();
  if (expoHost) {
    return `http://${expoHost}:8000/api/v1`;
  }

  return configured ?? 'http://localhost:8000/api/v1';
}
