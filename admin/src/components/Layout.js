import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ALL_NAV = [
  { to: '/',             icon: '📊', label: 'Dashboard',     adminOnly: true },
  { to: '/maids',        icon: '👩', label: 'Maids',         adminOnly: false },
  { to: '/housewives',   icon: '👤', label: 'Customers',     adminOnly: true },
  { to: '/approvals',    icon: '✅', label: 'Approvals',     adminOnly: false },
  { to: '/payments',     icon: '💳', label: 'Payments',      adminOnly: true },
  { to: '/notifications',icon: '🔔', label: 'Notifications', adminOnly: true },
  { to: '/support',      icon: '🎫', label: 'Support',       adminOnly: false },
  { to: '/coupons',      icon: '🏷', label: 'Coupons',       adminOnly: true },
  { to: '/areas',        icon: '📍', label: 'Areas',         adminOnly: true },
  { to: '/agents',       icon: '👥', label: 'Agents',        adminOnly: true },
  { to: '/lead-sources', icon: '📣', label: 'Lead Sources',  adminOnly: true },
];

export default function Layout() {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pinned, setPinned] = useState(() => {
    const saved = localStorage.getItem('sidebarPinned');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 768;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  const isAgent = admin?.role === 'agent';
  const NAV = ALL_NAV.filter(n => !n.adminOnly || !isAgent);

  useEffect(() => {
    localStorage.setItem('sidebarPinned', String(pinned));
  }, [pinned]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarVisible = isMobile ? mobileOpen : pinned;

  const closeMobile = () => { if (isMobile) setMobileOpen(false); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f0c09', fontFamily:"'Jost',sans-serif" }}>

      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99 }}
        />
      )}

      {/* Sidebar */}
      {sidebarVisible && (
        <div style={{
          width: 220,
          background: '#161616',
          borderRight: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column',
          ...(isMobile
            ? { position:'fixed', top:0, left:0, height:'100vh', zIndex:100 }
            : { position:'sticky', top:0, height:'100vh', flexShrink:0 })
        }}>
          {/* Logo + pin button */}
          <div style={{ padding:'16px 14px 14px', borderBottom:'1px solid #2a2a2a' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <svg viewBox="0 0 1024 1024" style={{ width:32, height:32, borderRadius:7, flexShrink:0 }} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#D4A843"/><stop offset="100%" stopColor="#C49A2A"/></linearGradient>
                    <linearGradient id="bg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2A1800"/><stop offset="100%" stopColor="#3D2000"/></linearGradient>
                  </defs>
                  <rect width="1024" height="1024" rx="60" fill="url(#bg2)"/>
                  <g transform="translate(512,420) scale(3.2)">
                    <rect x="-28" y="-18" width="56" height="42" rx="3" fill="#E8B87A" opacity="0.9"/>
                    <polygon points="-38,-18 0,-54 38,-18" fill="#C0503A" opacity="0.95"/>
                    <rect x="-9" y="6" width="18" height="18" rx="2" fill="#A0622A"/>
                    <rect x="-24" y="-10" width="14" height="12" rx="2" fill="#6AABCC" opacity="0.85"/>
                    <rect x="10" y="-10" width="14" height="12" rx="2" fill="#6AABCC" opacity="0.85"/>
                    <ellipse cx="-46" cy="-4" rx="18" ry="20" fill="#5A9E3A" opacity="0.95"/>
                    <ellipse cx="46" cy="4" rx="14" ry="16" fill="#4A8E2A" opacity="0.9"/>
                  </g>
                  <text x="512" y="720" fontFamily="Georgia,serif" fontSize="160" fontWeight="700" fill="url(#gg)" textAnchor="middle" letterSpacing="-2">Servix</text>
                </svg>
                <div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontWeight:700, color:'#e8c97a', lineHeight:1 }}>Servix</div>
                  <div style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#555', fontFamily:"'DM Mono',monospace", marginTop:2 }}>
                    {isAgent ? 'Agent Panel' : 'Admin Panel'}
                  </div>
                </div>
              </div>
              {/* Pin / Unpin button */}
              <button
                onClick={() => isMobile ? setMobileOpen(false) : setPinned(false)}
                title={isMobile ? 'Close' : 'Unpin sidebar'}
                style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:15, padding:'4px 6px', borderRadius:4, lineHeight:1 }}
              >
                {isMobile ? '✕' : '📌'}
              </button>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2 }}>
            {NAV.map(n => (
              <NavLink
                key={n.to} to={n.to} end={n.to === '/'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:5,
                  textDecoration:'none', fontSize:13, fontWeight:500, transition:'all 0.15s',
                  ...(isActive
                    ? { background:'rgba(201,168,76,0.12)', color:'#e8c97a', borderLeft:'2px solid #c9a84c' }
                    : { color:'#666' })
                })}
                onClick={() => { setPageTitle(n.label); closeMobile(); }}
              >
                <span style={{ fontSize:16 }}>{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom: user + logout */}
          <div style={{ padding:'14px 8px', borderTop:'1px solid #2a2a2a' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8c97a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#1a1108', fontWeight:700, flexShrink:0 }}>
                {admin?.name?.[0] || 'A'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, color:'#aaa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{admin?.name || 'Agent'}</div>
                <div style={{ fontSize:9, color: isAgent ? '#6aabcc' : '#444', fontFamily:"'DM Mono',monospace" }}>
                  {isAgent ? 'AGENT' : 'SUPER ADMIN'}
                </div>
              </div>
              <button style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:16, padding:4 }} onClick={handleLogout} title="Logout">🚪</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* Topbar */}
        <div style={{ padding:'12px 16px', background:'#111', borderBottom:'1px solid #222', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          {/* Hamburger / pin button */}
          <button
            onClick={() => isMobile ? setMobileOpen(true) : setPinned(true)}
            title={isMobile ? 'Open menu' : 'Pin sidebar'}
            style={{
              display: sidebarVisible && !isMobile ? 'none' : 'flex',
              alignItems:'center', justifyContent:'center',
              background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)',
              color:'#c9a84c', cursor:'pointer', fontSize:16, padding:'6px 10px', borderRadius:5, flexShrink:0
            }}
          >
            ☰
          </button>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:'#f0ece4', flex:1 }}>{pageTitle}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {isAgent && (
              <span style={{ fontSize:10, background:'rgba(106,171,204,0.15)', color:'#6aabcc', border:'1px solid rgba(106,171,204,0.3)', borderRadius:3, padding:'3px 9px', fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em', whiteSpace:'nowrap' }}>
                AGENT VIEW
              </span>
            )}
            <div style={{ fontSize:11, color:'#555', fontFamily:"'DM Mono',monospace", whiteSpace:'nowrap' }}>
              {new Date().toLocaleDateString('en-EG', { weekday:'short', month:'short', day:'numeric' })}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
