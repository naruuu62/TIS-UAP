import React, { useEffect, useState } from 'react';
import api from '../api';

const TABS = [
    { key: 'Users',    label: 'Users' },
    { key: 'Produk',   label: 'Produk' },
    { key: 'Kategori', label: 'Kategori' },
    { key: 'Tags',     label: 'Tags' },
];

const roleStyle = {
    admin:  { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', color: '#c4b5fd' },
    seller: { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  color: '#6ee7b7' },
    buyer:  { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)',  color: '#a5b4fc' },
};

/* ── Reusable inline edit row ──────────────────────────────── */
function EditableRow({ item, onSave, onDelete, placeholder }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal]         = useState(item.name);
    const [saving, setSaving]   = useState(false);

    const save = async () => {
        setSaving(true);
        await onSave(item.id, val);
        setSaving(false);
        setEditing(false);
    };

    return (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors"
            style={{ border: '1px solid #1a1a1a' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>#{item.id}</span>
                {editing ? (
                    <input value={val} onChange={e => setVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                        autoFocus className="input-dark text-xs py-1.5 flex-1" placeholder={placeholder} />
                ) : (
                    <span className="text-white text-sm font-medium truncate">{item.name}</span>
                )}
                {item.products_count !== undefined && !editing && (
                    <span className="text-zinc-600 text-xs flex-shrink-0">{item.products_count} produk</span>
                )}
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {editing ? (
                    <>
                        <button onClick={save} disabled={saving}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                            {saving ? '...' : 'Simpan'}
                        </button>
                        <button onClick={() => { setEditing(false); setVal(item.name); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#555', border: '1px solid #222' }}>
                            Batal
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setEditing(true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                            Edit
                        </button>
                        <button onClick={() => onDelete(item.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                            Hapus
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── Attach Tag Modal ──────────────────────────────────────── */
function AttachTagModal({ product, tags, onClose, onDone }) {
    const [saving, setSaving]   = useState(null);
    const attached = product.tags?.map(t => t.id) ?? [];

    const toggle = async (tagId) => {
        setSaving(tagId);
        try {
            if (attached.includes(tagId)) {
                await api.delete(`/products/${product.id}/tag/${tagId}`);
            } else {
                await api.put(`/products/${product.id}/tag/${tagId}`);
            }
            onDone();
        } catch {}
        setSaving(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                style={{ background: '#111', border: '1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                        <p className="text-zinc-500 text-xs mb-0.5">Kelola Tag Produk</p>
                        <h3 className="text-white font-bold text-sm truncate max-w-xs">{product.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-5">
                    {tags.length === 0 ? (
                        <p className="text-zinc-600 text-sm text-center py-4">Belum ada tag. Buat tag dulu di tab Tags.</p>
                    ) : (
                        <div className="space-y-2">
                            {tags.map(t => {
                                const isAttached = attached.includes(t.id);
                                const isLoading  = saving === t.id;
                                return (
                                    <button key={t.id} onClick={() => toggle(t.id)} disabled={isLoading}
                                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                                        style={{
                                            background: isAttached ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                                            border: isAttached ? '1px solid rgba(99,102,241,0.35)' : '1px solid #1f1f1f',
                                        }}>
                                        <span className={`text-sm font-medium ${isAttached ? 'text-indigo-300' : 'text-zinc-400'}`}>
                                            {t.name}
                                        </span>
                                        <span className="text-xs">
                                            {isLoading ? '...' : isAttached ? 'Terpasang' : '+ Pasang'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <button onClick={onClose} className="btn-ghost w-full mt-4 text-sm">Selesai</button>
                </div>
            </div>
        </div>
    );
}

/* ── Edit Product Modal ────────────────────────────────────── */
function EditProductModal({ product, onClose, onDone }) {
    const [form, setForm]     = useState({
        name: product.name, description: product.description || '',
        price: product.price, stock: product.stock ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr]       = useState('');

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setErr('');
        try {
            await api.put(`/products/${product.id}`, {
                name: form.name, description: form.description,
                price: Number(form.price), stock: Number(form.stock),
            });
            onDone();
        } catch (e) {
            setErr(e.response?.data?.message || 'Gagal menyimpan.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                style={{ background: '#111', border: '1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                        <p className="text-zinc-500 text-xs mb-0.5">Edit Produk</p>
                        <h3 className="text-white font-bold text-sm truncate max-w-xs">{product.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-3">
                    {[
                        { key: 'name',        label: 'Nama Produk', type: 'text' },
                        { key: 'description', label: 'Deskripsi',   type: 'text' },
                        { key: 'price',       label: 'Harga (Rp)',  type: 'number' },
                        { key: 'stock',       label: 'Stok',        type: 'number' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                            <input type={f.type} value={form[f.key]}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                className="input-dark text-sm" />
                        </div>
                    ))}
                    {err && <p className="text-xs text-red-400">{err}</p>}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
                        <button type="submit" disabled={saving} className="btn-primary flex-1">
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── AdminPanel ────────────────────────────────────────────── */
export default function AdminPanel() {
    const [tab, setTab]               = useState('Users');
    const [users, setUsers]           = useState([]);
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags]             = useState([]);
    const [loading, setLoading]       = useState(false);
    const [msg, setMsg]               = useState({ text: '', ok: true });
    const [saving, setSaving]         = useState(false);
    const [newName, setNewName]       = useState('');

    // modals
    const [editProduct, setEditProduct]   = useState(null);
    const [attachProduct, setAttachProduct] = useState(null);

    useEffect(() => { fetchTab(tab); }, [tab]);

    const fetchTab = async (t) => {
        setLoading(true); setMsg({ text: '', ok: true });
        try {
            if (t === 'Users') {
                const r = await api.get('/users');
                const raw = r.data.data;
                setUsers(Array.isArray(raw) ? raw : (raw?.data ?? []));
            } else if (t === 'Produk') {
                const r = await api.get('/products');
                setProducts(r.data.data || r.data);
                // also fetch tags for the attach modal
                const rt = await api.get('/tags');
                setTags(rt.data.data || rt.data);
            } else if (t === 'Kategori') {
                const r = await api.get('/categories');
                setCategories(r.data.data || r.data);
            } else {
                const r = await api.get('/tags');
                setTags(r.data.data || r.data);
            }
        } catch {}
        setLoading(false);
    };

    // ── Category CRUD ──────────────────────────────────────
    const createCategory = async (e) => {
        e.preventDefault(); setSaving(true); setMsg({ text: '', ok: true });
        try {
            await api.post('/categories', { name: newName });
            setMsg({ text: 'Kategori berhasil ditambahkan.', ok: true });
            setNewName('');
            fetchTab('Kategori');
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Gagal.', ok: false });
        } finally { setSaving(false); }
    };

    const updateCategory = async (id, name) => {
        try { await api.put(`/categories/${id}`, { name }); fetchTab('Kategori'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal update.'); }
    };

    const deleteCategory = async (id) => {
        if (!confirm('Hapus kategori ini?')) return;
        try { await api.delete(`/categories/${id}`); fetchTab('Kategori'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal hapus.'); }
    };

    // ── Tag CRUD ───────────────────────────────────────────
    const createTag = async (e) => {
        e.preventDefault(); setSaving(true); setMsg({ text: '', ok: true });
        try {
            await api.post('/tags', { name: newName });
            setMsg({ text: 'Tag berhasil ditambahkan.', ok: true });
            setNewName('');
            fetchTab('Tags');
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Gagal.', ok: false });
        } finally { setSaving(false); }
    };

    const updateTag = async (id, name) => {
        try { await api.put(`/tags/${id}`, { name }); fetchTab('Tags'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal update.'); }
    };

    const deleteTag = async (id) => {
        if (!confirm('Hapus tag ini?')) return;
        try { await api.delete(`/tags/${id}`); fetchTab('Tags'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal hapus.'); }
    };

    // ── Product ────────────────────────────────────────────
    const deleteProduct = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        try { await api.delete(`/products/${id}`); fetchTab('Produk'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal hapus.'); }
    };

    const skeleton = [...Array(4)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
    ));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Panel Admin</h1>
                <p className="text-zinc-500 text-sm">Kelola users, produk, kategori, dan tags.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Users',    value: users.length,      color: '#a78bfa' },
                    { label: 'Produk',   value: products.length,   color: '#22d3ee' },
                    { label: 'Kategori', value: categories.length, color: '#fb923c' },
                    { label: 'Tags',     value: tags.length,       color: '#f472b6' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                        <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Main card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                {/* Tabs */}
                <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); setNewName(''); setMsg({ text: '', ok: true }); }}
                            className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative flex-shrink-0"
                            style={{ color: tab === t.key ? '#fff' : '#555' }}>
                            <span>{t.label}</span>
                            {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-4">

                    {/* ── USERS ── */}
                    {tab === 'Users' && (
                        loading ? <div className="space-y-2">{skeleton}</div>
                        : users.length === 0 ? <p className="text-zinc-600 text-sm text-center py-10">Belum ada user.</p>
                        : (
                            <div className="space-y-2">
                                {users.map(u => {
                                    const rs = roleStyle[u.role] ?? { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#888' };
                                    return (
                                        <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                                            style={{ border: '1px solid #1a1a1a' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                                    style={{ background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color }}>
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{u.name}</p>
                                                    <p className="text-zinc-600 text-xs">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-0.5 rounded-full border font-medium capitalize"
                                                style={{ background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color }}>
                                                {u.role}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* ── PRODUK ── */}
                    {tab === 'Produk' && (
                        loading ? <div className="space-y-2">{skeleton}</div>
                        : products.length === 0 ? <p className="text-zinc-600 text-sm text-center py-10">Belum ada produk.</p>
                        : (
                            <div className="space-y-2">
                                {products.map(p => (
                                    <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                                        style={{ border: '1px solid #1a1a1a' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                                                #{p.id}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{p.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="text-zinc-600 text-xs">
                                                        Rp {Number(p.price).toLocaleString('id-ID')} · Stok {p.stock ?? '-'}
                                                    </span>
                                                    {p.tags?.map(t => (
                                                        <span key={t.id} className="text-xs px-1.5 py-0.5 rounded"
                                                            style={{ background: 'rgba(244,114,182,0.1)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.2)' }}>
                                                            {t.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                            <button onClick={() => setAttachProduct(p)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                style={{ background: 'rgba(244,114,182,0.08)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.2)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,114,182,0.15)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,114,182,0.08)'}>
                                                Tags
                                            </button>
                                            <button onClick={() => setEditProduct(p)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                                                Edit
                                            </button>
                                            <button onClick={() => deleteProduct(p.id)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* ── KATEGORI ── */}
                    {tab === 'Kategori' && (
                        <>
                            <form onSubmit={createCategory} className="flex gap-2">
                                <input required placeholder="Nama kategori baru" value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="input-dark flex-1 text-sm" />
                                <button type="submit" disabled={saving} className="btn-primary px-4 text-sm">
                                    {saving ? '...' : '+ Tambah'}
                                </button>
                            </form>
                            {msg.text && (
                                <p className="text-xs px-3 py-2 rounded-lg"
                                    style={msg.ok
                                        ? { background: 'rgba(34,197,94,0.08)', color: '#86efac', border: '1px solid rgba(34,197,94,0.2)' }
                                        : { background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    {msg.text}
                                </p>
                            )}
                            {loading ? <div className="space-y-2">{skeleton}</div>
                            : categories.length === 0 ? <p className="text-zinc-600 text-sm text-center py-8">Belum ada kategori.</p>
                            : (
                                <div className="space-y-2">
                                    {categories.map(c => (
                                        <EditableRow key={c.id} item={c}
                                            onSave={updateCategory} onDelete={deleteCategory}
                                            placeholder="Nama kategori" />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── TAGS ── */}
                    {tab === 'Tags' && (
                        <>
                            <form onSubmit={createTag} className="flex gap-2">
                                <input required placeholder="Nama tag baru" value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="input-dark flex-1 text-sm" />
                                <button type="submit" disabled={saving} className="btn-primary px-4 text-sm">
                                    {saving ? '...' : '+ Tambah'}
                                </button>
                            </form>
                            {msg.text && (
                                <p className="text-xs px-3 py-2 rounded-lg"
                                    style={msg.ok
                                        ? { background: 'rgba(34,197,94,0.08)', color: '#86efac', border: '1px solid rgba(34,197,94,0.2)' }
                                        : { background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    {msg.text}
                                </p>
                            )}
                            {loading ? <div className="space-y-2">{skeleton}</div>
                            : tags.length === 0 ? <p className="text-zinc-600 text-sm text-center py-8">Belum ada tag.</p>
                            : (
                                <div className="space-y-2">
                                    {tags.map(t => (
                                        <EditableRow key={t.id} item={t}
                                            onSave={updateTag} onDelete={deleteTag}
                                            placeholder="Nama tag" />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Modals */}
            {editProduct && (
                <EditProductModal product={editProduct} onClose={() => setEditProduct(null)}
                    onDone={() => { setEditProduct(null); fetchTab('Produk'); }} />
            )}
            {attachProduct && (
                <AttachTagModal product={attachProduct} tags={tags} onClose={() => setAttachProduct(null)}
                    onDone={() => {
                        api.get('/products').then(r => {
                            const list = r.data.data || r.data;
                            setProducts(list);
                            const updated = list.find(p => p.id === attachProduct.id);
                            if (updated) setAttachProduct(updated);
                        });
                    }} />
            )}
        </div>
    );
}
