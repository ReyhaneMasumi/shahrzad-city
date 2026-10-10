import type { ApiEnvelope } from './ApiEnvelope.types';

export function mockEnvelope<T>(data: T): ApiEnvelope<T> {
  return { statusCode: 200, message: 'OK', data };
}
