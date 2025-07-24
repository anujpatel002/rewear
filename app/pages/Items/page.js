'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/utils/session';
import { Country, State, City } from 'country-state-city';
import { useSession } from '@/context/SessionContext';

export default function AdminItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', category: '', imageUrl: '', email: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', imageUrl: '' });
  const router = useRouter();
  const { refreshSession } = useSession();

  useEffect(() => {
    const load = async () => {
      const session = await fetchSession();
      if (!session || session.email !== 'admin@gmail.com') {
        router.replace('/auth/login');
        return;
      }
      await fetchItems();
    };
    load();
  }, [router]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/item/approved');
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Unique categories for filter
  const allCategories = useMemo(() => Array.from(new Set(items.map(i => i.category))).filter(Boolean), [items]);

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
  const filteredItems = items.filter(filterFn);

  // Add product handler
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/item/insertAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm }),
      });
      if (res.ok) {
        setShowAdd(false);
        setAddForm({ title: '', description: '', category: '', imageUrl: '', email: '' });
        await fetchItems();
      }
    } catch {}
  };

  // Edit product handler
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditForm({ title: item.title, description: item.description, category: item.category, imageUrl: item.imageUrl });
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/item/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ title: '', description: '', category: '', imageUrl: '' });
        await fetchItems();
      }
    } catch {}
  };

  // Delete product handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/item/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchItems();
    } catch {}
  };

  if (loading) return <div className="p-8 text-center">Loading items...</div>;

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Admin - All Approved Products</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search by item, email, or user name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-72"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-60"
        >
          <option value="">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          onClick={() => setShowAdd(true)}
        >
          Add Product
        </button>
      </div>
      {showAdd && (
        <form className="bg-white p-6 rounded shadow mb-8" onSubmit={handleAdd}>
          <h2 className="text-lg font-semibold mb-4">Add Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={addForm.title}
              onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={addForm.category}
              onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={addForm.imageUrl}
              onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="User Email (owner)"
              value={addForm.email}
              onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
              className="border px-3 py-2 rounded"
              required
            />
          </div>
          <textarea
            placeholder="Description"
            value={addForm.description}
            onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
            className="border px-3 py-2 rounded w-full mt-4"
            required
          />
          <div className="mt-4 flex gap-2">
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Add</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}
      <ul className="space-y-4">
        {filteredItems.length === 0 ? (
          <li className="text-gray-500">No products found.</li>
        ) : (
          filteredItems.map(item => (
            <li key={item._id} className="bg-white p-4 rounded shadow flex gap-4 items-center">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded" />
              )}
              <div className="flex-1">
                {editId === item._id ? (
                  <form className="space-y-2" onSubmit={handleEditSave}>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <input
                      type="text"
                      value={editForm.imageUrl}
                      onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                      className="border px-3 py-2 rounded w-full"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
                      <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500">Category: {item.category}</p>
                    <p className="text-xs text-gray-500">Uploaded By: {item.uploadedBy?.email || 'N/A'} {item.uploadedBy?.name ? `(${item.uploadedBy.name})` : ''}</p>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => handleEdit(item)}
                  disabled={editId === item._id}
                >
                  Modify
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
