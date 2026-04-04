import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e1e1e', border:'1px solid #333', borderRadius:6, padding:'8px 12px' }}>
      <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:13, color:p.color, fontWeight:600 }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `EGP ${p.value.toLocaleString()}` : p.value}</div>
      ))}
    </div>
  );
};

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

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = (stats.monthlyBreakdown || []).map(d => ({
    month: monthNames[(d._id.month || 1) - 1],
    revenue: d.total,
    transactions: d.count
  }));

  // Fallback demo data if no real data yet
  const displayData = chartData.length ? chartData : [
    { month:'Jan', revenue:8820, transactions:18 },
    { month:'Feb', revenue:13230, transactions:27 },
    { month:'Mar', revenue:18620, transactions:38 },
    { month:'Apr', revenue:26460, transactions:54 },
  ];

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon="👩" label="Total Maids"     value={stats.totalMaids}     color={GOLD}  sub={`${stats.activeMaids} active`} />
        <StatCard icon="🏠" label="House Wives"     value={stats.totalHW}        color={BLUE}  sub="Registered" />
        <StatCard icon="⏳" label="Pending Review"  value={stats.pendingMaids}   color={RED}   sub="Needs action" />
        <StatCard icon="🤝" label="Total Hires"     value={stats.totalHires}     color={GREEN} sub="Confirmed" />
        <StatCard icon="💰" label="Monthly Revenue" value={`EGP ${(stats.monthlyRevenue||0).toLocaleString()}`} color={GOLD} />
        <StatCard icon="🏦" label="Total Revenue"   value={`EGP ${(stats.totalRevenue||0).toLocaleString()}`}  color={GREEN} />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
        {/* Revenue chart */}
        <div style={CARD_STYLE}>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#e8c97a', marginBottom:16, fontFamily:"'DM Mono',monospace" }}>Revenue Trend (EGP)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c9a84c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={customTooltip}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#c9a84c" fill="url(#revGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by type */}
        <div style={CARD_STYLE}>
          <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#e8c97a', marginBottom:16, fontFamily:"'DM Mono',monospace" }}>Revenue by Type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(stats.revenueByType||[]).map(d => ({ type: d._id==='subscription'?'Subscriptions':'Commissions', total: d.total, count: d.count }))}>
              <XAxis dataKey="type" tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={customTooltip}/>
              <Bar dataKey="total" name="Revenue" fill="#c9a84c" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
        {[
          { icon:'👩', label:'Review Pending Maids', count: stats.pendingMaids, href:'/approvals', color:RED },
          { icon:'💳', label:'Pending Payments', count: stats.pendingPayments, href:'/payments', color:GOLD },
          { icon:'📢', label:'Broadcast Message', href:'/notifications', color:BLUE },
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
