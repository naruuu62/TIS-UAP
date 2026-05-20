import React, { useEffect, useState } from 'react';
import api from '../api';

export default function SellerPanel() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [products, setProducts]         = useState([]);
    const [availTags, setAvailTags]       = useState([]);
    const [availCategories, setAvailCategories] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showForm, setShowForm]         = useState(false);
    const [form, setForm]                 = useState({ name: '', description: '', price: '', stock: '' });
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCats, setSelectedCats] = useState([]);
    const [msg, setMsg]                   = useState({ text: '', ok: true });
    const [saving, setSaving]             = useState(false);

    const fetchProducts = () => {
        setLoading(true);
        api.get('/products')
            .then(r => setProducts((r.data.data || r.data).filter(p => p.user_id === user?.id)))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
        api.get('/tags').then(r => setAvailTags(r.data.data || r.data)).catch(() => {});
        api.get('/categories').then(r => setAvailCategories(r.data.data || r.data)).catch(() => {});
    }, []);

    const toggleTag = (id) =>
        setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

    const toggleCat = (id) =>
        setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

    const handleCreate = async (e) => {
        e.preventDefault(); setSaving(true); setMsg({ text:'', ok:true });
        try {
            const res = await api.post('/products', {
                user_id: user.id,
                name: form.name,
                description: form.description,
                price: Number(form.price),
                stock: Number(form.stock),
            });
            const productId = res.data.data?.id;

            // Attach selected tags & categories
            if (productId) {
                await Promise.all([
                    ...selectedTags.map(tagId =>
                        api.put(`/products/${productId}/tag/${tagId}`)
                    ),
                    ...selectedCats.map(catId =>
                        api.put(`/products/${productId}/category/${catId}`)
                    ),
                ]);
            }

            setMsg({ text: 'Produk berhasil ditambahkan.', ok: true });
            setForm({ name: '', description: '', price: '', stock: '' });
            setSelectedTags([]);
            setSelectedCats([]);
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Gagal menambah produk.', ok: false });
        } finally { setSaving(false); }
    };

    const myProducts = products;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Produk Saya</h1>
                    <p className="text-zinc-500 text-sm">Kelola produk yang Anda jual di marketplace.</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setMsg({ text:'', ok:true }); }}
                    className={showForm ? 'btn-ghost' : 'btn-primary'}>
                    {showForm ? '✕ Batal' : '+ Tambah Produk'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Produk',  value: myProducts.length, color: '#22d3ee' },
                    { label: 'Stok > 0',      value: myProducts.filter(p => (p.stock ?? 1) > 0).length, color: '#22c55e' },
                    { label: 'Stok Habis',    value: myProducts.filter(p => p.stock === 0).length, color: '#f87171' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                        <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Form */}
            {showForm && (
                <div className="rounded-2xl p-6" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                    <h2 className="text-white font-bold mb-5">Tambah Produk Baru</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Produk *</label>
                            <input required type="text" placeholder="Contoh: Buku Kalkulus" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Deskripsi</label>
                            <textarea rows={2} placeholder="Deskripsi singkat produk..." value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="input-dark resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Harga (Rp) *</label>
                                <input required type="number" min="0" placeholder="50000" value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })} className="input-dark" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stok *</label>
                                <input required type="number" min="0" placeholder="10" value={form.stock}
                                    onChange={e => setForm({ ...form, stock: e.target.value })} className="input-dark" />
                            </div>
                        </div>

                        {/* Category selection */}
                        {availCategories.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-2">Kategori (opsional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availCategories.map(cat => {
                                        const active = selectedCats.includes(cat.id);
                                        return (
                                            <button key={cat.id} type="button"
                                                onClick={() => toggleCat(cat.id)}
                                                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                                style={active
                                                    ? { background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.5)', color:'#a5b4fc' }
                                                    : { background:'rgba(255,255,255,0.04)', border:'1px solid #333', color:'#555' }}>
                                                {active ? '✓ ' : ''}{cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedCats.length > 0 && (
                                    <p className="text-zinc-600 text-xs mt-1.5">{selectedCats.length} kategori dipilih</p>
                                )}
                            </div>
                        )}

                        {/* Tag selection */}
                        {availTags.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-2">Tags (opsional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availTags.map(tag => {
                                        const active = selectedTags.includes(tag.id);
                                        return (
                                            <button key={tag.id} type="button"
                                                onClick={() => toggleTag(tag.id)}
                                                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                                                style={active
                                                    ? { background:'rgba(168,85,247,0.2)', border:'1px solid rgba(168,85,247,0.5)', color:'#c084fc' }
                                                    : { background:'rgba(255,255,255,0.04)', border:'1px solid #333', color:'#555' }}>
                                                {active ? '✓ ' : ''}#{tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedTags.length > 0 && (
                                    <p className="text-zinc-600 text-xs mt-1.5">{selectedTags.length} tag dipilih</p>
                                )}
                            </div>
                        )}

                        {msg.text && (
                            <p className="text-sm px-3 py-2 rounded-lg"
                                style={msg.ok
                                    ? { background:'rgba(34,197,94,0.08)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }
                                    : { background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                {msg.text}
                            </p>
                        )}

                        <button type="submit" disabled={saving} className="btn-primary w-full">
                            {saving ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                    </form>
                </div>
            )}

            {/* Product grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-zinc-600 text-sm">{myProducts.length} produk</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                                <div className="h-3 bg-white/5 rounded w-1/2 mb-3" />
                                <div className="h-5 bg-white/5 rounded w-3/4 mb-4" />
                                <div className="h-3 bg-white/5 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : myProducts.length === 0 ? (
                    <div className="text-center py-16" style={{ border:'1px dashed #1f1f1f', borderRadius:16 }}>
                        <p className="text-zinc-600 text-sm">Belum ada produk. Tambahkan produk pertama Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myProducts.map(p => (
                            <div key={p.id} className="rounded-2xl p-5 group transition-all"
                                style={{ background:'#111', border:'1px solid #1a1a1a' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                            background: (p.stock ?? 1) > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            border: (p.stock ?? 1) > 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                                            color: (p.stock ?? 1) > 0 ? '#86efac' : '#fca5a5',
                                        }}>
                                        Stok {p.stock ?? '∞'}
                                    </span>
                                    <span className="text-xs text-zinc-700 font-mono">#{p.id}</span>
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-1 leading-snug">{p.name}</h3>
                                {p.description && (
                                    <p className="text-zinc-600 text-xs line-clamp-2 mb-3">{p.description}</p>
                                )}
                                {/* Categories */}
                                {(p.categories ?? []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-1">
                                        {p.categories.map(c => (
                                            <span key={c.id} className="text-xs px-1.5 py-0.5 rounded"
                                                style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
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
                                <p className="text-emerald-400 font-bold">
                                    Rp {Number(p.price).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
