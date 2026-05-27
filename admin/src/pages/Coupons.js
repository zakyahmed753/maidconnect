import React, { useEffect, useState } from 'react';
import { adminAPI, couponsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CARD  = { background:'#161616', border:'1px solid #222', borderRadius:8, padding:'16px 18px', marginBottom:10 };
const INPUT = { padding:'9px 13px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:13, outline:'none', width:'100%', fontFamily:"'Jost',sans-serif", boxSizing:'border-box' };
const LABEL = { fontSize:11, color:'#555', letterSpacing:'0.07em', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:4, display:'block' };
const BTN   = { padding:'9px 18px', borderRadius:5, border:'none', cursor:'pointer', fontFamily:"'Jost',sans-serif", fontWeight:600, fontSize:13 };

const Pill = ({ active }) => (
  <span style={{ fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', padding:'3px 8px', borderRadius:3, fontWeight:700, background: active ? 'rgba(93,214,168,0.12)' : 'rgba(255,107,107,0.12)', color: active ? '#5dd6a8' : '#ff6b6b', border: `1px solid ${active ? '#5dd6a835' : '#ff6b6b35'}` }}>
    {active ? 'active' : 'inactive'}
  </span>
);

const EMPTY_FORM = { code:'', discountType:'percentage', discountValue:'', maxUses:'', expiresAt:'' };

export default function Coupons() {
  const [coupons,   setCoupons]   = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('admin');   // 'admin' | 'referrals'
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [creating,  setCreating]  = useState(false);
  const [showForm,  setShowForm]  = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, mRes] = await Promise.all([
        couponsAPI.adminList(),
        adminAPI.getMaids({ limit: 200 }),
      ]);
      setCoupons(cRes.data.coupons || []);
      const maidsWithCode = (mRes.data.maids || []).filter(m => m.referralCode);
      setReferrals(maidsWithCode);
    } catch {
      toast.error('Failed to load coupon data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) return toast.error('Code and discount value are required');
    setCreating(true);
    try {
      await couponsAPI.adminCreate({
        code:          form.code.trim().toUpperCase(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        maxUses:       form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt:     form.expiresAt || undefined,
      });
      toast.success('Coupon created');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await couponsAPI.adminToggle(id);
      setCoupons(prev => prev.map(c => c._id === id ? res.data.coupon : c));
      toast.success('Coupon updated');
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const adminCoupons = coupons.filter(c => c.type === 'admin');

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        {['admin', 'referrals'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...BTN, background: tab===t ? 'rgba(201,168,76,0.15)' : '#1a1a1a', color: tab===t ? '#e8c97a' : '#555', border: `1px solid ${tab===t ? '#c9a84c40' : '#2a2a2a'}` }}>
            {t === 'admin' ? '🏷 Admin Coupons' : '🎁 Maid Referral Codes'}
          </button>
        ))}
        {tab === 'admin' && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ ...BTN, marginLeft:'auto', background:'#c9a84c', color:'#1a1108' }}>
            {showForm ? '✕ Cancel' : '+ New Coupon'}
          </button>
        )}
      </div>

      {/* Create form */}
      {tab === 'admin' && showForm && (
        <div style={{ ...CARD, border:'1px solid #c9a84c40', marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#e8c97a', marginBottom:14 }}>Create Admin Coupon</div>
          <form onSubmit={handleCreate}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={LABEL}>Coupon Code *</label>
                <input style={INPUT} placeholder="e.g. SAVE20" value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label style={LABEL}>Discount Type *</label>
                <select style={{ ...INPUT }} value={form.discountType}
                  onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (EGP)</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Discount Value *</label>
                <input style={INPUT} type="number" min="1"
                  placeholder={form.discountType === 'percentage' ? '% e.g. 20' : 'EGP e.g. 100'}
                  value={form.discountValue}
                  onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Max Uses (optional)</label>
                <input style={INPUT} type="number" min="1" placeholder="Unlimited if empty"
                  value={form.maxUses}
                  onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Expires At (optional)</label>
                <input style={INPUT} type="date" value={form.expiresAt}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button type="submit" disabled={creating}
                style={{ ...BTN, background:'#c9a84c', color:'#1a1108', opacity: creating ? 0.6 : 1 }}>
                {creating ? 'Creating…' : 'Create Coupon'}
              </button>
              {form.code && (
                <div style={{ fontSize:12, color:'#666' }}>
                  Preview: <span style={{ color:'#e8c97a', fontFamily:"'DM Mono',monospace" }}>{form.code}</span>
                  {' · '}{form.discountValue}{form.discountType === 'percentage' ? '%' : ' EGP'} off
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}

      {/* Admin Coupons tab */}
      {tab === 'admin' && !loading && (
        <>
          <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>
            {adminCoupons.length} admin coupon{adminCoupons.length !== 1 ? 's' : ''}
          </div>
          {adminCoupons.length === 0 && (
            <div style={{ ...CARD, textAlign:'center', color:'#555', padding:40 }}>
              No admin coupons yet. Create one above.
            </div>
          )}
          {adminCoupons.map(c => (
            <div key={c._id} style={CARD}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                {/* Code */}
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:'#e8c97a', letterSpacing:2, minWidth:120 }}>
                  {c.code}
                </div>
                {/* Discount */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:'#f0ece4', fontWeight:600 }}>
                    {c.discountValue}{c.discountType === 'percentage' ? '%' : ' EGP'} off
                    <span style={{ fontSize:11, color:'#555', fontWeight:400 }}> · {c.discountType}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#555', marginTop:3, fontFamily:"'DM Mono',monospace" }}>
                    {c.usesCount} used
                    {c.maxUses !== null ? ` / ${c.maxUses} max` : ' · unlimited'}
                    {c.expiresAt ? ` · expires ${new Date(c.expiresAt).toLocaleDateString()}` : ' · no expiry'}
                  </div>
                </div>
                {/* Usage bar */}
                {c.maxUses !== null && (
                  <div style={{ width:100 }}>
                    <div style={{ height:4, background:'#2a2a2a', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(100, (c.usesCount / c.maxUses) * 100)}%`, background:'#c9a84c', borderRadius:2 }}/>
                    </div>
                    <div style={{ fontSize:9, color:'#555', marginTop:3, textAlign:'right', fontFamily:"'DM Mono',monospace" }}>
                      {Math.round((c.usesCount / c.maxUses) * 100)}%
                    </div>
                  </div>
                )}
                <Pill active={c.isActive} />
                <button onClick={() => handleToggle(c._id)}
                  style={{ ...BTN, padding:'6px 14px', background:'#1e1e1e', color: c.isActive ? '#ff6b6b' : '#5dd6a8', border:`1px solid ${c.isActive ? '#ff6b6b30' : '#5dd6a830'}`, fontSize:11 }}>
                  {c.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
              {/* Used by */}
              {c.usedBy?.length > 0 && (
                <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #222', fontSize:11, color:'#555' }}>
                  Used by {c.usedBy.length} user{c.usedBy.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Maid Referral Codes tab */}
      {tab === 'referrals' && !loading && (
        <>
          <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>
            {referrals.length} maid{referrals.length !== 1 ? 's' : ''} with referral code
          </div>
          {referrals.length === 0 && (
            <div style={{ ...CARD, textAlign:'center', color:'#555', padding:40 }}>
              No maids have generated a referral code yet.
            </div>
          )}
          {referrals.map(m => (
            <div key={m._id} style={CARD}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, border:'1px solid #333', overflow:'hidden' }}>
                  {m.photos?.[0]?.url ? <img src={m.photos[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{m.fullName}</div>
                  <div style={{ fontSize:11, color:'#555' }}>{m.nationality} · sub: {m.subscription?.status || 'none'}</div>
                </div>
                {/* Referral code */}
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, color:'#e8c97a', letterSpacing:2 }}>
                    {m.referralCode}
                  </div>
                  <div style={{ fontSize:11, color:'#5dd6a8', marginTop:2 }}>
                    {m.referralCount || 0} referral{(m.referralCount || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
