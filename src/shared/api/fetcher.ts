import { getJson } from './client';

export function fetcher<T>(path: string): Promise<T> {
  return getJson<T>(path);
}
