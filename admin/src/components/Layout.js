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
          <div style={S.logoT}>MaidConnect</div>
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
