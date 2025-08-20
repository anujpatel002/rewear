'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSession } from '@/utils/session';
import { useSession } from '@/context/SessionContext';
// Add eye icon
import { Eye, EyeOff } from 'lucide-react';

// Spinner component
function Spinner() {
  return (
    <span className="inline-block align-middle animate-spin rounded-full border-2 border-t-primary border-border h-5 w-5 mr-2" role="status" aria-label="Loading"></span>
  );
}

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshSession } = useSession(); // ✅ Correct usage inside the component
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-md w-full p-8 card transition hover:shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Log In to ReWear</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-border rounded pr-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="button"
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-full ${showPassword ? 'scale-110' : 'scale-100'} opacity-80 hover:opacity-100`}
                onClick={() => setShowPassword(v => !v)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
              >
                <span aria-hidden="true" className={`inline-block transition-opacity duration-200 ${showPassword ? 'opacity-100' : 'opacity-80'}`}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between text-sm mt-1">
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <Link href="/auth/signup" className="text-primary hover:underline">
              Not registered? Sign up
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full mt-4`}
          >
            {loading ? <><Spinner /> Logging in...</> : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
