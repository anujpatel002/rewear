export async function fetchSession() {
  try {
    // Prefer server-verified, up-to-date user details
    const res = await fetch('/api/user/verify', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data?.valid && data?.user) return data.user;
    return null;
  } catch (err) {
    console.error('Error fetching session:', err);
    return null;
  }
}
