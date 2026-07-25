import { API_URL } from '../../config/runtime.js';

// Prevent concurrent refresh attempts
let refreshPromise = null;

async function tryRefresh() {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;
  
  refreshPromise = (async () => {
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
    } finally {
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

// Session timeout - auto logout after inactivity
let lastActivity = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function checkSessionTimeout() {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.reload();
    return true;
  }
  lastActivity = Date.now();
  return false;
}

// Input sanitizer - strip dangerous HTML
function sanitizeInput(data) {
  if (typeof data === 'string') {
    return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  if (data && typeof data === 'object') {
    const sanitized = Array.isArray(data) ? [] : {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return data;
}

export const apiClient = {
  async request(endpoint, options = {}) {
    if (checkSessionTimeout()) {
      throw new Error('Session expired. Please log in again.');
    }

    let token = localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
        // Token refresh failed - force logout
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.reload();
        throw new Error('Session expired');
      }

      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action');
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(sanitizeInput(data)),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(sanitizeInput(data)),
    });
  },

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(sanitizeInput(data)),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};
