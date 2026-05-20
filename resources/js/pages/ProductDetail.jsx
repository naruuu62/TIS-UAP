import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

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

/* placeholder warna berdasarkan nama produk */
function productColor(name = '') {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export default function ProductDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const user       = JSON.parse(localStorage.getItem('user') || 'null');
    const isBuyer    = user?.role === 'buyer';

    const [product, setProduct]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [qty, setQty]           = useState(1);
    const [ordering, setOrdering] = useState(false);
    const [error, setError]       = useState('');
    const [toast, setToast]       = useState('');

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(r => setProduct(r.data.data))
            .catch(() => navigate(-1))
            .finally(() => setLoading(false));
    }, [id]);

    const handleOrder = async () => {
        setOrdering(true); setError('');
        try {
            await api.post('/orders', {
                user_id: user.id,
                items: [{ product_id: product.id, quantity: qty }],
            });
            setToast('Pembelian berhasil!');
            setProduct(prev => ({ ...prev, stock: Math.max(0, (prev.stock ?? 0) - qty) }));
            setQty(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat order.');
        } finally { setOrdering(false); }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto">
            <div className="h-5 bg-white/5 rounded w-24 mb-6 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 h-80 bg-white/5 rounded-2xl animate-pulse" />
                <div className="lg:col-span-3 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 bg-white/5 rounded animate-pulse" style={{ width: `${70 - i*10}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );

    if (!product) return null;

    const inStock  = (product.stock ?? 1) > 0;
    const accent   = productColor(product.name);
    const initials = product.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return (
        <>
        <div className="max-w-5xl mx-auto space-y-4">

            {/* Breadcrumb / back */}
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Katalog
            </button>

            {/* Main card */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                <div className="grid grid-cols-1 lg:grid-cols-5">

                    {/* ── Left: Image area ── */}
                    <div className="lg:col-span-2 p-6 flex flex-col items-center justify-center"
                        style={{ borderRight:'1px solid #1a1a1a', minHeight: 320 }}>
                        {/* Placeholder image dengan warna unik per produk */}
                        <div className="w-full max-w-xs aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
                            style={{ background:`${accent}18`, border:`1px solid ${accent}30` }}>
                            <div className="absolute inset-0 opacity-20"
                                style={{ background:`radial-gradient(circle at 30% 30%, ${accent}, transparent 70%)` }} />
                            <span className="text-5xl font-black relative z-10" style={{ color: accent }}>
                                {initials}
                            </span>
                            <span className="text-xs mt-2 relative z-10" style={{ color:`${accent}99` }}>
                                No Image
                            </span>
                        </div>

                        {/* Seller info di bawah gambar */}
                        {product.user && (
                            <div className="mt-5 w-full max-w-xs rounded-xl px-4 py-3 flex items-center gap-3"
                                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #1f1f1f' }}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                    {product.user.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-zinc-500 text-xs">Penjual</p>
                                    <p className="text-white text-sm font-medium truncate">{product.user.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Info + Buy ── */}
                    <div className="lg:col-span-3 flex flex-col">

                        {/* Top info */}
                        <div className="p-6 flex-1" style={{ borderBottom:'1px solid #1a1a1a' }}>
                            {/* Categories */}
                            {(product.categories ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {product.categories.map(c => (
                                        <span key={c.id} className="text-xs px-2 py-0.5 rounded font-medium"
                                            style={{ background:'rgba(99,102,241,0.12)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                            {c.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <h1 className="text-xl font-bold text-white leading-snug mb-3">{product.name}</h1>

                            {/* Stock status */}
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{
                                        background: inStock ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                        border: inStock ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                                        color: inStock ? '#86efac' : '#fca5a5',
                                    }}>
                                    {inStock ? 'Tersedia' : 'Stok Habis'}
                                </span>
                                {inStock && (
                                    <span className="text-zinc-600 text-xs">Stok: {product.stock}</span>
                                )}
                            </div>

                            {/* Price — prominent */}
                            <div className="mb-5">
                                <p className="text-zinc-500 text-xs mb-1">Harga</p>
                                <p className="text-3xl font-black" style={{ color: accent }}>
                                    Rp {Number(product.price).toLocaleString('id-ID')}
                                </p>
                            </div>

                            {/* Tags */}
                            {(product.tags ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {product.tags.map(t => (
                                        <span key={t.id} className="text-xs px-2 py-0.5 rounded font-medium"
                                            style={{ background:'rgba(168,85,247,0.1)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.2)' }}>
                                            #{t.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buy section */}
                        {isBuyer ? (
                            <div className="p-6 space-y-4">
                                {/* Qty */}
                                <div>
                                    <p className="text-zinc-500 text-xs mb-2">Jumlah</p>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg transition"
                                            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid #2a2a2a', color:'#aaa' }}>−</button>
                                        <span className="text-white font-bold text-lg w-10 text-center">{qty}</span>
                                        <button onClick={() => setQty(q => inStock ? Math.min(product.stock, q + 1) : q + 1)}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg transition"
                                            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid #2a2a2a', color:'#aaa' }}>+</button>
                                        <span className="text-zinc-600 text-sm ml-1">
                                            Total: <span className="text-white font-semibold">
                                                Rp {(Number(product.price) * qty).toLocaleString('id-ID')}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm px-3 py-2 rounded-lg"
                                        style={{ background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                        {error}
                                    </p>
                                )}

                                <button onClick={handleOrder} disabled={ordering || !inStock}
                                    className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                                    style={inStock
                                        ? { background: accent, color:'#fff', boxShadow:`0 0 20px ${accent}40` }
                                        : { background:'rgba(255,255,255,0.05)', color:'#333', cursor:'not-allowed', border:'1px solid #222' }}>
                                    {ordering ? 'Memproses...' : inStock ? 'Beli Sekarang' : 'Stok Habis'}
                                </button>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="rounded-xl px-4 py-3 text-center"
                                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid #1f1f1f' }}>
                                    <p className="text-zinc-600 text-xs">Login sebagai buyer untuk membeli produk ini</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {product.description && (
                <div className="rounded-2xl p-6" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                    <h2 className="text-white font-semibold mb-3 text-sm">Deskripsi Produk</h2>
                    <div className="w-8 h-0.5 rounded mb-4" style={{ background: accent }} />
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'ID Produk',  value: `#${product.id}` },
                    { label: 'Stok',       value: inStock ? product.stock : 'Habis' },
                    { label: 'Kategori',   value: (product.categories ?? []).length > 0 ? product.categories.map(c => c.name).join(', ') : '-' },
                    { label: 'Tags',       value: (product.tags ?? []).length > 0 ? product.tags.map(t => `#${t.name}`).join(' ') : '-' },
                ].map(item => (
                    <div key={item.label} className="rounded-xl px-4 py-3"
                        style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                        <p className="text-zinc-600 text-xs mb-1">{item.label}</p>
                        <p className="text-white text-sm font-medium truncate">{item.value}</p>
                    </div>
                ))}
            </div>

        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
}
