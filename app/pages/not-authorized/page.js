'use client';

import Link from 'next/link';

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 card text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="muted mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="space-y-2">
          <Link href="/pages/Dashboard" className="block w-full btn btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/auth/login" className="block w-full btn btn-ghost">
            Login as Different User
          </Link>
        </div>
      </div>
    </div>
  );
} 