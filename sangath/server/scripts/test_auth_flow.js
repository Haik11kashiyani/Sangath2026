const API = 'http://localhost:5000/api';

(async () => {
  try {
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'SuperSecure123!' })
    });

    console.log('Login status:', loginRes.status);
    const cookieHeader = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
    console.log('Cookie header:', cookieHeader);
    console.log('Login body:', await loginRes.text());

    const refreshRes = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      }
    });
    console.log('Refresh status:', refreshRes.status);
    console.log('Refresh cookie header:', refreshRes.headers.get('set-cookie'));
    console.log('Refresh body:', await refreshRes.text());

    const logoutRes = await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      }
    });
    console.log('Logout status:', logoutRes.status);
    console.log('Logout body:', await logoutRes.text());
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
