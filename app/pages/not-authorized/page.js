'use client';

import Link from 'next/link';

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="space-y-2">
          <Link 
            href="/pages/Dashboard" 
            className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/auth/login" 
            className="block w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Login as Different User
          </Link>
        </div>
      </div>
    </div>
  );
} 