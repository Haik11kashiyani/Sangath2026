const isProduction = import.meta.env.PROD;

const normalizeUrl = (value, fallback) => {
  const candidate = (value || fallback || '').trim();
  return candidate || fallback;
};

export const API_URL = normalizeUrl(
  import.meta.env.VITE_API_URL,
  isProduction ? '/api' : 'http://localhost:5000/api'
);

export const ADMIN_URL = normalizeUrl(
  import.meta.env.VITE_ADMIN_URL,
  isProduction ? '/admin' : 'http://localhost:3001'
);

export const SUPABASE_URL = normalizeUrl(
  import.meta.env.VITE_SUPABASE_URL,
  ''
);

export const SUPABASE_ANON_KEY = normalizeUrl(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  ''
);
