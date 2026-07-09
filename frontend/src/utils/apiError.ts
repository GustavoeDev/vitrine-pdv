import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro. Tente novamente.'): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Reinicie a API com "uv run python manage.py runserver" (ela deve iniciar em http://0.0.0.0:8000/) e confirme que o celular está na mesma rede Wi-Fi.';
    }

    const data = error.response.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;

      if (typeof record.detail === 'string') {
        return record.detail;
      }

      const firstFieldError = Object.values(record).find((value) => Array.isArray(value) && value.length > 0);
      if (Array.isArray(firstFieldError) && typeof firstFieldError[0] === 'string') {
        return firstFieldError[0];
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
