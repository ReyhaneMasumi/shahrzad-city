import { describe, expect, it } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { ApiError, toApiError } from '@/shared/api/ApiError';

function axiosFailure(options: {
  message?: string;
  code?: string;
  status?: number;
  data?: { message?: string; error?: string };
}): AxiosError {
  const response = options.status
    ? ({ status: options.status, data: options.data } as unknown as AxiosResponse)
    : undefined;
  return new AxiosError(
    options.message ?? 'Request failed',
    options.code,
    undefined,
    undefined,
    response
  );
}

describe('ApiError', () => {
  it('carries optional status, code and cause', () => {
    const cause = new Error('root');
    const error = new ApiError('boom', { status: 500, code: 'E', cause });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('boom');
    expect(error.status).toBe(500);
    expect(error.code).toBe('E');
    expect(error.cause).toBe(cause);
  });

  it('leaves fields undefined when no options are given', () => {
    const error = new ApiError('bare');

    expect(error.status).toBeUndefined();
    expect(error.code).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });
});

describe('toApiError', () => {
  it('prefers the response message and keeps status and code', () => {
    const err = axiosFailure({
      message: 'fallback',
      code: 'ERR_BAD_RESPONSE',
      status: 500,
      data: { message: 'Server said no' },
    });

    const result = toApiError(err);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('Server said no');
    expect(result.status).toBe(500);
    expect(result.code).toBe('ERR_BAD_RESPONSE');
    expect(result.cause).toBe(err);
  });

  it('falls back to the response error field', () => {
    const result = toApiError(axiosFailure({ status: 400, data: { error: 'Bad request' } }));

    expect(result.message).toBe('Bad request');
  });

  it('falls back to the axios message when the response has no payload message', () => {
    const result = toApiError(axiosFailure({ message: 'Network Error' }));

    expect(result.message).toBe('Network Error');
    expect(result.status).toBeUndefined();
  });

  it('maps an AbortError to an ABORTED ApiError', () => {
    const err = Object.assign(new Error('aborted'), { name: 'AbortError' });

    const result = toApiError(err);

    expect(result.message).toBe('Request aborted');
    expect(result.code).toBe('ABORTED');
    expect(result.cause).toBe(err);
  });

  it('maps a canceled request code to an ABORTED ApiError', () => {
    const err = Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' });

    const result = toApiError(err);

    expect(result.message).toBe('Request aborted');
    expect(result.code).toBe('ABORTED');
  });

  it('wraps any other error as an unexpected error', () => {
    const err = new Error('nope');

    const result = toApiError(err);

    expect(result.message).toBe('Unexpected error');
    expect(result.cause).toBe(err);
  });

  it('handles a nullish error as unexpected', () => {
    expect(toApiError(undefined).message).toBe('Unexpected error');
  });
});
