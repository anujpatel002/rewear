'use client';
import Link from 'next/link'; // ✅ make sure this line is included
import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';


export default function Header() {
  const router = useRouter();
  const { user, setUser, refreshSession } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen , setDropdownOpen] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch('/api/user/verify');
        const data = await res.json();

        if (!data.valid) {
          // User session is invalid
          await fetch('/api/auth/logout', { method: 'POST' });
          refreshSession(); // Clear client-side session too
          router.replace('/auth/login');
        }
      } catch (err) {
        console.error('Verify failed:', err);
      }
    };

    if (user) {
      verifyUser();
    }
  }, [user]);


  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    refreshSession();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-emerald-600">ReWear</Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <Link href="/pages/Browse" className="hover:text-emerald-600">Browse</Link>
          <Link href="/pages/NewItem" className="hover:text-emerald-600">List an Item</Link>
          {user && (
            <Link href="/pages/Dashboard" className="hover:text-emerald-600">Dashboard</Link>
          )}
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

        {/* Mobile Hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white border-t">
          <Link href="/" className="block hover:text-emerald-600">Home</Link>
          <Link href="/pages/Browse" className="block hover:text-emerald-600">Browse</Link>
          <Link href="/pages/NewItem" className="block hover:text-emerald-600">List an Item</Link>
          {user && (
            <Link href="/pages/Dashboard" className="block hover:text-emerald-600">Dashboard</Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="block text-left w-full hover:text-red-500"
            >
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="block hover:text-emerald-600">Login / Signup</Link>
          )}
        </div>
      )}
    </header>
  );
}
