import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { env } from '@/shared/config/env';
import type { ApiEnvelope } from './ApiEnvelope.types';
import { toApiError } from './ApiError';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    return Promise.reject(toApiError(error));
  }
);

export async function getJson<T>(path: string, options?: { signal?: AbortSignal }): Promise<T> {
  const response = await apiClient.get<ApiEnvelope<T>>(path, {
    signal: options?.signal,
  });
  return response.data.data;
}
