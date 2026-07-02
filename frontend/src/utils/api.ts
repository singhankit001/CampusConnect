const API_BASE_URL = 'http://localhost:5050/api';

export interface ApiError {
  error: string;
}

export async function apiCall<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const token = localStorage.getItem('cc_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errMsg = typeof errJson.error === 'string' ? errJson.error : (errJson.error.message || errJson.message || errMsg);
      } else if (errJson.message) {
        errMsg = errJson.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  // Handle delete or empty responses
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json() as T;
  } catch (err) {
    return {} as T;
  }
}
