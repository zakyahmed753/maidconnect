import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('maidconnect-admin-auth') || '{}');
  const token = stored?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('maidconnect-admin-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const adminAPI = {
  getDashboard:       () => api.get('/admin/dashboard'),
  getMaids:           (params) => api.get('/admin/maids', { params }),
  updateMaidStatus:   (id, data) => api.put(`/admin/maids/${id}/status`, data),
  getHouseWives:      (params) => api.get('/admin/housewives', { params }),
  suspendUser:        (userId, data) => api.put(`/admin/users/${userId}/suspend`, data),
  getPayments:        (params) => api.get('/admin/payments', { params }),
  broadcast:          (data) => api.post('/admin/broadcast', data),
};

export default api;