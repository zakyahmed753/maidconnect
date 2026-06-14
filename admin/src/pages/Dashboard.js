import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const CARD_STYLE = { background:'#161616', border:'1px solid #222', borderRadius:8, padding:20 };
const GOLD = '#e8c97a'; const GREEN = '#5dd6a8'; const RED = '#ff6b6b'; const BLUE = '#6b9fff';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ ...CARD_STYLE, display:'flex', alignItems:'center', gap:14 }}>
    <div style={{ width:46, height:46, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:'#666', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:3 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:'#444', marginTop:2 }}>{sub}</div>}
    </div>
  </div>
);


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:'#555', padding:40, textAlign:'center' }}>Loading dashboard…</div>;
  if (!stats)  return <div style={{ color:'#ff6b6b', padding:40, textAlign:'center' }}>Failed to load stats</div>;

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&display=swap');`}</style>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon="👩" label="Total Maids"    value={stats.totalMaids}   color={GOLD}  sub={`${stats.activeMaids} active`} />
        <StatCard icon="🏠" label="House Wives"    value={stats.totalHW}      color={BLUE}  sub="Registered" />
        <StatCard icon="⏳" label="Pending Review" value={stats.pendingMaids} color={RED}   sub="Needs action" />
        <StatCard icon="🤝" label="Total Hires"    value={stats.totalHires}   color={GREEN} sub="Confirmed" />
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
        {[
          { icon:'👩', label:'Review Pending Maids', count: stats.pendingMaids, href:'/approvals', color:RED },
          { icon:'💳', label:'Pending Payments',     count: stats.pendingPayments, href:'/payments', color:GOLD },
          { icon:'📢', label:'Broadcast Message',    href:'/notifications', color:BLUE },
        ].map(a => (
          <a key={a.label} href={a.href} style={{ ...CARD_STYLE, display:'flex', alignItems:'center', gap:10, textDecoration:'none', transition:'all 0.2s', cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='#c9a84c'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#222'}>
            <span style={{ fontSize:18 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize:12, color:'#ccc', fontWeight:500 }}>{a.label}</div>
              {a.count !== undefined && <div style={{ fontSize:18, color:a.color, fontFamily:"'Cormorant Garamond',serif", fontWeight:700, marginTop:2 }}>{a.count}</div>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
