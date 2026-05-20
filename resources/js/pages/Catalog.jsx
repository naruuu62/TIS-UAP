import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ── Order Modal ───────────────────────────────────────────── */
function OrderModal({ product, onClose, onSuccess }) {
    const [qty, setQty]         = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const total = Number(product.price) * qty;

    const handleOrder = async () => {
        setLoading(true); setError('');
        try {
            await api.post('/orders', {
                user_id: user.id,
                items: [{ product_id: product.id, quantity: qty }],
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat order.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                style={{ background:'#111', border:'1px solid #222' }}>
                <div className="px-5 pt-5 pb-4" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-zinc-500 text-xs mb-0.5">Beli Produk</p>
                            <h3 className="text-white font-bold text-base">{product.name}</h3>
                        </div>
                        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    <div className="rounded-xl p-4 space-y-2" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #1f1f1f' }}>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Harga</span>
                            <span className="text-white font-semibold">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Stok</span>
                            <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
                            </span>
                        </div>
                        {product.description && (
                            <p className="text-zinc-600 text-xs pt-2 border-t border-white/5">{product.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-2">Jumlah</label>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white font-bold text-lg transition"
                                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #222' }}>−</button>
                            <span className="text-white font-bold text-lg w-8 text-center">{qty}</span>
                            <button onClick={() => setQty(q => product.stock ? Math.min(product.stock, q + 1) : q + 1)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white font-bold text-lg transition"
                                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #222' }}>+</button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center rounded-xl px-4 py-3"
                        style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                        <span className="text-indigo-300 text-sm font-medium">Total</span>
                        <span className="text-indigo-200 font-bold text-lg">Rp {total.toLocaleString('id-ID')}</span>
                    </div>

                    {error && (
                        <p className="text-sm px-3 py-2 rounded-lg"
                            style={{ background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button onClick={onClose} className="btn-ghost flex-1">Batal</button>
                        <button onClick={handleOrder} disabled={loading || product.stock === 0} className="btn-primary flex-1">
                            {loading ? 'Memproses...' : 'Pesan Sekarang'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Toast ─────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
            style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', backdropFilter:'blur(12px)' }}>
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
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

/* ── Catalog ───────────────────────────────────────────────── */
export default function Catalog() {
    const user     = JSON.parse(localStorage.getItem('user') || 'null');
    const navigate = useNavigate();

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags]             = useState([]);
    const [orders, setOrders]         = useState([]);
    const [loadingP, setLoadingP]     = useState(true);
    const [loadingO, setLoadingO]     = useState(true);
    const [selected, setSelected]     = useState(null);
    const [toast, setToast]           = useState('');
    const [search, setSearch]         = useState('');
    const [tab, setTab]               = useState('catalog');
    const [activeCat, setActiveCat]   = useState(null);
    const [activeTag, setActiveTag]   = useState(null);

    const fetchProducts = useCallback(() => {
        setLoadingP(true);
        api.get('/products').then(r => setProducts(r.data.data || r.data)).catch(() => {}).finally(() => setLoadingP(false));
    }, []);

    const fetchOrders = useCallback(() => {
        setLoadingO(true);
        api.get('/orders').then(r => setOrders(r.data.data || r.data)).catch(() => {}).finally(() => setLoadingO(false));
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        api.get('/categories').then(r => setCategories(r.data.data || r.data)).catch(() => {});
        api.get('/tags').then(r => setTags(r.data.data || r.data)).catch(() => {});
    }, []);

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat    = activeCat === null || (p.categories ?? []).some(c => c.id === activeCat);
        const matchTag    = activeTag === null || (p.tags ?? []).some(t => t.id === activeTag);
        return matchSearch && matchCat && matchTag;
    });

    const myOrders = orders.filter(o => o.user_id === user?.id);

    const pillStyle = (active) => ({
        background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid #222',
        color: active ? '#a5b4fc' : '#555',
    });

    return (
        <>
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Katalog Produk</h1>
                <p className="text-zinc-500 text-sm">Temukan produk terbaik dan mulai belanja.</p>
            </div>

            {/* Tab */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                {[
                    { key: 'catalog', label: 'Produk' },
                    { key: 'orders',  label: `Order Saya (${myOrders.length})` },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: tab === t.key ? '#a5b4fc' : '#555',
                            border: tab === t.key ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Catalog tab */}
            {tab === 'catalog' && (
                <div>
                    {/* Search + count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <p className="text-zinc-600 text-sm">{filtered.length} produk tersedia</p>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="Cari nama produk..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input-dark pl-9 text-xs py-2 w-full sm:w-64" />
                        </div>
                    </div>

                    {/* Category filter pills */}
                    {categories.length > 0 && (
                        <div className="mb-3">
                            <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider mb-2">Kategori</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveCat(null)}
                                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                    style={pillStyle(activeCat === null)}>
                                    Semua
                                </button>
                                {categories.map(cat => (
                                    <button key={cat.id}
                                        onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                        style={pillStyle(activeCat === cat.id)}>
                                        {cat.name}
                                        {cat.products_count > 0 && <span className="ml-1 opacity-40">({cat.products_count})</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tag filter pills */}
                    {tags.length > 0 && (
                        <div className="mb-6">
                            <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveTag(null)}
                                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                    style={pillStyle(activeTag === null)}>
                                    Semua
                                </button>
                                {tags.map(tag => (
                                    <button key={tag.id}
                                        onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                        style={activeTag === tag.id
                                            ? { background:'rgba(168,85,247,0.2)', border:'1px solid rgba(168,85,247,0.4)', color:'#c084fc' }
                                            : { background:'rgba(255,255,255,0.04)', border:'1px solid #222', color:'#555' }}>
                                        #{tag.name}
                                        {tag.products_count > 0 && <span className="ml-1 opacity-40">({tag.products_count})</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loadingP ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                                    <div className="h-3 bg-white/5 rounded w-1/2 mb-3" />
                                    <div className="h-5 bg-white/5 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-white/5 rounded w-1/3 mb-4" />
                                    <div className="h-8 bg-white/5 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20" style={{ border:'1px dashed #1f1f1f', borderRadius:16 }}>
                            <p className="text-zinc-600 text-sm">Produk tidak ditemukan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(p => (
                                <div key={p.id} className="group rounded-2xl p-5 flex flex-col transition-all relative overflow-hidden cursor-pointer"
                                    style={{ background:'#111', border:'1px solid #1a1a1a' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2d2d2d'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                                    onClick={() => navigate(`/products/${p.id}`)}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                        style={{ background:'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.07), transparent 70%)' }} />

                                    {/* Stock badge */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                background: (p.stock ?? 1) > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                border: (p.stock ?? 1) > 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                                                color: (p.stock ?? 1) > 0 ? '#86efac' : '#fca5a5',
                                            }}>
                                            {(p.stock ?? 1) > 0 ? `Stok ${p.stock ?? '∞'}` : 'Habis'}
                                        </span>
                                    </div>

                                    <h3 className="text-white font-semibold text-sm leading-snug mb-1 flex-1">{p.name}</h3>
                                    {p.description && (
                                        <p className="text-zinc-600 text-xs line-clamp-2 mb-2">{p.description}</p>
                                    )}

                                    {/* Category badges */}
                                    {(p.categories ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {p.categories.map(cat => (
                                                <span key={cat.id} className="text-xs px-1.5 py-0.5 rounded font-medium"
                                                    style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tag badges */}
                                    {(p.tags ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {p.tags.map(tag => (
                                                <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded font-medium"
                                                    style={{ background:'rgba(168,85,247,0.1)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.2)' }}>
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-white/5">
                                        <p className="text-indigo-300 font-bold mb-2">
                                            Rp {Number(p.price).toLocaleString('id-ID')}
                                        </p>
                                        <button
                                            disabled={(p.stock ?? 1) === 0}
                                            onClick={e => { e.stopPropagation(); if ((p.stock ?? 1) > 0) setSelected(p); }}
                                            className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
                                            style={{
                                                background: (p.stock ?? 1) > 0 ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                                border: (p.stock ?? 1) > 0 ? '1px solid rgba(99,102,241,0.3)' : '1px solid #222',
                                                color: (p.stock ?? 1) > 0 ? '#a5b4fc' : '#333',
                                            }}>
                                            {(p.stock ?? 1) > 0 ? 'Beli Sekarang →' : 'Stok Habis'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
                <div className="rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                    {loadingO ? (
                        <div className="p-5 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.03)' }} />
                            ))}
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-zinc-600 text-sm">Belum ada order. Mulai belanja sekarang!</p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-zinc-600 font-medium"
                                style={{ borderBottom:'1px solid #1a1a1a' }}>
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Produk</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Total</div>
                                <div className="col-span-2 text-right">Status</div>
                            </div>
                            {myOrders.map((o, i) => {
                                const items = o.order_items ?? [];
                                const first = items[0];
                                const name  = first?.product?.name ?? `Order #${o.id}`;
                                return (
                                    <div key={o.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center"
                                        style={{ borderBottom: i < myOrders.length - 1 ? '1px solid #151515' : 'none' }}>
                                        <div className="col-span-1 text-zinc-700 text-xs font-mono">{o.id}</div>
                                        <div className="col-span-5">
                                            <p className="text-white text-sm font-medium truncate">{name}</p>
                                            {items.length > 1 && <p className="text-zinc-600 text-xs">+{items.length - 1} lainnya</p>}
                                        </div>
                                        <div className="col-span-2 text-center text-zinc-400 text-sm">{first?.quantity ?? o.quantity ?? '-'}</div>
                                        <div className="col-span-2 text-right text-white text-sm font-semibold">
                                            Rp {Number(o.total_price ?? 0).toLocaleString('id-ID')}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColor[o.status] ?? 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                {o.status ?? 'completed'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>

        {selected && (
            <OrderModal product={selected}
                onClose={() => setSelected(null)}
                onSuccess={() => {
                    setSelected(null);
                    setToast('Order berhasil! Stok telah dikurangi.');
                    fetchProducts();
                    fetchOrders();
                    setTab('orders');
                }} />
        )}
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
}
