import { isAxiosError } from 'axios';

export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (!error.response) return 'No se pudo conectar al servidor. Comprueba que la API esté iniciada.';
    return `No se pudo completar la consulta (${error.response.status}).`;
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
