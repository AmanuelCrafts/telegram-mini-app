export class ApiClientError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

/**
 * Robust fetch wrapper that automatically includes HTTP-only session cookies
 * and standardizes error handling.
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...customOptions } = options;

  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (data !== undefined) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...customOptions,
    // CRITICAL: Always include credentials so HTTP-only session cookies are sent/received
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (isJson && payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : null) ||
      (isJson && payload && typeof payload === 'object' && 'error' in payload
        ? String(payload.error)
        : null) ||
      `HTTP Error ${response.status}: ${response.statusText}`;

    throw new ApiClientError(errorMessage, response.status, payload);
  }

  return payload as T;
}
