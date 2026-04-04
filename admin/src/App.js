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

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1108', color: '#e8c97a', border: '1px solid #c9a84c' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index         element={<Dashboard />} />
          <Route path="maids"  element={<Maids />} />
          <Route path="housewives" element={<HouseWives />} />
          <Route path="approvals"  element={<Approvals />} />
          <Route path="payments"   element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
