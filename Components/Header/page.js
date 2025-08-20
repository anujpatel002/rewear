'use client';
import Link from 'next/link'; // ✅ make sure this line is included
import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


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
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link href="/" className="text-2xl font-bold text-primary">ReWear</Link>
        </motion.div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          {[
            { href: '/', label: 'Home' },
            { href: '/pages/Browse', label: 'Browse' },
            { href: '/pages/NewItem', label: 'List an Item' },
          ].map((item) => (
            <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href={item.href} className="hover:text-primary">{item.label}</Link>
            </motion.div>
          ))}
          {user && (
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href="/pages/Dashboard" className="hover:text-primary">Dashboard</Link>
            </motion.div>
          )}
          {user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold bg-primary text-primary-foreground"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </motion.button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-32 z-10"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href="/auth/login" className="hover:text-primary">Login / Signup</Link>
            </motion.div>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <motion.button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} whileTap={{ scale: 0.9 }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-4 pb-4 space-y-2 bg-surface border-t border-border overflow-hidden"
          >
            <Link href="/" className="block hover:text-primary">Home</Link>
            <Link href="/pages/Browse" className="block hover:text-primary">Browse</Link>
            <Link href="/pages/NewItem" className="block hover:text-primary">List an Item</Link>
            {user && (
              <Link href="/pages/Dashboard" className="block hover:text-primary">Dashboard</Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="block text-left w-full hover:text-red-500"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/login" className="block hover:text-primary">Login / Signup</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
