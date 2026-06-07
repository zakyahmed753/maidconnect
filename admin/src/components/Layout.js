import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const NAV = [
  { to: '/',             icon: '📊', label: 'Dashboard' },
  { to: '/maids',        icon: '👩', label: 'Maids' },
  { to: '/housewives',   icon: '👤', label: 'Customers' },
  { to: '/approvals',    icon: '✅', label: 'Approvals' },
  { to: '/payments',     icon: '💳', label: 'Payments' },
  { to: '/notifications',icon: '🔔', label: 'Notifications' },
  { to: '/support',      icon: '🎫', label: 'Support' },
  { to: '/coupons',      icon: '🏷', label: 'Coupons' },
  { to: '/areas',        icon: '📍', label: 'Areas' },
];

const S = {
  wrap:    { display:'flex', minHeight:'100vh', background:'#0f0c09', fontFamily:"'Jost',sans-serif" },
  sidebar: { width:220, background:'#161616', borderRight:'1px solid #2a2a2a', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' },
  logo:    { padding:'20px 18px 16px', borderBottom:'1px solid #2a2a2a' },
  logoT:   { fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:'#e8c97a' },
  logoS:   { fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#555', fontFamily:"'DM Mono',monospace", marginTop:2 },
  nav:     { flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2 },
  link:    { display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:5, textDecoration:'none', color:'#666', fontSize:13, fontWeight:500, transition:'all 0.15s' },
  activeL: { background:'rgba(201,168,76,0.12)', color:'#e8c97a', borderLeft:'2px solid #c9a84c' },
  bottom:  { padding:'14px 8px', borderTop:'1px solid #2a2a2a' },
  adminRow:{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px' },
  ava:     { width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8c97a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#1a1108', fontWeight:700 },
  name:    { fontSize:12, color:'#aaa', flex:1 },
  logoutB: { background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:16, padding:4 },
  main:    { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:  { padding:'14px 24px', background:'#111', borderBottom:'1px solid #222', display:'flex', alignItems:'center', justifyContent:'space-between' },
  pageTit: { fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:'#f0ece4' },
  content: { flex:1, overflowY:'auto', padding:24 },
};

export default function Layout() {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={S.wrap}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <svg viewBox="0 0 690 330" style={{ width:140, height:67, display:'block', marginBottom:2 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#D4A843"/><stop offset="100%" stopColor="#C49A2A"/></linearGradient>
              <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2A1800"/><stop offset="100%" stopColor="#3D2000"/></linearGradient>
            </defs>
            <rect width="680" height="320" rx="16" fill="url(#bg)"/>
            <g transform="translate(130,160)">
              <rect x="-28" y="-18" width="56" height="42" rx="3" fill="#E8B87A" opacity="0.9"/>
              <polygon points="-38,-18 0,-54 38,-18" fill="#C0503A" opacity="0.95"/>
              <rect x="-9" y="6" width="18" height="18" rx="2" fill="#A0622A"/>
              <rect x="-24" y="-10" width="14" height="12" rx="2" fill="#6AABCC" opacity="0.85"/>
              <rect x="10" y="-10" width="14" height="12" rx="2" fill="#6AABCC" opacity="0.85"/>
              <ellipse cx="-46" cy="-4" rx="18" ry="20" fill="#5A9E3A" opacity="0.95"/>
              <ellipse cx="46" cy="4" rx="14" ry="16" fill="#4A8E2A" opacity="0.9"/>
            </g>
            <text x="212" y="148" fontFamily="Georgia,serif" fontSize="78" fontWeight="700" fill="url(#gg)" letterSpacing="-1">Servix</text>
            <text x="214" y="178" fontFamily="Arial,sans-serif" fontSize="13" fill="#C49A2A" opacity="0.8" letterSpacing="4">PREMIUM DOMESTIC STAFFING</text>
          </svg>
          <div style={S.logoS}>Admin Panel</div>
        </div>
        <nav style={S.nav}>
          {NAV.map(n => (
            <NavLink
              key={n.to} to={n.to} end={n.to === '/'}
              style={({ isActive }) => ({ ...S.link, ...(isActive ? S.activeL : {}) })}
              onClick={() => setPageTitle(n.label)}
            >
              <span style={{ fontSize:16 }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={S.bottom}>
          <div style={S.adminRow}>
            <div style={S.ava}>{admin?.name?.[0] || 'A'}</div>
            <div>
              <div style={S.name}>{admin?.name || 'Admin'}</div>
              <div style={{ fontSize:9, color:'#444', fontFamily:"'DM Mono',monospace" }}>SUPER ADMIN</div>
            </div>
            <button style={S.logoutB} onClick={handleLogout} title="Logout">🚪</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={S.pageTit}>{pageTitle}</div>
          <div style={{ fontSize:11, color:'#555', fontFamily:"'DM Mono',monospace" }}>
            {new Date().toLocaleDateString('en-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
        <div style={S.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
