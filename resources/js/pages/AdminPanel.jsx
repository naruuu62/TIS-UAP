import React, { useEffect, useState } from 'react';
import api from '../api';

const TABS = [
    { key: 'Users',    label: 'Users' },
    { key: 'Orders',   label: 'Orders' },
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
function EditableRow({ item, onSave, onDelete, onDetail, placeholder }) {
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
                        {onDetail && (
                            <button onClick={() => onDetail(item.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{ background:'rgba(255,255,255,0.05)', color:'#888', border:'1px solid #222' }}>
                                Detail
                            </button>
                        )}
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

/* ── Attach Category Modal ─────────────────────────────────── */
function AttachCategoryModal({ product, categories, onClose, onDone }) {
    const [saving, setSaving] = useState(null);
    const attached = product.categories?.map(c => c.id) ?? [];

    const toggle = async (catId) => {
        setSaving(catId);
        try {
            if (attached.includes(catId)) {
                await api.delete(`/products/${product.id}/category/${catId}`);
            } else {
                await api.put(`/products/${product.id}/category/${catId}`);
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
                        <p className="text-zinc-500 text-xs mb-0.5">Kelola Kategori Produk</p>
                        <h3 className="text-white font-bold text-sm truncate max-w-xs">{product.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-5">
                    {categories.length === 0 ? (
                        <p className="text-zinc-600 text-sm text-center py-4">Belum ada kategori. Buat kategori dulu di tab Kategori.</p>
                    ) : (
                        <div className="space-y-2">
                            {categories.map(c => {
                                const isAttached = attached.includes(c.id);
                                const isLoading  = saving === c.id;
                                return (
                                    <button key={c.id} onClick={() => toggle(c.id)} disabled={isLoading}
                                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                                        style={{
                                            background: isAttached ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.02)',
                                            border: isAttached ? '1px solid rgba(251,146,60,0.35)' : '1px solid #1f1f1f',
                                        }}>
                                        <span className={`text-sm font-medium ${isAttached ? 'text-orange-300' : 'text-zinc-400'}`}>
                                            {c.name}
                                        </span>
                                        <span className="text-xs" style={{ color: isAttached ? '#fb923c' : '#555' }}>
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

/* ── Generic Item Detail Modal (Category / Tag) ───────────── */
function ItemDetailModal({ item, type, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xs rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <p className="text-white font-bold">Detail {type}</p>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5 space-y-2">
                    {[
                        { label:'ID',   value:`#${item.id}` },
                        { label:'Nama', value: item.name },
                        { label:'Produk Terkait', value: item.products_count ?? '-' },
                    ].map(r => (
                        <div key={r.label} className="flex justify-between px-3 py-2 rounded-lg" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                            <span className="text-zinc-500 text-xs">{r.label}</span>
                            <span className="text-white text-xs font-medium">{r.value}</span>
                        </div>
                    ))}
                    <button onClick={onClose} className="btn-ghost w-full mt-2 text-sm">Tutup</button>
                </div>
            </div>
        </div>
    );
}

/* ── User Detail Modal ─────────────────────────────────────── */
function UserDetailModal({ user, onClose }) {
    const rs = roleStyle[user.role] ?? { bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)', color:'#888' };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <p className="text-white font-bold">Detail User</p>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5 space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
                            style={{ background: rs.bg, border:`1px solid ${rs.border}`, color: rs.color }}>
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-semibold">{user.name}</p>
                            <p className="text-zinc-500 text-xs">{user.email}</p>
                        </div>
                    </div>
                    {[
                        { label:'ID', value:`#${user.id}` },
                        { label:'Role', value: user.role },
                        { label:'Bergabung', value: user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-' },
                    ].map(r => (
                        <div key={r.label} className="flex justify-between px-3 py-2 rounded-lg" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                            <span className="text-zinc-500 text-xs">{r.label}</span>
                            <span className="text-white text-xs font-medium capitalize">{r.value}</span>
                        </div>
                    ))}
                    <button onClick={onClose} className="btn-ghost w-full mt-2 text-sm">Tutup</button>
                </div>
            </div>
        </div>
    );
}

/* ── Edit User Modal ───────────────────────────────────────── */
function EditUserModal({ user, onClose, onDone }) {
    const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, password: '' });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setErr('');
        try {
            const payload = { name: form.name, email: form.email, role: form.role };
            if (form.password) payload.password = form.password;
            await api.put(`/users/${user.id}`, payload);
            onDone();
        } catch (e) {
            setErr(e.response?.data?.message || 'Gagal menyimpan.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <div>
                        <p className="text-zinc-500 text-xs mb-0.5">Edit User</p>
                        <h3 className="text-white font-bold text-sm">{user.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-3">
                    {[
                        { key:'name',     label:'Nama',     type:'text' },
                        { key:'email',    label:'Email',    type:'email' },
                        { key:'password', label:'Password Baru (opsional)', type:'password', placeholder:'Kosongkan jika tidak diubah' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                            <input type={f.type} value={form[f.key]} placeholder={f.placeholder || ''}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                className="input-dark text-sm" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Role</label>
                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                            className="input-dark text-sm">
                            {['buyer','seller','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    {err && <p className="text-xs text-red-400">{err}</p>}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
                        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Edit Order Modal ──────────────────────────────────────── */
function EditOrderModal({ order, onClose, onDone }) {
    const [status, setStatus] = useState(order.status ?? 'completed');
    const [saving, setSaving] = useState(false);
    const [err, setErr]       = useState('');

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setErr('');
        try {
            await api.put(`/orders/${order.id}`, { status });
            onDone();
        } catch (e) {
            setErr(e.response?.data?.message || 'Gagal menyimpan.');
        } finally { setSaving(false); }
    };

    const statusOptions = [
        { value: 'pending',   label: 'Pending',   color: '#fbbf24' },
        { value: 'completed', label: 'Completed', color: '#86efac' },
        { value: 'cancelled', label: 'Cancelled', color: '#fca5a5' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <div>
                        <p className="text-zinc-500 text-xs mb-0.5">Edit Order</p>
                        <h3 className="text-white font-bold text-sm">Order #{order.id}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-4">
                    <div className="px-3 py-2 rounded-lg text-xs" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                        <span className="text-zinc-500">Pembeli: </span>
                        <span className="text-white font-medium">{order.user?.name ?? '-'}</span>
                        <span className="text-zinc-600 ml-2">· Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2">Status Order</label>
                        <div className="space-y-2">
                            {statusOptions.map(opt => (
                                <button key={opt.value} type="button"
                                    onClick={() => setStatus(opt.value)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                                    style={{
                                        background: status === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                                        border: status === opt.value ? `1px solid ${opt.color}50` : '1px solid #1f1f1f',
                                    }}>
                                    <span className="text-sm font-medium" style={{ color: status === opt.value ? opt.color : '#555' }}>
                                        {opt.label}
                                    </span>
                                    {status === opt.value && (
                                        <span className="text-xs" style={{ color: opt.color }}>Dipilih</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
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

/* ── Order Detail Modal ────────────────────────────────────── */
function OrderDetailModal({ order, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #222' }}>
                <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <div>
                        <p className="text-zinc-500 text-xs mb-0.5">Detail Order</p>
                        <h3 className="text-white font-bold text-sm">Order #{order.id}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label:'Pembeli', value: order.user?.name ?? '-' },
                            { label:'Status',  value: order.status ?? 'completed' },
                            { label:'Total',   value: `Rp ${Number(order.total_price).toLocaleString('id-ID')}` },
                            { label:'Tanggal', value: order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-' },
                        ].map(r => (
                            <div key={r.label} className="px-3 py-2 rounded-lg" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                                <p className="text-zinc-500 text-xs mb-0.5">{r.label}</p>
                                <p className="text-white text-sm font-medium capitalize">{r.value}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs mb-2">Item Produk</p>
                        <div className="space-y-2">
                            {(order.order_items ?? []).map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                                    style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                                    <div>
                                        <p className="text-white text-xs font-medium">{item.product?.name ?? `Produk #${item.product_id}`}</p>
                                        <p className="text-zinc-600 text-xs">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-emerald-400 text-xs font-semibold">
                                        Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-ghost w-full text-sm">Tutup</button>
                </div>
            </div>
        </div>
    );
}

/* ── AdminPanel ────────────────────────────────────────────── */
export default function AdminPanel() {
    const [tab, setTab]               = useState('Users');
    const [users, setUsers]           = useState([]);
    const [orders, setOrders]         = useState([]);
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags]             = useState([]);
    const [loading, setLoading]       = useState(false);
    const [msg, setMsg]               = useState({ text: '', ok: true });
    const [saving, setSaving]         = useState(false);
    const [newName, setNewName]       = useState('');
    // user create form
    const [showUserForm, setShowUserForm] = useState(false);
    const [userForm, setUserForm]         = useState({ name:'', email:'', password:'', role:'buyer' });

    // modals
    const [detailUser, setDetailUser]       = useState(null);
    const [editUser, setEditUser]           = useState(null);
    const [detailOrder, setDetailOrder]     = useState(null);
    const [editOrder, setEditOrder]         = useState(null);
    const [detailItem, setDetailItem]       = useState(null); // { data, type }
    const [editProduct, setEditProduct]             = useState(null);
    const [attachProduct, setAttachProduct]         = useState(null);
    const [attachCategoryProduct, setAttachCategoryProduct] = useState(null);

    useEffect(() => { fetchTab(tab); }, [tab]);

    // load semua counts untuk stats card
    useEffect(() => {
        Promise.all([
            api.get('/users').then(r => { const raw = r.data.data; setUsers(Array.isArray(raw) ? raw : (raw?.data ?? [])); }).catch(() => {}),
            api.get('/orders').then(r => setOrders(r.data.data || r.data)).catch(() => {}),
            api.get('/categories').then(r => setCategories(r.data.data || r.data)).catch(() => {}),
            api.get('/tags').then(r => setTags(r.data.data || r.data)).catch(() => {}),
        ]);
    }, []);

    const fetchTab = async (t) => {
        setLoading(true); setMsg({ text: '', ok: true });
        try {
            if (t === 'Users') {
                const r = await api.get('/users');
                const raw = r.data.data;
                setUsers(Array.isArray(raw) ? raw : (raw?.data ?? []));
            } else if (t === 'Orders') {
                const r = await api.get('/orders');
                setOrders(r.data.data || r.data);
            } else if (t === 'Produk') {
                const r = await api.get('/products');
                setProducts(r.data.data || r.data);
                const rt = await api.get('/tags');
                setTags(rt.data.data || rt.data);
                const rc = await api.get('/categories');
                setCategories(rc.data.data || rc.data);
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

    // ── User CRUD ──────────────────────────────────────────
    const createUser = async (e) => {
        e.preventDefault(); setSaving(true); setMsg({ text:'', ok:true });
        try {
            await api.post('/users', userForm);
            setMsg({ text:'User berhasil ditambahkan.', ok:true });
            setUserForm({ name:'', email:'', password:'', role:'buyer' });
            setShowUserForm(false);
            fetchTab('Users');
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Gagal.', ok:false });
        } finally { setSaving(false); }
    };

    const deleteUser = async (id) => {
        if (!confirm('Hapus user ini?')) return;
        try { await api.delete(`/users/${id}`); fetchTab('Users'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal hapus.'); }
    };

    // ── Order ──────────────────────────────────────────────
    const deleteOrder = async (id) => {
        if (!confirm('Hapus order ini?')) return;
        try { await api.delete(`/orders/${id}`); fetchTab('Orders'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal hapus.'); }
    };

    // ── Detail helpers ─────────────────────────────────────
    const showCategoryDetail = async (id) => {
        try { const r = await api.get(`/categories/${id}`); setDetailItem({ data: r.data.data, type:'Kategori' }); }
        catch {}
    };

    const showTagDetail = async (id) => {
        try { const r = await api.get(`/tags/${id}`); setDetailItem({ data: r.data.data, type:'Tag' }); }
        catch {}
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
                    { label: 'Orders',   value: orders.length,     color: '#22d3ee' },
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
                        <>
                            <div className="flex justify-end">
                                <button onClick={() => { setShowUserForm(!showUserForm); setMsg({ text:'', ok:true }); }}
                                    className={showUserForm ? 'btn-ghost text-sm px-4' : 'btn-primary text-sm px-4'}>
                                    {showUserForm ? 'Batal' : '+ Tambah User'}
                                </button>
                            </div>
                            {showUserForm && (
                                <form onSubmit={createUser} className="rounded-xl p-4 space-y-3" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #222' }}>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { key:'name',     label:'Nama',     type:'text',     placeholder:'Nama lengkap' },
                                            { key:'email',    label:'Email',    type:'email',    placeholder:'email@example.com' },
                                            { key:'password', label:'Password', type:'password', placeholder:'Min. 6 karakter' },
                                        ].map(f => (
                                            <div key={f.key} className={f.key === 'name' ? 'col-span-2' : ''}>
                                                <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                                                <input required type={f.type} placeholder={f.placeholder} value={userForm[f.key]}
                                                    onChange={e => setUserForm({ ...userForm, [f.key]: e.target.value })}
                                                    className="input-dark text-sm" />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs text-zinc-500 mb-1">Role</label>
                                            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                                className="input-dark text-sm">
                                                {['buyer','seller','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {msg.text && (
                                        <p className="text-xs px-3 py-2 rounded-lg"
                                            style={msg.ok ? { background:'rgba(34,197,94,0.08)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }
                                                         : { background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                            {msg.text}
                                        </p>
                                    )}
                                    <button type="submit" disabled={saving} className="btn-primary text-sm px-4">
                                        {saving ? '...' : 'Simpan User'}
                                    </button>
                                </form>
                            )}
                            {loading ? <div className="space-y-2">{skeleton}</div>
                            : users.length === 0 ? <p className="text-zinc-600 text-sm text-center py-10">Belum ada user.</p>
                            : (
                                <div className="space-y-2">
                                    {users.map(u => {
                                        const rs = roleStyle[u.role] ?? { bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)', color:'#888' };
                                        return (
                                            <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                                                style={{ border:'1px solid #1a1a1a' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                        style={{ background:rs.bg, border:`1px solid ${rs.border}`, color:rs.color }}>
                                                        {u.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{u.name}</p>
                                                        <p className="text-zinc-600 text-xs truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium capitalize"
                                                        style={{ background:rs.bg, border:`1px solid ${rs.border}`, color:rs.color }}>
                                                        {u.role}
                                                    </span>
                                                    <button onClick={() => setDetailUser(u)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                        style={{ background:'rgba(255,255,255,0.05)', color:'#888', border:'1px solid #222' }}>
                                                        Detail
                                                    </button>
                                                    <button onClick={() => setEditUser(u)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                        style={{ background:'rgba(99,102,241,0.1)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)' }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => deleteUser(u.id)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                        style={{ background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── ORDERS ── */}
                    {tab === 'Orders' && (
                        loading ? <div className="space-y-2">{skeleton}</div>
                        : orders.length === 0 ? <p className="text-zinc-600 text-sm text-center py-10">Belum ada order.</p>
                        : (
                            <div className="space-y-2">
                                {orders.map(o => (
                                    <div key={o.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                                        style={{ border:'1px solid #1a1a1a' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                                                style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8' }}>#{o.id}</span>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{o.user?.name ?? '-'}</p>
                                                <p className="text-zinc-600 text-xs">
                                                    Rp {Number(o.total_price).toLocaleString('id-ID')} · {(o.order_items ?? []).length} item
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                            <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                                                style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', color:'#86efac' }}>
                                                {o.status ?? 'completed'}
                                            </span>
                                            <button onClick={() => setDetailOrder(o)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                style={{ background:'rgba(255,255,255,0.05)', color:'#888', border:'1px solid #222' }}>
                                                Detail
                                            </button>
                                            <button onClick={() => setEditOrder(o)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                style={{ background:'rgba(99,102,241,0.1)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => deleteOrder(o.id)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                style={{ background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                                                    {p.user && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded"
                                                            style={{ background: 'rgba(52,211,153,0.08)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.2)' }}>
                                                            {p.user.name}
                                                        </span>
                                                    )}
                                                    {p.categories?.map(c => (
                                                        <span key={c.id} className="text-xs px-1.5 py-0.5 rounded"
                                                            style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>
                                                            {c.name}
                                                        </span>
                                                    ))}
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
                                            <button onClick={() => setAttachCategoryProduct(p)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                style={{ background: 'rgba(251,146,60,0.08)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,146,60,0.15)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,146,60,0.08)'}>
                                                Kategori
                                            </button>
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
                                            onDetail={showCategoryDetail}
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
                                            onDetail={showTagDetail}
                                            placeholder="Nama tag" />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Modals */}
            {detailItem  && <ItemDetailModal item={detailItem.data} type={detailItem.type} onClose={() => setDetailItem(null)} />}
            {detailUser  && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
            {editUser    && <EditUserModal user={editUser} onClose={() => setEditUser(null)}
                onDone={() => { setEditUser(null); fetchTab('Users'); }} />}
            {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
            {editOrder   && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)}
                onDone={() => { setEditOrder(null); fetchTab('Orders'); }} />}
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
            {attachCategoryProduct && (
                <AttachCategoryModal product={attachCategoryProduct} categories={categories}
                    onClose={() => setAttachCategoryProduct(null)}
                    onDone={() => {
                        api.get('/products').then(r => {
                            const list = r.data.data || r.data;
                            setProducts(list);
                            const updated = list.find(p => p.id === attachCategoryProduct.id);
                            if (updated) setAttachCategoryProduct(updated);
                        });
                    }} />
            )}
        </div>
    );
}
