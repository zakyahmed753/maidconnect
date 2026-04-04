// ─── Maids.js ───
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const CARD = { background:'#161616', border:'1px solid #222', borderRadius:8, overflow:'hidden', marginBottom:10 };
const statusColors = { pending:'#f0a050', approved:'#5dd6a8', rejected:'#ff6b6b', suspended:'#888' };

const Pill = ({ status }) => (
  <span style={{ fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', padding:'3px 8px', borderRadius:3, fontWeight:700, background:`${statusColors[status]||'#888'}18`, color:statusColors[status]||'#888', border:`1px solid ${statusColors[status]||'#888'}35` }}>
    {status}
  </span>
);

export function Maids() {
  const [maids, setMaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getMaids({ limit: 50 })
      .then(r => setMaids(r.data.maids))
      .catch(() => toast.error('Failed to load maids'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = maids.filter(m =>
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (userId, isSuspended) => {
    try {
      await adminAPI.suspendUser(userId, { isSuspended: !isSuspended, reason: 'Suspended by admin' });
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended');
      setMaids(prev => prev.map(m => m.user?._id === userId ? { ...m, user: { ...m.user, isSuspended: !isSuspended } } : m));
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#666', letterSpacing:'0.1em', textTransform:'uppercase' }}>{filtered.length} maids</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or nationality…"
          style={{ padding:'9px 14px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:13, outline:'none', width:260, fontFamily:"'Jost',sans-serif" }}/>
      </div>
      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}
      {filtered.map(maid => (
        <div key={maid._id} style={CARD}>
          <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, overflow:'hidden', border:'1px solid #333' }}>
              {maid.photos?.[0]?.url ? <img src={maid.photos[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{maid.fullName}</div>
              <div style={{ fontSize:11, color:'#555', marginTop:1 }}>{maid.nationality} · {maid.age}yrs · {maid.experienceYears}yr exp · ${maid.expectedSalary}/mo</div>
              <div style={{ fontSize:10, color:'#333', fontFamily:"'DM Mono',monospace", marginTop:1 }}>{maid.user?.email}</div>
            </div>
            <Pill status={maid.approvalStatus}/>
            <span style={{ fontSize:10, color: maid.user?.isSuspended ? '#ff6b6b' : '#5dd6a8', marginLeft:6 }}>
              {maid.user?.isSuspended ? '🔴 Suspended' : '🟢 Active'}
            </span>
            <button onClick={() => handleSuspend(maid.user?._id, maid.user?.isSuspended)}
              style={{ padding:'6px 12px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:4, color:'#ff6b6b', fontSize:11, fontWeight:600, cursor:'pointer', marginLeft:8, fontFamily:"'Jost',sans-serif" }}>
              {maid.user?.isSuspended ? 'Unsuspend' : 'Suspend'}
            </button>
          </div>
          <div style={{ padding:'0 15px 10px', display:'flex', gap:4, flexWrap:'wrap' }}>
            {(maid.skills||[]).map(s => <span key={s} style={{ fontSize:9, color:'#555', background:'#1e1e1e', padding:'2px 6px', borderRadius:2 }}>{s}</span>)}
            <span style={{ marginLeft:'auto', fontSize:9, color:'#444', fontFamily:"'DM Mono',monospace" }}>
              Sub: {maid.subscription?.status || 'none'} · {maid.subscription?.plan || '—'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HouseWives.js ───
export function HouseWives() {
  const [hws, setHws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getHouseWives({ limit:50 })
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

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>
      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}
      {hws.map(hw => (
        <div key={hw._id} style={CARD}>
          <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8c97a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👩</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{hw.fullName}</div>
              <div style={{ fontSize:11, color:'#555' }}>{hw.user?.email} · {hw.city || 'Egypt'}</div>
              <div style={{ fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", marginTop:1 }}>
                {hw.savedMaids?.length||0} saved · {hw.hiredMaids?.length||0} hired · Joined {new Date(hw.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span style={{ fontSize:10, color: hw.user?.isSuspended ? '#ff6b6b' : '#5dd6a8' }}>
              {hw.user?.isSuspended ? '🔴 Suspended' : '🟢 Active'}
            </span>
            <button onClick={() => handleSuspend(hw.user?._id, hw.user?.isSuspended)}
              style={{ padding:'6px 12px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:4, color:'#ff6b6b', fontSize:11, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
              {hw.user?.isSuspended ? 'Unsuspend' : 'Suspend'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Payments.js ───
export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPayments({ status: filter || undefined, limit:50 });
      setPayments(res.data.payments);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  const statusC = { completed:'#5dd6a8', pending:'#f0a050', failed:'#ff6b6b', refunded:'#888' };
  const methodIcons = { fawry:'🏧', vodafone_cash:'📱', instapay:'💸', amazon_pay:'🛒' };

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>
      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        {['','completed','pending','failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'7px 14px', borderRadius:5, border:`1px solid ${filter===s?'#c9a84c':'#2a2a2a'}`, background:filter===s?'rgba(201,168,76,0.12)':'#161616', color:filter===s?'#e8c97a':'#555', fontSize:11, cursor:'pointer', fontFamily:"'Jost',sans-serif", textTransform:'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
        <div style={{ marginLeft:'auto', fontFamily:"'DM Mono',monospace", fontSize:10, color:'#555', alignSelf:'center' }}>
          Total EGP: {payments.filter(p=>p.status==='completed').reduce((a,p)=>a+p.amount,0).toLocaleString()}
        </div>
      </div>
      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}
      {payments.map(p => (
        <div key={p._id} style={{ ...CARD, marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' }}>
            <div style={{ fontSize:22 }}>{methodIcons[p.method] || '💳'}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>
                {p.user?.name} — <span style={{ color:'#c9a84c', textTransform:'capitalize' }}>{p.type}</span>
              </div>
              <div style={{ fontSize:11, color:'#555', marginTop:1 }}>
                {p.method?.replace('_',' ')} · {p.subscriptionPlan || '—'} · {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:'#e8c97a' }}>EGP {p.amount?.toLocaleString()}</div>
              <span style={{ fontSize:9, padding:'2px 7px', borderRadius:2, background:`${statusC[p.status]||'#888'}18`, color:statusC[p.status]||'#888', border:`1px solid ${statusC[p.status]||'#888'}35`, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>
                {p.status}
              </span>
            </div>
          </div>
        </div>
      ))}
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
