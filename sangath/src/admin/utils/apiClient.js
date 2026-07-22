import { API_URL } from '../../config/runtime.js';

async function tryRefresh() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      return data.token;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export const apiClient = {
  async request(endpoint, options = {}) {
    let token = localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (response.status === 401) {
      const newToken = await tryRefresh();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        const retry = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include'
        });
        if (!retry.ok) {
          const errorData = await retry.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${retry.statusText}`);
        }
        return retry.json();
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};
