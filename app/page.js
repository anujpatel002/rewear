'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';

export default function Home() {
  const [approvedItems, setApprovedItems] = useState([]);
  const { socket } = useSocket() || {};

  useEffect(() => {
    const fetchApprovedItems = async () => {
      try {
        const res = await fetch('/api/item/approved');
        const data = await res.json();
        if (res.ok) {
          setApprovedItems(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch approved items:', error);
      }
    };

    fetchApprovedItems();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      (async () => {
        try {
          const res = await fetch('/api/item/approved');
          const data = await res.json();
          if (res.ok) setApprovedItems(data.items || []);
        } catch {}
      })();
    };
    socket.on('item:status', refresh);
    socket.on('item:updated', refresh);
    socket.on('item:created', refresh);
    socket.on('item:deleted', refresh);
    return () => {
      socket.off('item:status', refresh);
      socket.off('item:updated', refresh);
      socket.off('item:created', refresh);
      socket.off('item:deleted', refresh);
    };
  }, [socket]);

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center mb-16"
      >
        <motion.h2 className="text-4xl font-extrabold mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          Welcome to ReWear
        </motion.h2>
        <motion.p className="text-lg muted max-w-2xl mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Discover a sustainable way to refresh your wardrobe.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { href: '/pages/Browse', label: 'Start Swapping', className: 'bg-green-700' },
            { href: '/pages/Browse', label: 'Browse Items', className: 'bg-zinc-700' },
            { href: '/item/new', label: 'List an Item', className: 'bg-blue-600' },
          ].map((btn) => (
            <motion.div key={btn.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href={btn.href} className={`btn ${btn.label === 'Start Swapping' ? 'btn-primary' : 'btn-neutral'}`}>
                {btn.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Approved Items Grid */}
      <section>
        <h3 className="text-3xl font-semibold text-center mb-10">Browse Approved Items</h3>
        {approvedItems.length === 0 ? (
          <p className="text-center text-gray-600">No approved items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 * index }}
                className="card overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={item.imageUrl || '/images/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-xl font-semibold">{item.title}</h4>
                  <p className="text-sm muted mt-1">{item.description}</p>
                  <p className="text-sm muted mt-2">
                    <strong>Category:</strong> {item.category}
                  </p>
                  <motion.div whileHover={{ x: 2 }}>
                    <Link
                      href={`/pages/item/${item._id}`}
                      className="inline-block mt-4 text-accent text-sm font-medium hover:underline"
                    >
                      View Details →
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
