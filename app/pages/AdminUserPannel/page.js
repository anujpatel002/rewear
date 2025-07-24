'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function AdminUserPanel() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers((data.users || []).filter(u => u.email !== 'admin@gmail.com'));
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) return toast.error('Fill all fields');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('User added');
        setNewUser({ name: '', email: '' });
        fetchUsers();
      } else {
        toast.error(data.error || 'Add failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (email) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin User Panel</h1>

      {/* Add User Form */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="p-2 border rounded w-full sm:w-1/3"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="p-2 border rounded w-full sm:w-1/3"
        />
        <button
          onClick={handleAddUser}
          disabled={isSubmitting}
          className={`bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Adding...' : 'Add User'}
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">
                  <span
                    className={`inline-block px-2 py-1 text-sm rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(user.email)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
