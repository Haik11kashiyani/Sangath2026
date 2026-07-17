const API = 'http://localhost:5000/api';

(async () => {
  try {
    // Login
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'SuperSecure123!' })
    });
    console.log('Login status', loginRes.status);
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('set-cookie header:', setCookie);
    const cookieHeader = setCookie ? setCookie.split(';')[0] : '';
    const body = await loginRes.text();
    console.log('Login body:', body);

    // Call refresh with cookie
    const refreshRes = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    });
    console.log('Refresh status', refreshRes.status);
    console.log('Refresh headers set-cookie', refreshRes.headers.get('set-cookie'));
    console.log('Refresh body', await refreshRes.text());
  } catch (err) {
    console.error('ERROR', err);
  }
})();
