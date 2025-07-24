export async function fetchSession() {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data.user || null;
    }

    return null;
  } catch (err) {
    console.error('Error fetching session:', err);
    return null;
  }
}
