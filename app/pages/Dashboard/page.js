'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSession } from '@/utils/session';
import { Country, State, City } from 'country-state-city';
import { useSession } from '@/context/SessionContext';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [swapsAsOwner, setSwapsAsOwner] = useState([]);
    const [swapsAsRequester, setSwapsAsRequester] = useState([]);
    const router = useRouter();
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ profilePic: '', address: '' });
    const fileInputRef = useRef();
    const [profilePreview, setProfilePreview] = useState('');
    const { refreshSession } = useSession();

    // Move fetchUserItems outside so it's accessible everywhere
    const fetchUserItems = async () => {
        try {
            const res = await fetch('/api/item/user');
            const data = await res.json();
            if (res.ok) {
                setItems(data.items || []);
                setSwapsAsOwner(data.swapsAsOwner || []);
                setSwapsAsRequester(data.swapsAsRequester || []);
            } else {
                console.error(data.error || 'Failed to load items');
            }
        } catch (err) {
            console.error('Error fetching user items:', err);
        }
    };

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
            setProfileForm({
                profilePic: sessionUser.profilePic || '',
                address: {
                    country: sessionUser.address?.country || '',
                    state: sessionUser.address?.state || '',
                    city: sessionUser.address?.city || '',
                    pinCode: sessionUser.address?.pinCode || '',
                },
            });
            setProfilePreview(sessionUser.profilePic || '');
            fetchUserItems();
        };

        loadUser();
    }, [router]);

    if (!user) return <div className="text-center mt-20">Loading...</div>;

    async function saveProfile(profilePic) {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilePic, address: profileForm.address }),
            });
            if (res.ok) {
                setShowEditProfile(false);
                const updated = await res.json();
                setUser(u => ({ ...u, ...updated.user }));
                await refreshSession(); // Update nav/profile context
            }
        } catch {}
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-emerald-600 mb-6">
                {user.name}&apos;s Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                        Profile Details
                        <button
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2"
                            onClick={() => setShowEditProfile(v => !v)}
                        >
                            {showEditProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </h2>
                    <div className="flex items-center gap-4 mb-4">
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt="Profile"
                                className="w-20 h-20 object-cover rounded-full border"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full border bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <p><strong>Address:</strong> {user.address?.country || user.address?.state || user.address?.city || user.address?.pinCode ? (
                        <span>{[user.address?.country, user.address?.state, user.address?.city, user.address?.pinCode].filter(Boolean).join(', ')}</span>
                    ) : <span className="text-gray-400">Not set</span>}</p>
                    <p><strong>Points Balance:</strong> {user.points || 0}</p>
                    {showEditProfile && (
                        <form
                            className="mt-4 space-y-3"
                            onSubmit={async e => {
                                e.preventDefault();
                                let profilePic = profileForm.profilePic;
                                // If a new file is selected, upload it (simulate upload here)
                                if (fileInputRef.current && fileInputRef.current.files[0]) {
                                    // For demo: convert to base64 (in real app, upload to server/cloud)
                                    const file = fileInputRef.current.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                        profilePic = reader.result;
                                        setProfilePreview(profilePic);
                                        await saveProfile(profilePic);
                                    };
                                    reader.readAsDataURL(file);
                                    return;
                                }
                                await saveProfile(profilePic);
                            }}
                        >
                            <div>
                                <label className="block text-sm font-medium">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="mt-1"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setProfilePreview(reader.result);
                                            reader.readAsDataURL(e.target.files[0]);
                                        }
                                    }}
                                />
                                {profilePreview && (
                                    <img
                                        src={profilePreview}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-full border mt-2"
                                    />
                                )}
                                {!profilePreview && user.name && (
                                    <div className="w-20 h-20 rounded-full border bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 mt-2">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Country Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium">Country</label>
                                    <select
                                        value={profileForm.address.country}
                                        onChange={e => {
                                            setProfileForm(f => ({
                                                ...f,
                                                address: {
                                                    ...f.address,
                                                    country: e.target.value,
                                                    state: '',
                                                    city: '',
                                                }
                                            }));
                                        }}
                                        className="w-full border px-3 py-2 rounded"
                                    >
                                        <option value="">Select Country</option>
                                        {Country.getAllCountries().map(country => (
                                            <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* State Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium">State</label>
                                    <select
                                        value={profileForm.address.state}
                                        onChange={e => {
                                            setProfileForm(f => ({
                                                ...f,
                                                address: {
                                                    ...f.address,
                                                    state: e.target.value,
                                                    city: '',
                                                }
                                            }));
                                        }}
                                        className="w-full border px-3 py-2 rounded"
                                        disabled={!profileForm.address.country}
                                    >
                                        <option value="">Select State</option>
                                        {profileForm.address.country &&
                                            State.getStatesOfCountry(profileForm.address.country).map(state => (
                                                <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                            ))}
                                    </select>
                                </div>
                                {/* City Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium">City</label>
                                    <select
                                        value={profileForm.address.city}
                                        onChange={e => setProfileForm(f => ({
                                            ...f,
                                            address: { ...f.address, city: e.target.value }
                                        }))}
                                        className="w-full border px-3 py-2 rounded"
                                        disabled={!profileForm.address.state}
                                    >
                                        <option value="">Select City</option>
                                        {profileForm.address.country && profileForm.address.state &&
                                            City.getCitiesOfState(profileForm.address.country, profileForm.address.state).map(city => (
                                                <option key={city.name} value={city.name}>{city.name}</option>
                                            ))}
                                    </select>
                                </div>
                                {/* Pin Code */}
                                <div>
                                    <label className="block text-sm font-medium">Pin Code</label>
                                    <input
                                        type="text"
                                        value={profileForm.address.pinCode}
                                        onChange={e => setProfileForm(f => ({
                                            ...f,
                                            address: { ...f.address, pinCode: e.target.value }
                                        }))}
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>
                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Address</label>
                                    <input
                                        type="text"
                                        value={profileForm.address.address || ''}
                                        onChange={e => setProfileForm(f => ({
                                            ...f,
                                            address: { ...f.address, address: e.target.value }
                                        }))}
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </form>
                    )}
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
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Swaps Requested By You</h3>
                        {swapsAsRequester.length === 0 ? (
                            <p className="text-sm text-gray-500">No swap requests sent.</p>
                        ) : (
                            <ul className="space-y-2">
                                {swapsAsRequester.map(swap => (
                                    <li key={swap._id} className="border rounded p-3 flex flex-col md:flex-row md:items-center gap-3">
                                        {/* Item Image */}
                                        {swap.item?.imageUrl && (
                                            <img
                                                src={swap.item.imageUrl}
                                                alt={swap.item.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        {/* Item Name */}
                                        <div>
                                            <span className="font-semibold">Item:</span> {swap.item?.title || 'N/A'}
                                        </div>
                                        {/* Owner Name */}
                                        <div>
                                            <span className="font-semibold">Owner:</span> {swap.owner?.name || 'N/A'}
                                        </div>
                                        {/* Status */}
                                        <div>
                                            <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${swap.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : swap.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Swap Requests For Your Items</h3>
                        {swapsAsOwner.length === 0 ? (
                            <p className="text-sm text-gray-500">No swap requests received.</p>
                        ) : (
                            <ul className="space-y-2">
                                {swapsAsOwner.map(swap => (
                                    <li key={swap._id} className="border rounded p-3 flex flex-col md:flex-row md:items-center gap-3">
                                        {/* Item Image */}
                                        {swap.item?.imageUrl && (
                                            <img
                                                src={swap.item.imageUrl}
                                                alt={swap.item.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        {/* Item Name */}
                                        <div>
                                            <span className="font-semibold">Item:</span> {swap.item?.title || 'N/A'}
                                        </div>
                                        {/* Requester Name */}
                                        <div>
                                            <span className="font-semibold">Requester:</span> {swap.requester?.name || 'N/A'}
                                        </div>
                                        {/* Status */}
                                        <div>
                                            <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${swap.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : swap.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</span>
                                        </div>
                                        {swap.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                                                    onClick={async () => {
                                                        await fetch(`/api/swap/${swap._id}/approve`, { method: 'POST' });
                                                        fetchUserItems();
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                                    onClick={async () => {
                                                        await fetch(`/api/swap/${swap._id}/reject`, { method: 'POST' });
                                                        fetchUserItems();
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
