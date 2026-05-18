import { tokenStorage } from '../storage/tokenStorage';

const BASE_URL = 'https://api.fhos.app/v1';

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

let isRefreshing = false;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) throw new FhosApiError(401, 'NO_REFRESH_TOKEN', '로그인이 필요합니다.');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    await tokenStorage.clearTokens();
    throw new FhosApiError(401, 'REFRESH_FAILED', '세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const data = await res.json() as { access_token: string; refresh_token: string };
  const userId = await tokenStorage.getUserId() ?? '';
  await tokenStorage.saveTokens(data.access_token, data.refresh_token, userId);
  return data.access_token;
}

export async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      const retryRes = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({})) as Partial<ApiError>;
        throw new FhosApiError(retryRes.status, errData.error_code ?? 'UNKNOWN', errData.message ?? '오류가 발생했습니다.', errData.detail);
      }

      return retryRes.json() as Promise<T>;
    } catch (err) {
      isRefreshing = false;
      throw err;
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as Partial<ApiError>;
    throw new FhosApiError(res.status, errData.error_code ?? 'UNKNOWN', errData.message ?? '오류가 발생했습니다.', errData.detail);
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}
