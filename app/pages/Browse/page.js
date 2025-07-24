// File: app/browse/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSession } from '@/utils/session';

export default function BrowsePage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">Browse Items</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full sm:w-64"
        />

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border rounded px-4 py-2 w-full sm:w-64"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item._id} className="bg-white rounded shadow p-4">
            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded" />
            <h2 className="text-lg font-semibold mt-2">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-xs text-gray-500">Category: {item.category}</p>

            <div className="mt-3 flex justify-between items-center">
              <Link
                href={`/pages/item/${item._id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Details
              </Link>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                {item.points} pts
              </span>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center col-span-full text-gray-600">No items found.</p>
        )}
      </div>
    </div>
  );
}
