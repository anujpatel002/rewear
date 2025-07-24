'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSession } from '@/utils/session';
import { useSession } from '@/context/SessionContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshSession } = useSession(); // ✅ Correct usage inside the component

  // Check session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const sessionUser = await fetchSession();
        if (isMounted && sessionUser) {
          if (sessionUser.email === 'admin@gmail.com') {
            router.push('/pages/Admin');
          } else {
            router.push('/');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const rawText = await response.text();
        console.error('Non-JSON response:', rawText);
        throw new Error('Invalid server response');
      }

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      toast.success(data.message || 'Login successful');
      await refreshSession(); // ✅ Refresh session context

      // Optional reload for admin panel
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          sessionStorage.setItem('adminRedirect', 'true');
          router.push('/pages/Admin');
        } else {
          router.push('/');
        }
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Log In to ReWear</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded"
              required
            />
          </div>

          <div className="flex justify-between text-sm mt-1">
            <Link href="/auth/forgot-password" className="text-emerald-600 hover:underline">
              Forgot password?
            </Link>
            <Link href="/auth/signup" className="text-emerald-600 hover:underline">
              Not registered? Sign up
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 text-white py-2 rounded ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
