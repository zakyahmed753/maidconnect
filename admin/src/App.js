import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Maids from './pages/Maids';
import HouseWives from './pages/HouseWives';
import Approvals from './pages/Approvals';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import SupportTickets from './pages/SupportTickets';
import Coupons from './pages/Coupons';
import Areas   from './pages/Areas';
import Agents      from './pages/Agents';
import LeadSources from './pages/LeadSources';

const AGENT_ALLOWED = ['/maids', '/approvals', '/support'];

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" />;
};

// Redirects agents away from admin-only pages
const AdminRoute = ({ children }) => {
  const admin = useAuthStore(s => s.admin);
  if (admin?.role === 'agent') return <Navigate to="/maids" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1108', color: '#e8c97a', border: '1px solid #c9a84c' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index         element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="maids"  element={<Maids />} />
          <Route path="housewives" element={<AdminRoute><HouseWives /></AdminRoute>} />
          <Route path="approvals"  element={<Approvals />} />
          <Route path="payments"   element={<AdminRoute><Payments /></AdminRoute>} />
          <Route path="notifications" element={<AdminRoute><Notifications /></AdminRoute>} />
          <Route path="support"  element={<SupportTickets />} />
          <Route path="coupons" element={<AdminRoute><Coupons /></AdminRoute>} />
          <Route path="areas"   element={<AdminRoute><Areas /></AdminRoute>} />
          <Route path="agents"       element={<AdminRoute><Agents /></AdminRoute>} />
          <Route path="lead-sources" element={<AdminRoute><LeadSources /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
