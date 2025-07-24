'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/utils/session';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const sessionUser = await fetchSession();
            if (!sessionUser) {
                router.push('/auth/login');
                return;
            }

            if (sessionUser.email === 'admin@gmail.com') {
                router.push('/pages/Admin');
                return;
            }

            setUser(sessionUser);
            fetchUserItems();
        };

        const fetchUserItems = async () => {
            try {
                const res = await fetch('/api/item/user');
                const data = await res.json();
                if (res.ok) {
                    setItems(data.items || []);
                } else {
                    console.error(data.error || 'Failed to load items');
                }
            } catch (err) {
                console.error('Error fetching user items:', err);
            }
        };

        loadUser();
    }, [router]);

    if (!user) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-emerald-600 mb-6">
                {user.name}&apos;s Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Points Balance:</strong> {user.points || 0}</p>
                </div>

                {/* Uploaded Items */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Uploaded Items</h2>
                    {items.length === 0 ? (
                        <p>No items uploaded yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {items.map(item => (
                                <li key={item._id} className="border rounded p-3 shadow-sm flex gap-4 items-start">

                                    {/* Image */}
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                    )}

                                    {/* Item details */}
                                    <div>
                                        <h3 className="font-semibold text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {item.category} | {item.size} | {item.condition}
                                        </p>
                                        <p className="text-sm">{item.description}</p>
                                        <span
                                            className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${item.status === 'pending'
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : item.status === 'approved'
                                                        ? 'bg-green-200 text-green-800'
                                                        : 'bg-red-200 text-red-800'
                                                }`}
                                        >
                                            {item.status === 'pending'
                                                ? 'Pending Approval'
                                                : item.status === 'approved'
                                                    ? 'Verified'
                                                    : 'Rejected'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>

                    )}
                </div>

                {/* Swap Status */}
                <div className="bg-white shadow rounded-lg p-6 col-span-full">
                    <h2 className="text-xl font-semibold mb-4">Swaps</h2>
                    <p>Overview of your ongoing and completed swaps.</p>
                    {/* TODO: Add swap logic later */}
                </div>
            </div>
        </div>
    );
}
