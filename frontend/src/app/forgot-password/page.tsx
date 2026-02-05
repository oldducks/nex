"use client";

import { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setMessage('If the email exists, a reset link has been sent. Please check your inbox.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 relative z-10">
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Login
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black mb-2 tracking-tight">Forgot Password</h1>
                    <p className="text-gray-400">Enter your email to receive a reset link</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm text-center font-medium">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : <><Send size={20} /> Send Reset Link</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
