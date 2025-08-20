'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
// Add eye icon
import { Eye, EyeOff } from 'lucide-react';

// Spinner component
function Spinner() {
  return (
    <span className="inline-block align-middle animate-spin rounded-full border-2 border-t-primary border-border h-5 w-5 mr-2" role="status" aria-label="Loading"></span>
  );
}

export default function ForgotPassword() {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!token) {
        // Request reset email
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send reset email');
        }
        setSuccess(data.message);
        setFormData({ email: '', password: '', confirmPassword: '' });
      } else {
        // Reset password
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: formData.password, confirmPassword: formData.confirmPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Password reset failed');
        }
        setSuccess(data.message);
        setFormData({ email: '', password: '', confirmPassword: '' });
        setTimeout(() => router.push('/auth/login'), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 card transition hover:shadow-md">
        <h1 className="text-3xl font-extrabold font-sans text-center mb-6">
          {token ? 'Reset Password' : 'Forgot Password'}
        </h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-primary text-sm mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!token && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}
          {token && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all duration-200"
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
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirmPassword}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-full ${showConfirmPassword ? 'scale-110' : 'scale-100'} opacity-80 hover:opacity-100`}
                    onClick={() => setShowConfirmPassword(v => !v)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(v => !v); }}
                  >
                    <span aria-hidden="true" className={`inline-block transition-opacity duration-200 ${showConfirmPassword ? 'opacity-100' : 'opacity-80'}`}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
                    <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? <><Spinner /> {token ? 'Resetting...' : 'Sending...'} </> : (token ? 'Reset Password' : 'Send Reset Email')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm muted">
          Back to{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}