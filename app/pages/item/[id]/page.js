'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchSession } from '@/utils/session';

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swapStatus, setSwapStatus] = useState(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [hasPendingSwap, setHasPendingSwap] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

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

  useEffect(() => {
    fetchSession().then(setSessionUser);
  }, []);

  useEffect(() => {
    const checkPendingSwap = async () => {
      if (!sessionUser || !item || !item._id) return;
      try {
        const res = await fetch('/api/item/user');
        const data = await res.json();
        if (res.ok && data.swapsAsRequester) {
          const foundPending = data.swapsAsRequester.find(
            swap => swap.item && swap.item._id === item._id && swap.status === 'pending'
          );
          setHasPendingSwap(!!foundPending);
          const foundApproved = data.swapsAsRequester.find(
            swap => swap.item && swap.item._id === item._id && swap.status === 'approved'
          );
          setIsSwapped(!!foundApproved);
        }
      } catch {}
    };
    checkPendingSwap();
  }, [sessionUser, item]);

  const handleSwap = async () => {
    setSwapLoading(true);
    setSwapStatus(null);
    try {
      const res = await fetch(`/api/item/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSwapStatus('Swap request sent!');
      } else {
        setSwapStatus(data.error || 'Swap failed');
      }
    } catch (err) {
      setSwapStatus('Swap failed');
    } finally {
      setSwapLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading item details...</div>;

  if (!item) {
    return (
      <div className="text-center mt-20 text-red-500">
        Item not found or has been removed.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 card mt-10 transition hover:shadow-md">
      <img
        src={item.imageUrl || '/images/placeholder.jpg'}
        alt={item.title}
        className="w-full h-96 object-cover rounded"
      />
      <div className="mt-6">
        <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
        <p className="muted mb-4">{item.description}</p>
        <p><strong>Category:</strong> {item.category}</p>
        <p><strong>Condition:</strong> {item.condition}</p>
        <p><strong>Size:</strong> {item.size}</p>

        {/* Tags */}
        {item.tags && (
          <div className="mt-4">
            <h3 className="font-semibold">Tags:</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {item.tags.split(',').map((tag, index) => (
                <span key={index} className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-sm">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Points */}
        <div className="mt-4">
          <h3 className="font-semibold">Points Required:</h3>
          <p className="text-emerald-600 font-bold">{item.points || 0} Points</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSwap}
            disabled={swapLoading || hasPendingSwap || isSwapped || (sessionUser && item.uploadedBy && sessionUser.email === item.uploadedBy.email)}
            className={`btn btn-primary ${swapLoading || hasPendingSwap || isSwapped ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSwapped ? 'Not Available' : swapLoading ? 'Requesting...' : hasPendingSwap ? 'Already Requested' : `Swap for ${item.points || 0} pts`}
          </button>
          <button
            onClick={() => alert('Purchase with points feature coming soon!')}
            disabled={isSwapped}
            className={`btn btn-neutral ${isSwapped ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Buy with Points
          </button>
        </div>
        {isSwapped && <div className="mt-2 text-sm text-red-600">This item is no longer available for swap or purchase.</div>}
        {hasPendingSwap && !isSwapped && <div className="mt-2 text-sm text-red-600">You already sent a swap request for this item.</div>}
        {swapStatus && <div className="mt-2 text-sm text-blue-600">{swapStatus}</div>}

        <div className="mt-6">
          <Link href="/pages/Browse" className="text-accent hover:underline">
            ← Back to Browse
          </Link>
        </div>
      </div>
    </div>
  );
}
