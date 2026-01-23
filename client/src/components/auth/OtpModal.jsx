import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function OtpModal({ email, isOpen, onClose }) {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.post('/auth/verify-email', { email, otp });
            // On success, redirect to login or dashboard
            // For now, goto login
            navigate('/auth/login?verified=true');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-surface-dark">
                <h2 className="mb-4 text-xl font-bold text-text-primary">Verify Your Email</h2>
                <p className="mb-6 text-sm text-text-secondary">
                    We sent a verification code to <span className="font-semibold">{email}</span>.
                    Please enter it below.
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                    <Input
                        label="OTP Code"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                    />
                    {error && <p className="text-sm text-error">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </Button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-center text-sm text-text-tertiary hover:underline"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
