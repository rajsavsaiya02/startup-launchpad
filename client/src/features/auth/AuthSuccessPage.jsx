import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function AuthSuccessPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Ensure cookies are sent
                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    withCredentials: true
                });
                setUser(response.data);
            } catch (err) {
                setError('Failed to fetch user session. Cookies might be missing.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Authentication Verified</h1>

            {loading && <p>Verifying session...</p>}

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            {user && (
                <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
                        {user.avatar && <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />}
                        <div>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Raw Credentials</h3>
                        <pre className="bg-black/50 p-4 rounded overflow-auto text-xs font-mono text-green-400">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded transition-colors"
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {!loading && !user && !error && (
                <p className="text-gray-400">No session found.</p>
            )}
        </div>
    );
}
