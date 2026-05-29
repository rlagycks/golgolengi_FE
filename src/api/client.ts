import { tokenStorage } from '../storage/tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export interface ApiError {
  error_code: string;
  message: string;
  detail?: string;
}

export class FhosApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error_code: string,
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = 'FhosApiError';
  }
}

let onAuthFailure: (() => void) | null = null;

export function setAuthFailureCallback(cb: () => void) {
  onAuthFailure = cb;
}

let refreshPromise: Promise<string> | null = null;

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as { message?: string; error_code?: string; detail?: string };
    throw new FhosApiError(
      res.status,
      errData.error_code ?? 'UNKNOWN',
      errData.message ?? '오류가 발생했습니다.',
      errData.detail,
    );
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const json = await res.json() as { success?: boolean; data?: T };
  return (json.data !== undefined ? json.data : json) as T;
}

async function refreshAccessToken(): Promise<string> {
  const [refreshToken, userId] = await Promise.all([
    tokenStorage.getRefreshToken(),
    tokenStorage.getUserId(),
  ]);

  if (!refreshToken || !userId) {
    await tokenStorage.clearTokens();
    onAuthFailure?.();
    throw new FhosApiError(401, 'NO_REFRESH_TOKEN', '로그인이 필요합니다.');
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await tokenStorage.clearTokens();
    onAuthFailure?.();
    throw new FhosApiError(401, 'REFRESH_FAILED', '세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const json = await res.json() as { success?: boolean; data?: { accessToken: string; refreshToken: string } };
  const data = json.data ?? (json as unknown as { accessToken: string; refreshToken: string });
  await tokenStorage.saveTokens(data.accessToken, data.refreshToken, userId);
  return data.accessToken;
}

export async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
    }

    let newToken: string;
    try {
      newToken = await refreshPromise;
    } catch (err) {
      throw err;
    }

    const retryRes = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(retryRes);
  }

  return parseResponse<T>(res);
}
