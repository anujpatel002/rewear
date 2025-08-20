// File: app/browse/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSession } from '@/utils/session';
import { useSocket } from '@/context/SocketContext';
import Skeleton from '@/Components/ui/Skeleton';

export default function BrowsePage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { socket } = useSocket() || {};

  useEffect(() => {
    const fetchItems = async () => {
      const session = await fetchSession();
      setCurrentUser(session);

      const res = await fetch('/api/item/approved');
      const data = await res.json();

      if (res.ok) {
        const otherUserItems = data.items.filter(
          item => item.uploadedBy?.email !== session?.email
        );
        setItems(otherUserItems);
        setFilteredItems(otherUserItems);

        const uniqueCategories = [...new Set(otherUserItems.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      // re-run initial fetch
      (async () => {
        const session = await fetchSession();
        setCurrentUser(session);
        const res = await fetch('/api/item/approved');
        const data = await res.json();
        if (res.ok) {
          const otherUserItems = data.items.filter(
            item => item.uploadedBy?.email !== session?.email
          );
          setItems(otherUserItems);
          setFilteredItems(otherUserItems);
          const uniqueCategories = [...new Set(otherUserItems.map(item => item.category))];
          setCategories(uniqueCategories);
        }
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

  useEffect(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-3xl font-bold text-center mb-6">Browse Items</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-border rounded px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border border-border rounded px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.length === 0 && (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="w-full h-48 rounded" />
              <Skeleton className="h-5 w-2/3 mt-3" />
              <Skeleton className="h-4 w-full mt-2" />
            </div>
          ))
        )}
        {filteredItems.map(item => (
          <div key={item._id} className="card p-4 transition hover:shadow-md">
            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded" />
            <h2 className="text-lg font-semibold mt-2">{item.title}</h2>
            <p className="text-sm muted">{item.description}</p>
            <p className="text-xs muted">Category: {item.category} • {item.points || 0} pts</p>

            <div className="mt-3 flex justify-between items-center">
              <Link
                href={`/pages/item/${item._id}`}
                className="text-accent hover:underline text-sm"
              >
                View Details
              </Link>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded">
                {item.points} pts
              </span>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center col-span-full muted">No items found.</p>
        )}
      </div>
    </div>
  );
}
