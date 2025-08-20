'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/utils/session';

export default function AdminHistoryPage() {
  const [approvedItems, setApprovedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Extract unique categories for filter dropdown
  const allCategories = useMemo(() => {
    const cats = new Set([
      ...approvedItems.map(i => i.category),
      ...rejectedItems.map(i => i.category),
    ]);
    return Array.from(cats).filter(Boolean);
  }, [approvedItems, rejectedItems]);

  // Filter logic
  const filterFn = (item) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(searchLower) ||
      item.uploadedBy?.email?.toLowerCase().includes(searchLower) ||
      item.uploadedBy?.name?.toLowerCase().includes(searchLower);
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  };
  const filteredApproved = approvedItems.filter(filterFn);
  const filteredRejected = rejectedItems.filter(filterFn);

  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (!session || session.email !== 'admin@gmail.com') {
        router.replace('/auth/login');
        return;
      }
      try {
        const [approvedRes, rejectedRes] = await Promise.all([
          fetch('/api/item/approved'),
          fetch('/api/item/rejected'),
        ]);
        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();
        setApprovedItems(approvedData.items || []);
        setRejectedItems(rejectedData.items || []);
      } catch (err) {
        setApprovedItems([]);
        setRejectedItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading history...</div>;

  return (
    <div className="p-8 min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-6">Admin History</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search by item, email, or user name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-border px-3 py-2 rounded w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border border-border px-3 py-2 rounded w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Approved Items <span className="text-base muted">({filteredApproved.length})</span>
          </h2>
          {filteredApproved.length === 0 ? (
            <p className="muted">No approved items.</p>
          ) : (
            <ul className="space-y-4">
              {filteredApproved.map(item => (
                <li key={item._id} className="card p-4 flex gap-4 items-center transition hover:shadow-md">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm muted">{item.description}</p>
                    <p className="text-xs muted">Category: {item.category}</p>
                    <p className="text-xs muted">Uploaded By: {item.uploadedBy?.email || 'N/A'} {item.uploadedBy?.name ? `(${item.uploadedBy.name})` : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-red-700">
            Rejected Items <span className="text-base muted">({filteredRejected.length})</span>
          </h2>
          {filteredRejected.length === 0 ? (
            <p className="muted">No rejected items.</p>
          ) : (
            <ul className="space-y-4">
              {filteredRejected.map(item => (
                <li key={item._id} className="card p-4 flex gap-4 items-center transition hover:shadow-md">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm muted">{item.description}</p>
                    <p className="text-xs muted">Category: {item.category}</p>
                    <p className="text-xs muted">Uploaded By: {item.uploadedBy?.email || 'N/A'} {item.uploadedBy?.name ? `(${item.uploadedBy.name})` : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
