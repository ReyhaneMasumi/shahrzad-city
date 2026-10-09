import axios from 'axios';

export class ApiError extends Error {
  status?: number;
  code?: string;
  cause?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; cause?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.cause = options?.cause;
  }
}

function isAbortError(error: unknown): boolean {
  const err = error as { name?: string; code?: string } | null | undefined;
  return err?.name === 'AbortError' || err?.code === 'ERR_CANCELED';
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as { message?: string; error?: string } | undefined;
    const message = responseData?.message ?? responseData?.error ?? error.message;
    return new ApiError(message, {
      status,
      code: error.code,
      cause: error,
    });
  }

  if (isAbortError(error)) {
    return new ApiError('Request aborted', { code: 'ABORTED', cause: error });
  }

  return new ApiError('Unexpected error', { cause: error });
}
