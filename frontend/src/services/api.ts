import axios from 'axios';
import { validateApiResponse } from './validation';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(response => {
  validateApiResponse(response.config.url ?? '', response.data);
  return response;
});

export default api;
