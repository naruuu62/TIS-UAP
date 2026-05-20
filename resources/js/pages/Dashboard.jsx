import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

/* ── Toast ─────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
            style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', backdropFilter:'blur(12px)' }}>
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-emerald-300 text-sm font-medium">{message}</span>
        </div>
    );
}

const statusColor = {
    pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function StatCard({ label, value, color, loading }) {
    return (
        <div className="rounded-2xl p-4" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
            <div className="w-2 h-2 rounded-full mb-3" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            {loading
                ? <div className="h-7 bg-white/5 rounded w-12 mb-1 animate-pulse" />
                : <p className="text-2xl font-bold text-white">{value}</p>
            }
            <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
        </div>
    );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
    const user     = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin  = user?.role === 'admin';
    const isSeller = user?.role === 'seller';

    const [allProducts, setAllProducts]   = useState([]);
    const [allOrders, setAllOrders]       = useState([]);
    const [categories, setCategories]     = useState([]);
    const [tags, setTags]                 = useState([]);
    const [loadingP, setLoadingP]         = useState(true);
    const [loadingO, setLoadingO]         = useState(true);
    const [loadingMeta, setLoadingMeta]   = useState(true);
    const [toast, setToast]               = useState('');
    const [search, setSearch]             = useState('');

    const fetchAll = useCallback(() => {
        setLoadingP(true);
        setLoadingO(true);
        api.get('/products').then(r => setAllProducts(r.data.data || r.data)).catch(() => {}).finally(() => setLoadingP(false));
        api.get('/orders').then(r => setAllOrders(r.data.data || r.data)).catch(() => {}).finally(() => setLoadingO(false));
        if (isAdmin) {
            setLoadingMeta(true);
            Promise.all([
                api.get('/categories').then(r => setCategories(r.data.data || r.data)).catch(() => {}),
                api.get('/tags').then(r => setTags(r.data.data || r.data)).catch(() => {}),
            ]).finally(() => setLoadingMeta(false));
        }
    }, [isAdmin]);

    useEffect(() => { fetchAll(); }, []);

    // Seller: only own products
    const myProducts = isSeller
        ? allProducts.filter(p => p.user_id === user?.id)
        : allProducts;

    // Seller: only orders that contain at least one of their products
    const myOrders = isSeller
        ? allOrders.filter(o =>
            (o.order_items ?? []).some(item => item.product?.user_id === user?.id)
          )
        : allOrders;

    const displayProducts = myProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    // ── Stat cards per role ──────────────────────────────────
    const sellerStats = [
        { label:'Total Produk',  value: myProducts.length,                                   color:'#6366f1' },
        { label:'Stok Tersedia', value: myProducts.filter(p => (p.stock ?? 1) > 0).length,  color:'#22c55e' },
        { label:'Stok Habis',    value: myProducts.filter(p => p.stock === 0).length,        color:'#f87171' },
        { label:'Total Order',   value: myOrders.length,                                      color:'#f59e0b' },
    ];

    const adminStats = [
        { label:'Total Produk', value: allProducts.length,  color:'#6366f1', loading: loadingP },
        { label:'Total Order',  value: allOrders.length,    color:'#22c55e', loading: loadingO },
        { label:'Kategori',     value: categories.length,   color:'#f59e0b', loading: loadingMeta },
        { label:'Tags',         value: tags.length,         color:'#ec4899', loading: loadingMeta },
    ];

    const stats = isAdmin ? adminStats : sellerStats;

    const roleColor = {
        admin:  { bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)', text:'#c4b5fd' },
        seller: { bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.3)',  text:'#6ee7b7' },
        buyer:  { bg:'rgba(99,102,241,0.1)',  border:'rgba(99,102,241,0.3)',  text:'#a5b4fc' },
    }[user?.role] ?? { bg:'rgba(255,255,255,0.05)', border:'#333', text:'#888' };

    return (
        <>
        <div className="space-y-8">

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium capitalize"
                        style={{ background: roleColor.bg, border: `1px solid ${roleColor.border}`, color: roleColor.text }}>
                        {user?.role}
                    </span>
                </div>
                <p className="text-zinc-500 text-sm">
                    Halo, <span className="text-zinc-300">{user?.name}</span>.{' '}
                    {isAdmin ? 'Berikut ringkasan seluruh marketplace.' : 'Berikut ringkasan aktivitas produk Anda.'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map(s => (
                    <StatCard key={s.label} {...s} loading={s.loading ?? (loadingP || loadingO)} />
                ))}
            </div>

            {/* Products section */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isAdmin ? 'Semua Produk' : 'Produk Saya'}
                        </h2>
                        <p className="text-zinc-600 text-xs mt-0.5">{displayProducts.length} produk ditemukan</p>
                    </div>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Cari produk..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-dark pl-9 w-full sm:w-52 text-xs py-2" />
                    </div>
                </div>

                {loadingP ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                                <div className="h-3 bg-white/5 rounded w-1/2 mb-3" />
                                <div className="h-5 bg-white/5 rounded w-3/4 mb-4" />
                                <div className="h-3 bg-white/5 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : displayProducts.length === 0 ? (
                    <div className="text-center py-16" style={{ border:'1px dashed #1f1f1f', borderRadius:16 }}>
                        <p className="text-zinc-600 text-sm">
                            {isSeller ? 'Belum ada produk. Tambah lewat menu "Produk Saya".' : 'Produk tidak ditemukan.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayProducts.map(p => (
                            <div key={p.id} className="group rounded-2xl p-5 transition-all relative overflow-hidden"
                                style={{ background:'#111', border:'1px solid #1a1a1a' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                    style={{ background:'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.05), transparent 70%)' }} />

                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                            background: (p.stock ?? 1) > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            border: (p.stock ?? 1) > 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                                            color: (p.stock ?? 1) > 0 ? '#86efac' : '#fca5a5',
                                        }}>
                                        {(p.stock ?? 1) > 0 ? `Stok ${p.stock ?? '∞'}` : 'Habis'}
                                    </span>
                                    {isAdmin && p.user && (
                                        <span className="text-xs text-zinc-600 truncate max-w-[100px]">{p.user.name}</span>
                                    )}
                                </div>

                                <h3 className="text-white font-semibold text-sm leading-snug mb-1">{p.name}</h3>
                                {p.description && (
                                    <p className="text-zinc-600 text-xs line-clamp-2 mb-3">{p.description}</p>
                                )}

                                {/* Tags */}
                                {(p.tags ?? []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {p.tags.map(t => (
                                            <span key={t.id} className="text-xs px-1.5 py-0.5 rounded"
                                                style={{ background:'rgba(168,85,247,0.1)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.2)' }}>
                                                #{t.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p className="text-indigo-300 font-bold text-sm">
                                    Rp {Number(p.price).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Orders section */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isAdmin ? 'Semua Order' : 'Order Produk Saya'}
                        </h2>
                        <p className="text-zinc-600 text-xs mt-0.5">{myOrders.length} transaksi</p>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                    {loadingO ? (
                        <div className="p-5 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.03)' }} />
                            ))}
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="text-center py-14">
                            <p className="text-zinc-600 text-sm">
                                {isSeller ? 'Belum ada order masuk untuk produk Anda.' : 'Belum ada order.'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-zinc-600 font-medium"
                                style={{ borderBottom:'1px solid #1a1a1a' }}>
                                <div className="col-span-1">#</div>
                                <div className="col-span-4">Produk</div>
                                {isAdmin && <div className="col-span-2">Pembeli</div>}
                                <div className={`${isAdmin ? 'col-span-1' : 'col-span-2'} text-center`}>Qty</div>
                                <div className="col-span-2 text-right">Total</div>
                                <div className="col-span-2 text-right">Status</div>
                            </div>
                            {myOrders.map((o, i) => {
                                const items = o.order_items ?? [];
                                const first = items[0];
                                const name  = first?.product?.name ?? `Order #${o.id}`;
                                const status = o.status ?? 'completed';
                                return (
                                    <div key={o.id}
                                        className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center transition-colors"
                                        style={{ borderBottom: i < myOrders.length - 1 ? '1px solid #151515' : 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div className="col-span-1 text-zinc-700 text-xs font-mono">{o.id}</div>
                                        <div className="col-span-4">
                                            <p className="text-white text-sm font-medium truncate">{name}</p>
                                            {items.length > 1 && (
                                                <p className="text-zinc-600 text-xs">+{items.length - 1} item lain</p>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <div className="col-span-2 text-zinc-400 text-xs truncate">{o.user?.name ?? '-'}</div>
                                        )}
                                        <div className={`${isAdmin ? 'col-span-1' : 'col-span-2'} text-center text-zinc-400 text-sm`}>
                                            {first?.quantity ?? '-'}
                                        </div>
                                        <div className="col-span-2 text-right text-white text-sm font-semibold">
                                            Rp {Number(o.total_price ?? 0).toLocaleString('id-ID')}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColor[status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
}
