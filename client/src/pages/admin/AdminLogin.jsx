import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { useSettings } from '../../context/SettingsContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const { settings } = useSettings();

    const handleLogin = async (e) => {
        // ... same logic ...
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiClient.post('/admin/login', { username, password });
            await checkAuth(); // Sync state
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Access denied.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-6 relative z-10"
            >
                {/* Card Container */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card border border-border-light dark:border-border-dark overflow-hidden backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">

                    {/* Header Section */}
                    <div className="pt-10 pb-6 px-8 text-center border-b border-border-light/50 dark:border-border-dark/50 bg-gradient-to-b from-primary/5 to-transparent">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary relative group">
                            <ShieldCheck className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight">Admin Portal</h2>
                        <p className="text-sm text-text-tertiary mt-2">Secure access for authorized personnel only</p>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-start gap-3"
                            >
                                <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                                <p className="text-sm text-error font-medium">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-tertiary ml-1">
                                    Username
                                </label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    icon={User}
                                    className="h-12 w-full bg-background-light dark:bg-background-dark/50 border-border-light dark:border-border-dark rounded-xl focus:ring-primary/20 focus:border-primary"
                                    placeholder="Enter admin username"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-tertiary ml-1">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={Lock}
                                    className="h-12 w-full bg-background-light dark:bg-background-dark/50 border-border-light dark:border-border-dark rounded-xl focus:ring-primary/20 focus:border-primary"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Secure Login</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-background-light/50 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark text-center">
                        <p className="text-xs text-text-tertiary flex items-center justify-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            System activity is monitored and logged
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-text-tertiary">
                    &copy; {new Date().getFullYear()} {settings?.platform_name || 'Startup LaunchPad'}. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
