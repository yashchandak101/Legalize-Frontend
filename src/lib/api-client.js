import { API_BASE_URL } from './constants';
import { getToken } from './auth';

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || error.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function apiGet(url) {
  return apiFetch(url, { method: 'GET' });
}

export function apiPost(url, data) {
  return apiFetch(url, { method: 'POST', body: JSON.stringify(data) });
}

export function apiPut(url, data) {
  return apiFetch(url, { method: 'PUT', body: JSON.stringify(data) });
}

export function apiDelete(url) {
  return apiFetch(url, { method: 'DELETE' });
}
