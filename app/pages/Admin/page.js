'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/utils/session';
import { toast, ToastContainer } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true); // 🔧 Use loading state
  const router = useRouter();
  const { socket } = useSocket() || {};

  useEffect(() => {
    const shouldReload = sessionStorage.getItem('adminRedirect') === 'true';
    const loadAdmin = async () => {
      const session = await fetchSession();

      console.log('Session:', session); // 🧪 Debug

      if (session?.email === "admin@gmail.com") {
        setAdmin(session);

         // Reload if flagged (once)
      if (shouldReload) {
        sessionStorage.removeItem('adminRedirect');
        window.location.reload(); // 🔄 Force refresh after navigation
        return; // ⛔ Prevent rest of logic from running now
      }

        await fetchPendingItems();
      } else {
        router.replace('/auth/login'); // 🔁 Use replace to prevent back button issues
      }

      setLoading(false);
    };

    loadAdmin();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onStatus = () => fetchPendingItems();
    const onCreated = () => fetchPendingItems();
    socket.on('item:status', onStatus);
    socket.on('item:updated', onStatus);
    socket.on('item:created', onCreated);
    socket.on('item:deleted', onStatus);
    return () => {
      socket.off('item:status', onStatus);
      socket.off('item:updated', onStatus);
      socket.off('item:created', onCreated);
      socket.off('item:deleted', onStatus);
    };
  }, [socket]);

  const fetchPendingItems = async () => {
    try {
      const res = await fetch('/api/item/pending');
      const data = await res.json();
      if (res.ok) {
        setPendingItems(data.items || []);
      } else {
        toast.error(data.error || 'Failed to load items');
      }
    } catch (err) {
      toast.error('Network error while fetching items');
    }
  };

  const handleApproval = async (itemId, approved) => {
    try {
      const res = await fetch(`/api/item/${approved ? 'approve' : 'reject'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Item ${approved ? 'approved' : 'rejected'} successfully`);
        fetchPendingItems();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Checking session...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-background">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Pending Approvals</h1>

      {pendingItems.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        <div className="grid gap-4">
          {pendingItems.map(item => (
            <div key={item._id} className="card p-4 flex gap-5 items-start">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div className="flex-grow">
                <h2 className="font-semibold text-lg">{item.title}</h2>
                <p className="text-sm muted">{item.description}</p>
                <p className="text-sm"><strong>Category:</strong> {item.category}</p>
                <p className="text-sm"><strong>Uploaded By:</strong> {item.uploadedBy?.email}</p>

                <div className="mt-3 flex gap-3">
                  <button onClick={() => handleApproval(item._id, true)} className="btn btn-primary px-4 py-1">
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(item._id, false)}
                    className="btn btn-ghost text-red-600 hover:text-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
