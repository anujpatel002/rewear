'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { fetchSession } from '@/utils/session';
import 'react-toastify/dist/ReactToastify.css';
// Add eye icon
import { Eye, EyeOff } from 'lucide-react';

// Spinner component
function Spinner() {
  return (
    <span className="inline-block align-middle animate-spin rounded-full border-2 border-t-emerald-500 border-gray-300 h-5 w-5 mr-2" role="status" aria-label="Loading"></span>
  );
}

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const sessionUser = await fetchSession();
      if (sessionUser) {
        if (sessionUser.email === 'admin@gmail.com') {
          router.push('/pages/Admin');
        } else {
          router.push('/');
        }
      }
    }
    checkSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        toast.error('Unexpected server response. Please try again.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        toast.error(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      toast.success(data.message);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });

      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent backdrop-blur-md">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-900 font-sans text-center mb-6">
          Sign Up for ReWear
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 pr-10 transition-all duration-200"
                required
              />
              <button
                type="button"
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full ${showPassword ? 'scale-110' : 'scale-100'} opacity-80 hover:opacity-100`}
                onClick={() => setShowPassword(v => !v)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
              >
                <span aria-hidden="true" className={`inline-block transition-opacity duration-200 ${showPassword ? 'opacity-100' : 'opacity-80'}`}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 pr-10 transition-all duration-200"
                required
              />
              <button
                type="button"
                tabIndex={0}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirmPassword}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full ${showConfirmPassword ? 'scale-110' : 'scale-100'} opacity-80 hover:opacity-100`}
                onClick={() => setShowConfirmPassword(v => !v)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(v => !v); }}
              >
                <span aria-hidden="true" className={`inline-block transition-opacity duration-200 ${showConfirmPassword ? 'opacity-100' : 'opacity-80'}`}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
                <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-base font-medium text-gray-900 bg-gradient-to-r from-primary to-emerald-500 hover:text-white rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? <><Spinner /> Signing up...</> : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary hover:bg-gradient-to-r hover:from-primary hover:to-emerald-500 hover:text-white px-1 py-1 rounded transition-all duration-300"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
