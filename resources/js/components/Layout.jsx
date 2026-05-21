import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Layout() {
    const navigate = useNavigate();
    const user     = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin  = user?.role === 'admin';
    const isSeller = user?.role === 'seller';
    const [menuOpen, setMenuOpen] = useState(false);

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLink = ({ isActive }) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isActive
                ? 'text-white bg-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`;

    const roleMap = {
        admin:  { label: 'Admin',  color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
        seller: { label: 'Seller', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        buyer:  { label: 'Buyer',  color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    };
    const role = roleMap[user?.role] ?? { label: user?.role, color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            {/* Navbar */}
            <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="text-white font-semibold text-sm tracking-tight">Marketplace</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden sm:flex items-center gap-0.5">
                        {user?.role === 'buyer'
                            ? <NavLink to="/catalog"   className={navLink}>Katalog</NavLink>
                            : <NavLink to="/dashboard" className={navLink}>Dashboard</NavLink>
                        }
                        <NavLink to="/profile" className={navLink}>Profil</NavLink>
                        {isAdmin  && <NavLink to="/admin"  className={navLink}>Admin</NavLink>}
                        {isSeller && <NavLink to="/seller" className={navLink}>Produk Saya</NavLink>}
                    </nav>

                    {/* Right */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="leading-none">
                                <p className="text-white text-xs font-medium">{user?.name}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${role.color}`}>
                                    {role.label}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 border border-white/10 hover:border-red-500/50 hover:text-red-400 transition-all"
                        >
                            Keluar
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button className="sm:hidden text-zinc-400" onClick={() => setMenuOpen(!menuOpen)}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                        </svg>
                    </button>
                </div>

                {menuOpen && (
                    <div className="sm:hidden border-t border-white/5 px-4 py-3 space-y-1">
                        {[
                            user?.role === 'buyer'
                                ? { to: '/catalog',   label: 'Katalog' }
                                : { to: '/dashboard', label: 'Dashboard' },
                            { to: '/profile', label: 'Profil' },
                            ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
                            ...(isSeller ? [{ to: '/seller', label: 'Produk Saya' }] : []),
                        ].map(l => (
                            <NavLink key={l.to} to={l.to} className={navLink} onClick={() => setMenuOpen(false)}>
                                {l.label}
                            </NavLink>
                        ))}
                        <button onClick={logout} className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-white/5 rounded-lg">
                            Keluar
                        </button>
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}
