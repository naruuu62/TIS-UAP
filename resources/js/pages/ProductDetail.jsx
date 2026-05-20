import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

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

export default function ProductDetail() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const user         = JSON.parse(localStorage.getItem('user') || 'null');
    const isBuyer      = user?.role === 'buyer';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty]         = useState(1);
    const [ordering, setOrdering] = useState(false);
    const [error, setError]     = useState('');
    const [toast, setToast]     = useState('');

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
            setToast('Order berhasil! Stok telah dikurangi.');
            setProduct(prev => ({ ...prev, stock: Math.max(0, (prev.stock ?? 0) - qty) }));
            setQty(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat order.');
        } finally { setOrdering(false); }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 bg-white/5 rounded w-1/4" />
            <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
    );

    if (!product) return null;

    const inStock = (product.stock ?? 1) > 0;

    return (
        <>
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back */}
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
            </button>

            <div className="rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                {/* Header band */}
                <div className="px-6 pt-6 pb-5" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white mb-1">{product.name}</h1>
                            {product.user && (
                                <p className="text-zinc-600 text-xs">Dijual oleh <span className="text-zinc-400">{product.user.name}</span></p>
                            )}
                        </div>
                        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{
                                background: inStock ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                border: inStock ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                                color: inStock ? '#86efac' : '#fca5a5',
                            }}>
                            {inStock ? `Stok ${product.stock}` : 'Habis'}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Price */}
                    <div className="rounded-xl px-5 py-4"
                        style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
                        <p className="text-indigo-400 text-xs font-medium mb-0.5">Harga</p>
                        <p className="text-white text-2xl font-bold">
                            Rp {Number(product.price).toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Deskripsi</p>
                            <p className="text-zinc-300 text-sm leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {/* Categories */}
                    {(product.categories ?? []).length > 0 && (
                        <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Kategori</p>
                            <div className="flex flex-wrap gap-2">
                                {product.categories.map(c => (
                                    <span key={c.id} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                                        style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {(product.tags ?? []).length > 0 && (
                        <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map(t => (
                                    <span key={t.id} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                                        style={{ background:'rgba(168,85,247,0.1)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.2)' }}>
                                        #{t.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Buy section (buyer only) */}
                    {isBuyer && (
                        <div className="rounded-xl p-5 space-y-4" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1f1f1f' }}>
                            <p className="text-white font-semibold text-sm">Beli Produk</p>

                            <div>
                                <label className="block text-xs text-zinc-500 mb-2">Jumlah</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white font-bold text-lg transition"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #222' }}>−</button>
                                    <span className="text-white font-bold text-lg w-8 text-center">{qty}</span>
                                    <button onClick={() => setQty(q => inStock ? Math.min(product.stock, q + 1) : q + 1)}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white font-bold text-lg transition"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid #222' }}>+</button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center rounded-xl px-4 py-3"
                                style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                                <span className="text-indigo-300 text-sm font-medium">Total</span>
                                <span className="text-indigo-200 font-bold text-lg">
                                    Rp {(Number(product.price) * qty).toLocaleString('id-ID')}
                                </span>
                            </div>

                            {error && (
                                <p className="text-sm px-3 py-2 rounded-lg"
                                    style={{ background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                    {error}
                                </p>
                            )}

                            <button onClick={handleOrder} disabled={ordering || !inStock}
                                className="btn-primary w-full"
                                style={!inStock ? { opacity: 0.4, cursor:'not-allowed' } : {}}>
                                {ordering ? 'Memproses...' : inStock ? 'Pesan Sekarang' : 'Stok Habis'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
}
