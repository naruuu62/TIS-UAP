import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm]     = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'buyer' });
    const [errors, setErrors] = useState({});
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setErrors({});
        setLoading(true);
        try {
            const res = await api.post('/auth/register', form);
            const u = res.data.user;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(u));
            navigate(u.role === 'buyer' ? '/catalog' : '/dashboard');
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
            else setError(err.response?.data?.message || 'Registrasi gagal.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'buyer',  label: 'Buyer',  desc: 'Saya ingin membeli produk' },
        { value: 'seller', label: 'Seller', desc: 'Saya ingin menjual produk' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background:'#0a0a0a' }}>
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-sm">Marketplace</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">Buat Akun</h2>
                <p className="text-zinc-500 text-sm mb-8">Bergabung dan mulai beli atau jual produk sekarang</p>

                {error && (
                    <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400"
                        style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nama Lengkap</label>
                        <input type="text" required placeholder="Nuril Arifin"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="input-dark" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                        <input type="email" required placeholder="email@example.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="input-dark" />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                        <input type="password" required placeholder="Min. 6 karakter"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                            className="input-dark" />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Konfirmasi Password</label>
                        <input type="password" required placeholder="Ulangi password"
                            value={form.password_confirmation}
                            onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                            className="input-dark" />
                        {errors.password_confirmation && <p className="text-red-400 text-xs mt-1">{errors.password_confirmation[0]}</p>}
                    </div>

                    {/* Role selector */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Daftar sebagai</label>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map(r => (
                                <button key={r.value} type="button"
                                    onClick={() => setForm({ ...form, role: r.value })}
                                    className="p-3 rounded-xl text-left transition-all"
                                    style={{
                                        background: form.role === r.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${form.role === r.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`,
                                    }}>
                                    <p className={`text-sm font-semibold ${form.role === r.value ? 'text-indigo-300' : 'text-white'}`}>
                                        {r.label}
                                    </p>
                                    <p className="text-zinc-500 text-xs mt-0.5">{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                        {loading ? 'Memproses...' : 'Buat Akun →'}
                    </button>
                </form>

                <p className="text-zinc-600 text-sm mt-6 text-center">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                        Masuk sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}
