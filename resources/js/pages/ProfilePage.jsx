import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ProfilePage() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm]       = useState({ phone: '', address: '', bio: '' });
    const [msg, setMsg]         = useState({ text: '', ok: true });
    const [saving, setSaving]   = useState(false);

    useEffect(() => {
        api.get('/profiles')
            .then(r => {
                const list = r.data.data || r.data;
                const mine = Array.isArray(list) ? list.find(p => p.user_id === user?.id) : list;
                if (mine) {
                    setProfile(mine);
                    setForm({ phone: mine.phone || '', address: mine.address || '', bio: mine.bio || '' });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setMsg({ text: '', ok: true });
        try {
            if (profile) await api.put(`/profiles/${profile.id}`, form);
            else         await api.post('/profiles', { ...form, user_id: user?.id });
            setMsg({ text: 'Profil berhasil disimpan.', ok: true });
            setEditing(false);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Gagal menyimpan.', ok: false });
        } finally { setSaving(false); }
    };

    const roleMap = {
        admin:  { label: 'Administrator', color: '#c4b5fd', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
        seller: { label: 'Seller',        color: '#6ee7b7', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
        buyer:  { label: 'Buyer',         color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)' },
    };
    const rm = roleMap[user?.role] ?? { label: user?.role, color: '#888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };

    const fields = [
        { key: 'phone',   label: 'No. Telepon', placeholder: '08xxxxxxxxxx' },
        { key: 'address', label: 'Alamat',       placeholder: 'Jl. Contoh No. 1' },
        { key: 'bio',     label: 'Bio',          placeholder: 'Ceritakan tentang diri Anda...', multiline: true },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Profil Saya</h1>
                <p className="text-zinc-500 text-sm">Kelola informasi akun Anda.</p>
            </div>

            {/* Identity card */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                {/* BG glow */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
                    style={{ background: rm.color }} />

                <div className="flex items-center gap-5 relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black relative"
                        style={{ background: rm.bg, border: `1px solid ${rm.border}`, color: rm.color }}>
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">{user?.name}</h2>
                        <p className="text-zinc-500 text-sm mb-2">{user?.email}</p>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: rm.bg, border: `1px solid ${rm.border}`, color: rm.color }}>
                            {rm.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detail card */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'#111', border:'1px solid #1a1a1a' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #1a1a1a' }}>
                    <h3 className="text-white font-semibold">Informasi Profil</h3>
                    {!editing && !loading && (
                        <button onClick={() => { setEditing(true); setMsg({ text:'', ok:true }); }}
                            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                            style={{ border:'1px solid #222' }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.03)' }} />
                            ))}
                        </div>
                    ) : editing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            {fields.map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">{f.label}</label>
                                    {f.multiline ? (
                                        <textarea rows={3} value={form[f.key]} placeholder={f.placeholder}
                                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            className="input-dark resize-none" />
                                    ) : (
                                        <input type="text" value={form[f.key]} placeholder={f.placeholder}
                                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            className="input-dark" />
                                    )}
                                </div>
                            ))}

                            {msg.text && (
                                <p className="text-sm px-3 py-2 rounded-lg"
                                    style={msg.ok
                                        ? { background:'rgba(34,197,94,0.08)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }
                                        : { background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                                    {msg.text}
                                </p>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setEditing(false); setMsg({ text:'', ok:true }); }}
                                    className="btn-ghost flex-1">Batal</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            {fields.map(f => (
                                <div key={f.key} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                                    style={{ background:'rgba(255,255,255,0.02)', border:'1px solid #1a1a1a' }}>
                                    <div className="min-w-0">
                                        <p className="text-zinc-600 text-xs mb-0.5">{f.label}</p>
                                        <p className={`text-sm ${profile?.[f.key] ? 'text-white' : 'text-zinc-700 italic'}`}>
                                            {profile?.[f.key] || 'Belum diisi'}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {!profile && (
                                <button onClick={() => setEditing(true)} className="btn-primary w-full mt-2">
                                    Lengkapi Profil
                                </button>
                            )}

                            {msg.text && (
                                <p className="text-sm px-3 py-2 rounded-lg"
                                    style={{ background:'rgba(34,197,94,0.08)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }}>
                                    {msg.text}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
