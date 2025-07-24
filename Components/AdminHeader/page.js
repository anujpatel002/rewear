'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from '@/context/SessionContext';

export default function Header() {
  const { user, refreshSession } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    refreshSession();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link href="/pages/Admin" className="text-xl font-bold text-emerald-600">ReWear</Link>
      <nav className="flex items-center space-x-4">
        <Link href="/pages/Admin" className="hover:text-emerald-600">Home</Link>
        <Link href="/pages/History" className="hover:text-emerald-600">History</Link>
        <Link href="/pages/AdminUserPannel" className="hover:text-emerald-600">Users</Link>
        <Link href="/pages/Items" className="hover:text-emerald-600">Items</Link>
        

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-lg font-bold"
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-32 z-10">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="hover:text-emerald-600">Login / Signup</Link>
        )}
      </nav>
    </header>
  );
}
