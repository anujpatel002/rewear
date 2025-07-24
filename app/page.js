'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [approvedItems, setApprovedItems] = useState([]);

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

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to ReWear</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Discover a sustainable way to refresh your wardrobe.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/pages/Browse" className="bg-green-700 text-white px-6 py-3 rounded-lg">Start Swapping</Link>
          <Link href="/pages/Browse" className="bg-zinc-700 text-white px-6 py-3 rounded-lg">Browse Items</Link>
          <Link href="/item/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg">List an Item</Link>
        </div>
      </section>

      {/* Approved Items Grid */}
      <section>
        <h3 className="text-3xl font-semibold text-center mb-10">Browse Approved Items</h3>
        {approvedItems.length === 0 ? (
          <p className="text-center text-gray-600">No approved items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedItems.map((item) => (
              <div key={item._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
                <img
                  src={item.imageUrl || '/images/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-xl font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Category:</strong> {item.category}
                  </p>
                  <Link
                    href={`/pages/item/${item._id}`}
                    className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
