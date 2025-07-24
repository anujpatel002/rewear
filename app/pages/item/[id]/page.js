'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/item/${id}`);
        const data = await res.json();
        if (res.ok) {
          setItem(data.item);
        } else {
          console.error(data.error || 'Item not found');
        }
      } catch (err) {
        console.error('Failed to fetch item:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading item details...</div>;

  if (!item) {
    return (
      <div className="text-center mt-20 text-red-500">
        Item not found or has been removed.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <img
        src={item.imageUrl || '/images/placeholder.jpg'}
        alt={item.title}
        className="w-full h-96 object-cover rounded"
      />
      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <p><strong>Category:</strong> {item.category}</p>
        <p><strong>Condition:</strong> {item.condition}</p>
        <p><strong>Size:</strong> {item.size}</p>

        {/* Tags */}
        {item.tags && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700">Tags:</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {item.tags.split(',').map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Points */}
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700">Points Required:</h3>
          <p className="text-green-600 font-bold">{item.points || 0} Points</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => alert('Swap request initiated!')}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
          >
            Swap Item
          </button>
          <button
            onClick={() => alert('Purchase with points feature coming soon!')}
            className="bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700"
          >
            Buy with Points
          </button>
        </div>

        <div className="mt-6">
          <Link href="/pages/Browse" className="text-blue-500 hover:underline">
            ← Back to Browse
          </Link>
        </div>
      </div>
    </div>
  );
}
