// ─── Maids.js ───
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import MaidProfile from './MaidProfile';

const CARD = { background:'#161616', border:'1px solid #222', borderRadius:8, overflow:'hidden', marginBottom:10 };
const statusColors = { pending:'#f0a050', approved:'#5dd6a8', rejected:'#ff6b6b', suspended:'#888' };

const Pill = ({ status }) => (
  <span style={{ fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', padding:'3px 8px', borderRadius:3, fontWeight:700, background:`${statusColors[status]||'#888'}18`, color:statusColors[status]||'#888', border:`1px solid ${statusColors[status]||'#888'}35` }}>
    {status}
  </span>
);

export function Maids() {
  const [maids,       setMaids]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected,    setSelected]    = useState(null);

  useEffect(() => {
    adminAPI.getMaids({ limit: 100 })
      .then(r => setMaids(r.data.maids))
      .catch(() => toast.error('Failed to load maids'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = maids.filter(m => {
    const matchSearch = !search || m.fullName?.toLowerCase().includes(search.toLowerCase()) || m.nationality?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || m.approvalStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdate = (maidId, patch) => {
    if (patch === null) {
      setMaids(prev => prev.filter(m => m._id !== maidId));
      setSelected(prev => prev?._id === maidId ? null : prev);
    } else {
      setMaids(prev => prev.map(m => m._id === maidId ? { ...m, ...patch } : m));
      setSelected(prev => prev?._id === maidId ? { ...prev, ...patch } : prev);
    }
  };

  const statusColors = { pending:'#f0a050', approved:'#5dd6a8', rejected:'#ff6b6b', suspended:'#888' };

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#666', letterSpacing:'0.1em', textTransform:'uppercase', marginRight:4 }}>{filtered.length} maids</div>
        {['','pending','approved','rejected','suspended'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding:'6px 12px', borderRadius:4, border:`1px solid ${filterStatus===s?'#c9a84c':'#2a2a2a'}`, background:filterStatus===s?'rgba(201,168,76,0.12)':'#161616', color:filterStatus===s?'#e8c97a':'#555', fontSize:11, cursor:'pointer', fontFamily:"'Jost',sans-serif", textTransform:'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or nationality…"
          style={{ marginLeft:'auto', padding:'8px 14px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:13, outline:'none', width:240, fontFamily:"'Jost',sans-serif" }}/>
      </div>

      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}

      {filtered.map(maid => (
        <div key={maid._id} style={{ ...CARD, cursor:'pointer', transition:'border-color 0.15s' }}
          onClick={() => setSelected(maid)}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c40'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
          <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px' }}>
            {/* Avatar */}
            <div style={{ width:44, height:44, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, overflow:'hidden', border:'1px solid #333' }}>
              {maid.photos?.[0]?.url ? <img src={maid.photos[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
            </div>
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{maid.fullName}</div>
              <div style={{ fontSize:11, color:'#555', marginTop:1 }}>{maid.nationality} · {maid.age}yrs · {maid.experienceYears}yr exp · EGP {(maid.expectedSalary||0).toLocaleString()}/mo</div>
              <div style={{ fontSize:10, color:'#333', fontFamily:"'DM Mono',monospace", marginTop:1 }}>{maid.user?.email}</div>
            </div>
            {/* Badges */}
            <div style={{ display:'flex', gap:5, alignItems:'center', flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <Pill status={maid.approvalStatus}/>
              <span style={{ fontSize:9, padding:'3px 8px', borderRadius:3, fontWeight:700, background:`${statusColors[maid.verificationStatus]||'#888'}15`, color:statusColors[maid.verificationStatus]||'#888', border:`1px solid ${statusColors[maid.verificationStatus]||'#888'}30` }}>
                id: {maid.verificationStatus || 'unverified'}
              </span>
              <span style={{ fontSize:9, padding:'3px 8px', borderRadius:3, fontWeight:700, background:'rgba(201,168,76,0.1)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.25)' }}>
                sub: {maid.subscription?.status || 'none'}
              </span>
              {maid.user?.isSuspended && <span style={{ fontSize:9, color:'#ff6b6b' }}>🔴</span>}
            </div>
            <div style={{ fontSize:11, color:'#444', marginLeft:8 }}>→</div>
          </div>
          {/* Skills row */}
          <div style={{ padding:'0 15px 10px', display:'flex', gap:4, flexWrap:'wrap' }}>
            {(maid.skills||[]).map(s => <span key={s} style={{ fontSize:9, color:'#555', background:'#1e1e1e', padding:'2px 6px', borderRadius:2 }}>{s}</span>)}
            <span style={{ marginLeft:'auto', fontSize:9, color:'#333', fontFamily:"'DM Mono',monospace" }}>
              📷 {(maid.photos||[]).length} photos · ⭐ {maid.rating?.toFixed(1)||'0.0'}
            </span>
          </div>
        </div>
      ))}

      {/* Profile Modal */}
      {selected && (
        <MaidProfile
          maid={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

// ─── Customers.js ───
const subColors = { active:'#5dd6a8', expired:'#ff6b6b', none:'#555' };

export function HouseWives() {
  const [hws,        setHws]        = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null); // hw._id with payment panel open
  const [offlineAmt, setOfflineAmt] = useState('');
  const [offlineNote,setOfflineNote]= useState('');
  const [paying,     setPaying]     = useState(null); // hw._id being processed

  useEffect(() => {
    adminAPI.getHouseWives({ limit:100 })
      .then(r => setHws(r.data.housewives))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSuspend = async (userId, isSuspended) => {
    try {
      await adminAPI.suspendUser(userId, { isSuspended: !isSuspended });
      toast.success('Updated');
      setHws(prev => prev.map(h => h.user?._id === userId ? { ...h, user: { ...h.user, isSuspended: !isSuspended } } : h));
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (userId, isDeleted) => {
    if (!window.confirm(isDeleted ? 'Restore this account?' : 'Soft-delete this account? Only admin can restore it.')) return;
    try {
      if (isDeleted) {
        await adminAPI.restoreUser(userId);
        toast.success('Account restored');
      } else {
        await adminAPI.deleteUser(userId, { reason: 'Admin removed account' });
        toast.success('Account deactivated');
      }
      setHws(prev => prev.map(h => h.user?._id === userId ? { ...h, user: { ...h.user, deletedAt: isDeleted ? null : new Date().toISOString() } } : h));
    } catch { toast.error('Failed'); }
  };

  const handleOfflineSub = async (hw) => {
    if (!window.confirm(`Record EGP ${offlineAmt || 1000} cash payment and activate subscription for ${hw.fullName}?`)) return;
    setPaying(hw._id);
    try {
      await adminAPI.customerOfflineSubscription(hw._id, {
        amount: offlineAmt ? Number(offlineAmt) : 1000,
        note: offlineNote || undefined,
      });
      toast.success('Subscription activated');
      const now = new Date();
      const endDate = new Date(now); endDate.setMonth(endDate.getMonth() + 1);
      setHws(prev => prev.map(h => h._id === hw._id
        ? { ...h, subscription: { status: 'active', startDate: now, endDate } }
        : h
      ));
      setExpanded(null);
      setOfflineAmt(''); setOfflineNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setPaying(null); }
  };

  const inp = { width:'100%', padding:'7px 10px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:4, color:'#f0ece4', fontSize:12, outline:'none', fontFamily:"'Jost',sans-serif", boxSizing:'border-box' };

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>
      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}
      {hws.map(hw => {
        const subStatus = hw.subscription?.status || 'none';
        const isExpanded = expanded === hw._id;
        return (
          <div key={hw._id} style={{ ...CARD, border: isExpanded ? '1px solid rgba(201,168,76,0.35)' : '1px solid #222' }}>
            <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8c97a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👩</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{hw.fullName}</div>
                <div style={{ fontSize:11, color:'#555' }}>{hw.user?.email} · {hw.city || 'Egypt'}</div>
                <div style={{ display:'flex', gap:5, marginTop:4, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:9, padding:'2px 7px', borderRadius:3, fontWeight:700, background:`${subColors[subStatus]||'#555'}18`, color:subColors[subStatus]||'#555', border:`1px solid ${subColors[subStatus]||'#555'}35`, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    sub: {subStatus}
                  </span>
                  {hw.subscription?.endDate && subStatus === 'active' && (
                    <span style={{ fontSize:9, color:'#555', fontFamily:"'DM Mono',monospace" }}>
                      expires {new Date(hw.subscription.endDate).toLocaleDateString()}
                    </span>
                  )}
                  <span style={{ fontSize:9, color:'#444', fontFamily:"'DM Mono',monospace" }}>
                    {hw.savedMaids?.length||0} saved · {hw.hiredMaids?.length||0} hired
                  </span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                <span style={{ fontSize:10, color: hw.user?.deletedAt ? '#888' : hw.user?.isSuspended ? '#ff6b6b' : '#5dd6a8' }}>
                  {hw.user?.deletedAt ? '⚫ Deleted' : hw.user?.isSuspended ? '🔴 Suspended' : '🟢 Active'}
                </span>
                <div style={{ display:'flex', gap:5 }}>
                  <button onClick={() => { setExpanded(isExpanded ? null : hw._id); setOfflineAmt(''); setOfflineNote(''); }}
                    style={{ padding:'5px 10px', background: isExpanded ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.06)', border:`1px solid rgba(201,168,76,${isExpanded?'0.5':'0.2'})`, borderRadius:4, color:'#c9a84c', fontSize:10, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
                    💵 Pay
                  </button>
                  <button onClick={() => handleSuspend(hw.user?._id, hw.user?.isSuspended)}
                    style={{ padding:'5px 10px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:4, color:'#ff6b6b', fontSize:10, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
                    {hw.user?.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                  <button onClick={() => handleDelete(hw.user?._id, !!hw.user?.deletedAt)}
                    style={{ padding:'5px 10px', background: hw.user?.deletedAt ? 'rgba(93,214,168,0.08)' : 'rgba(80,80,80,0.12)', border:`1px solid ${hw.user?.deletedAt ? 'rgba(93,214,168,0.3)' : 'rgba(80,80,80,0.3)'}`, borderRadius:4, color: hw.user?.deletedAt ? '#5dd6a8' : '#888', fontSize:10, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
                    {hw.user?.deletedAt ? '↩ Restore' : '🗑 Delete'}
                  </button>
                </div>
              </div>
            </div>

            {/* Offline subscription panel */}
            {isExpanded && (
              <div style={{ borderTop:'1px solid rgba(201,168,76,0.2)', padding:'14px 15px', background:'rgba(201,168,76,0.04)' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#c9a84c', marginBottom:10 }}>💵 Record Offline Cash Payment — Customer Subscription</div>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <input type="number" placeholder="Amount EGP (default 1000)" value={offlineAmt} onChange={e => setOfflineAmt(e.target.value)} style={{ ...inp, flex:1 }} />
                  <input placeholder="Admin note (optional)" value={offlineNote} onChange={e => setOfflineNote(e.target.value)} style={{ ...inp, flex:2 }} />
                </div>
                <button onClick={() => handleOfflineSub(hw)} disabled={paying === hw._id}
                  style={{ width:'100%', padding:'9px', background:'rgba(93,214,168,0.13)', border:'1px solid rgba(93,214,168,0.4)', borderRadius:5, color:'#5dd6a8', fontSize:12, fontWeight:700, cursor:paying===hw._id?'not-allowed':'pointer', fontFamily:"'Jost',sans-serif", opacity:paying===hw._id?0.6:1 }}>
                  {paying === hw._id ? '⏳ Activating…' : '✅ Confirm Cash Payment & Activate Subscription'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payments.js ───
export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [acting,   setActing]   = useState(null); // paymentId currently being confirmed/rejected

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPayments({ status: filter || undefined, limit: 100 });
      setPayments(res.data.payments);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  const handleConfirm = async (p) => {
    if (!window.confirm(`Confirm EGP ${p.amount?.toLocaleString()} cash payment from ${p.user?.name}?`)) return;
    setActing(p._id);
    try {
      if (p.type === 'customer_subscription') {
        await adminAPI.confirmCustomerOfflinePayment(p._id);
        toast.success('Customer subscription activated');
      } else {
        if (!p.maidProfile?._id) return toast.error('No maid profile linked');
        await adminAPI.offlinePayment(p.maidProfile._id, {
          plan: p.subscriptionPlan || 'monthly',
          amount: p.amount,
          note: 'Confirmed via Payments page',
        });
        toast.success('Maid subscription activated');
      }
      setPayments(prev => prev.map(x => x._id === p._id ? { ...x, status: 'completed' } : x));
    } catch { toast.error('Failed to confirm'); }
    finally { setActing(null); }
  };

  const handleReject = async (p) => {
    const reason = window.prompt(`Rejection reason for ${p.user?.name}:`, 'Receipt unclear. Please resubmit.');
    if (reason === null) return;
    setActing(p._id);
    try {
      await adminAPI.rejectOfflinePayment({ paymentId: p._id, reason });
      toast.success(`Receipt rejected — ${p.user?.name} notified`);
      setPayments(prev => prev.map(x => x._id === p._id ? { ...x, status: 'failed' } : x));
    } catch { toast.error('Failed to reject'); }
    finally { setActing(null); }
  };

  const statusC    = { completed: '#5dd6a8', pending: '#f0a050', failed: '#ff6b6b', refunded: '#888' };
  const methodIcons = { fawry: '🏧', vodafone_cash: '📱', instapay: '💸', amazon_pay: '🛒', paymob: '💳', cash_transfer: '💵' };

  const pendingCash = payments.filter(p => p.method === 'cash_transfer' && p.status === 'pending');

  return (
    <div style={{ fontFamily: "'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Pending cash receipts banner */}
      {pendingCash.length > 0 && (
        <div style={{ background: 'rgba(240,160,80,0.08)', border: '1px solid rgba(240,160,80,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📎</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0a050' }}>{pendingCash.length} pending cash receipt{pendingCash.length > 1 ? 's' : ''} awaiting confirmation</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Review the receipts below and confirm or reject each one.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['', 'completed', 'pending', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '7px 14px', borderRadius: 5, border: `1px solid ${filter === s ? '#c9a84c' : '#2a2a2a'}`, background: filter === s ? 'rgba(201,168,76,0.12)' : '#161616', color: filter === s ? '#e8c97a' : '#555', fontSize: 11, cursor: 'pointer', fontFamily: "'Jost',sans-serif", textTransform: 'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#555', alignSelf: 'center' }}>
          Total EGP: {payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0).toLocaleString()}
        </div>
      </div>

      {loading && <div style={{ color: '#555', textAlign: 'center', padding: 40 }}>Loading…</div>}

      {payments.map(p => {
        const isPendingCash = p.method === 'cash_transfer' && p.status === 'pending';
        return (
          <div key={p._id} style={{ ...CARD, marginBottom: 10, border: isPendingCash ? '1px solid rgba(240,160,80,0.4)' : '1px solid #222' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 22 }}>{methodIcons[p.method] || '💳'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  {p.user?.name}
                  {p.type === 'customer_subscription'
                    ? <span style={{ fontSize: 10, background: 'rgba(106,171,204,0.15)', color: '#6aabcc', border: '1px solid rgba(106,171,204,0.3)', borderRadius: 3, padding: '2px 7px', fontWeight: 700, letterSpacing: '0.05em' }}>👤 CUSTOMER</span>
                    : p.maidProfile?.fullName && <span style={{ color: '#666', fontSize: 11 }}>({p.maidProfile.fullName})</span>}
                  — <span style={{ color: '#c9a84c', textTransform: 'capitalize' }}>{p.type?.replace(/_/g, ' ')}</span>
                  {p.offlineByAdmin && <span style={{ fontSize: 9, background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 3, padding: '2px 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin recorded</span>}
                  {isPendingCash && <span style={{ fontSize: 9, background: 'rgba(240,160,80,0.15)', color: '#f0a050', border: '1px solid rgba(240,160,80,0.4)', borderRadius: 3, padding: '2px 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📎 Receipt submitted</span>}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>
                  {p.method?.replace(/_/g, ' ')} · {p.subscriptionPlan || '—'} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
                {p.adminNote && <div style={{ fontSize: 10, color: '#444', marginTop: 2, fontStyle: 'italic' }}>"{p.adminNote}"</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: '#e8c97a' }}>EGP {p.amount?.toLocaleString()}</div>
                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2, background: `${statusC[p.status] || '#888'}18`, color: statusC[p.status] || '#888', border: `1px solid ${statusC[p.status] || '#888'}35`, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
                  {p.status}
                </span>
              </div>
            </div>

            {/* Receipt image + actions for pending cash_transfer */}
            {isPendingCash && (
              <div style={{ borderTop: '1px solid rgba(240,160,80,0.2)', padding: '12px 14px', background: 'rgba(240,160,80,0.04)' }}>
                {p.receiptUrl ? (
                  <a href={p.receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 12 }}>
                    <img
                      src={p.receiptUrl}
                      alt="Payment receipt"
                      style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 6, border: '1px solid #2a2a2a', background: '#0e0e0e', cursor: 'zoom-in', display: 'block' }}
                    />
                    <div style={{ fontSize: 10, color: '#c9a84c', marginTop: 4 }}>🔍 Click to open full size</div>
                  </a>
                ) : (
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 12, fontStyle: 'italic' }}>No receipt image uploaded</div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleConfirm(p)}
                    disabled={acting === p._id}
                    style={{ flex: 1, padding: '9px', background: 'rgba(93,214,168,0.12)', border: '1px solid rgba(93,214,168,0.35)', borderRadius: 5, color: '#5dd6a8', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: acting === p._id ? 0.5 : 1 }}>
                    {acting === p._id ? '…' : '✅ Confirm & Activate'}
                  </button>
                  <button
                    onClick={() => handleReject(p)}
                    disabled={acting === p._id}
                    style={{ flex: 1, padding: '9px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 5, color: '#ff6b6b', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: acting === p._id ? 0.5 : 1 }}>
                    {acting === p._id ? '…' : '❌ Reject Receipt'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Notifications.js ───
export function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title || !body) return toast.error('Title and body required');
    setSending(true);
    try {
      const res = await adminAPI.broadcast({ title, body, targetRole: targetRole || undefined });
      toast.success(`Notification sent to ${res.data.sent} users`);
      setTitle(''); setBody(''); setTargetRole('');
    } catch { toast.error('Failed to send notification'); }
    finally { setSending(false); }
  };

  const inp = { width:'100%', padding:'11px 14px', background:'#1e1e1e', border:'1.5px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:14, outline:'none', fontFamily:"'Jost',sans-serif", boxSizing:'border-box' };

  return (
    <div style={{ fontFamily:"'Jost',sans-serif", maxWidth:540 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&display=swap');`}</style>
      <div style={{ background:'#161616', border:'1px solid #222', borderRadius:10, padding:24 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:'#f0ece4', marginBottom:4 }}>Broadcast Notification</div>
        <div style={{ fontSize:12, color:'#555', marginBottom:20 }}>Send a push notification to all users or a specific role</div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#666', marginBottom:5 }}>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={inp} placeholder="e.g. New features available!"/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#666', marginBottom:5 }}>Message Body</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3}
            style={{ ...inp, resize:'vertical' }} placeholder="Notification message…"/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#666', marginBottom:5 }}>Send To</label>
          <select value={targetRole} onChange={e=>setTargetRole(e.target.value)}
            style={{ ...inp, cursor:'pointer' }}>
            <option value="">All Users</option>
            <option value="maid">Maids Only</option>
            <option value="housewife">House Wives Only</option>
          </select>
        </div>
        <button onClick={handleBroadcast} disabled={sending}
          style={{ width:'100%', padding:13, background:'linear-gradient(135deg,#c9a84c,#e8c97a)', border:'none', borderRadius:5, color:'#1a1108', fontSize:14, fontWeight:700, cursor:sending?'not-allowed':'pointer', opacity:sending?0.6:1, fontFamily:"'Jost',sans-serif", letterSpacing:'0.04em' }}>
          {sending ? 'Sending…' : '📢 Send Notification'}
        </button>
      </div>
    </div>
  );
}

export default Maids;
