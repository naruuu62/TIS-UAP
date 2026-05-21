import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ email: '', password: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            const user = res.data.user;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate(user.role === 'buyer' ? '/catalog' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Email atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
            {/* Left panel — branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #0a0a0a 100%)' }}>
                {/* Glow orbs */}
                <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <span className="text-white font-semibold">Marketplace</span>
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#fff' }}>
                        Jual Beli<br />
                        <span style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                            Lebih Mudah
                        </span>
                    </h1>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                        Platform marketplace modern. Temukan produk terbaik, jual dengan mudah.
                    </p>

                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[{ n: '200+', l: 'Produk' }, { n: '50+', l: 'Seller' }, { n: '1K+', l: 'Transaksi' }].map(s => (
                            <div key={s.l} className="rounded-xl p-3" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                <p className="text-white font-bold text-lg">{s.n}</p>
                                <p className="text-zinc-500 text-xs">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-zinc-700 text-xs relative z-10">© 2026 Marketplace</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="text-white font-semibold text-sm">Marketplace</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">Masuk</h2>
                    <p className="text-zinc-500 text-sm mb-8">Masukkan kredensial akun Anda</p>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400"
                            style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                            <input
                                type="email" required placeholder="email@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="input-dark"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                            <input
                                type="password" required placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="input-dark"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? 'Memproses...' : 'Masuk →'}
                        </button>
                    </form>

                    <p className="text-zinc-600 text-sm mt-6 text-center">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
