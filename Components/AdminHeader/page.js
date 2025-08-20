'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    <header className="bg-surface border-b border-border py-4 px-6 flex justify-between items-center">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
        <Link href="/pages/Admin" className="text-xl font-bold text-primary">ReWear</Link>
      </motion.div>
      <nav className="flex items-center space-x-4">
        {[
          { href: '/pages/Admin', label: 'Home' },
          { href: '/pages/History', label: 'History' },
          { href: '/pages/AdminUserPannel', label: 'Users' },
          { href: '/pages/Items', label: 'Items' },
        ].map((item) => (
          <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link href={item.href} className="hover:text-primary">{item.label}</Link>
          </motion.div>
        ))}

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
            <Link href="/auth/login" className="hover:text-emerald-600">Login / Signup</Link>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
