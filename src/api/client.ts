import { API_BASE_URL } from '../config/env';
import { ApiEnvelope } from './types';

export class ApiError extends Error {
  code: string;
  details?: { field: string; reason: string }[];

  constructor(code: string, message: string, details?: { field: string; reason: string }[]) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  const body: ApiEnvelope<T> = await res.json();
  if (!body.success || !body.data) {
    throw new ApiError(body.error?.code ?? 'UNKNOWN', body.error?.message ?? `Request failed (${res.status})`, body.error?.details);
  }
  return body.data;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>,
  headers?: Record<string, string>
): Promise<T> {
  const query = params
    ? Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&')
    : '';
  const url = `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url, headers ? { headers } : undefined);
  return unwrap<T>(res);
}

export async function apiPostJson<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return unwrap<T>(res);
}

export async function apiPostMultipart<T>(
  path: string,
  query: Record<string, string>,
  form: FormData,
  headers?: Record<string, string>
): Promise<T> {
  const qs = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const res = await fetch(`${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`, {
    method: 'POST',
    headers,
    body: form,
  });
  return unwrap<T>(res);
}
