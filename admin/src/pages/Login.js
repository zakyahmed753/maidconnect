import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a1108,#0f0c09)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>
      <div style={{ width:380, background:'#161616', border:'1px solid #2a2a2a', borderRadius:12, padding:36, boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🏡</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:'#e8c97a', marginBottom:4 }}>MaidConnect</div>
          <div style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#555', fontFamily:"'DM Mono',monospace" }}>Admin Panel</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#666', marginBottom:6, fontWeight:600 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width:'100%', padding:'11px 14px', background:'#1e1e1e', border:'1.5px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:14, outline:'none', fontFamily:"'Jost',sans-serif", boxSizing:'border-box' }}
              placeholder="admin@maidconnect.com"
            />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#666', marginBottom:6, fontWeight:600 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width:'100%', padding:'11px 14px', background:'#1e1e1e', border:'1.5px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:14, outline:'none', fontFamily:"'Jost',sans-serif", boxSizing:'border-box' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#c9a84c,#e8c97a)', border:'none', borderRadius:5, color:'#1a1108', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, letterSpacing:'0.05em', fontFamily:"'Jost',sans-serif", transition:'all 0.2s' }}
          >
            {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
