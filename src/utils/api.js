/**
 * Central API Client for Sangath Global Exim
 * Connects frontend to Express + SQLite backend CRM
 */

const API_BASE = '/api';

/**
 * Get stored session token from sessionStorage
 */
function getAuthHeader() {
  const token = sessionStorage.getItem('sangath_admin_session_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Handle API responses cleanly
 */
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    console.error('API Error Response Data:', data);
    const errorMsg = data.details || data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

// --- AUTHENTICATION API ---

export async function loginApi(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await handleResponse(res);
  if (data.token) {
    sessionStorage.setItem('sangath_admin_session_token', data.token);
    sessionStorage.setItem('sangath_admin_username', data.user.username);
    sessionStorage.setItem('sangath_admin_role', data.user.role);
    sessionStorage.setItem('sangath_admin_permissions', JSON.stringify(data.user.permissions));
    sessionStorage.setItem('sangath_admin_session_expiry', String(Date.now() + 24 * 60 * 60 * 1000));
  }
  return data;
}

export async function getMeApi() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

export async function changePasswordApi(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return handleResponse(res);
}

// --- SITE CONTENT CMS API ---

export async function fetchContentApi() {
  const res = await fetch(`${API_BASE}/content`);
  return handleResponse(res);
}

export async function saveContentBulkApi(updates) {
  const res = await fetch(`${API_BASE}/content/bulk`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ updates })
  });
  return handleResponse(res);
}

// --- SITE IMAGES API ---

export async function fetchImagesApi() {
  const res = await fetch(`${API_BASE}/images`);
  return handleResponse(res);
}

export async function uploadSiteImageApi(page, section, imageKey, file) {
  const formData = new FormData();
  formData.append('page', page);
  formData.append('section', section);
  formData.append('image_key', imageKey);
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    headers: getAuthHeader(), // fetch automatically adds multipart/form-data content-type boundary
    body: formData
  });
  return handleResponse(res);
}

// --- CATEGORIES API ---

export async function fetchCategoriesApi() {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse(res);
}

export async function createCategoryApi(name, description = '', image = '') {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ name, description, image })
  });
  return handleResponse(res);
}

export async function updateCategoryApi(id, name, description = '', image = '') {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ name, description, image })
  });
  return handleResponse(res);
}

export async function deleteCategoryApi(id) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

// --- PRODUCTS API ---

export async function fetchProductsApi() {
  const res = await fetch(`${API_BASE}/products`);
  return handleResponse(res);
}

export async function createProductApi(productFormData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: productFormData // FormData object
  });
  return handleResponse(res);
}

export async function updateProductApi(id, productFormData) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: productFormData // FormData object
  });
  return handleResponse(res);
}

export async function deleteProductApi(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

// --- INQUIRIES API ---

export async function fetchInquiriesApi(page = 1, search = '') {
  const params = new URLSearchParams({ page, search });
  const res = await fetch(`${API_BASE}/inquiries?${params.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

export async function submitInquiryApi(inquiryData) {
  const res = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiryData)
  });
  return handleResponse(res);
}

export async function updateInquiryStatusApi(id, status) {
  const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
}

export async function deleteInquiryApi(id) {
  const res = await fetch(`${API_BASE}/inquiries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

export async function exportInquiriesCsvApi() {
  const res = await fetch(`${API_BASE}/inquiries/export/csv`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sangath_inquiries_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// --- MENU API ---

export async function fetchMenuApi() {
  const res = await fetch(`${API_BASE}/menu`);
  return handleResponse(res);
}

export async function createMenuItemApi(data) {
  const res = await fetch(`${API_BASE}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function updateMenuItemApi(id, data) {
  const res = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function reorderMenuApi(items) {
  const res = await fetch(`${API_BASE}/menu/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ items })
  });
  return handleResponse(res);
}

export async function deleteMenuItemApi(id) {
  const res = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

// --- ADMIN USERS API ---

export async function fetchAdminUsersApi() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
}

export async function createAdminUserApi(username, password, role, permissions = []) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ username, password, role, permissions })
  });
  return handleResponse(res);
}

export async function deleteAdminUserApi(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
}
