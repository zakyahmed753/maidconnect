import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.servix.world/api',
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
  getDashboard:         () => api.get('/admin/dashboard'),
  getMaids:             (params) => api.get('/admin/maids', { params }),
  getMaid:              (id) => api.get(`/admin/maids/${id}`),
  updateMaidStatus:     (id, data) => api.put(`/admin/maids/${id}/status`, data),
  verifyIdentity:       (id, data) => api.put(`/admin/maids/${id}/verify`, data),
  activateSubscription: (id, data) => api.put(`/admin/maids/${id}/subscription`, data),
  getHouseWives:        (params) => api.get('/admin/housewives', { params }),
  suspendUser:          (userId, data) => api.put(`/admin/users/${userId}/suspend`, data),
  toggleHired:          (id) => api.put(`/admin/maids/${id}/hired`),
  getPayments:          (params) => api.get('/admin/payments', { params }),
  broadcast:            (data) => api.post('/admin/broadcast', data),
};

export const configAPI = {
  getAreas:    ()             => api.get('/config/areas'),
  updateAreas: (activeAreas)  => api.put('/config/areas', { activeAreas }),
  getTerms:    ()             => api.get('/config/terms'),
  updateTerms: (termsUrl)     => api.put('/config/terms', { termsUrl }),
};

export const couponsAPI = {
  adminList:   ()     => api.get('/coupons'),
  adminCreate: (data) => api.post('/coupons', data),
  adminToggle: (id)   => api.put(`/coupons/${id}/toggle`),
};

export const supportAPI = {
  getAll:   (params) => api.get('/support', { params }),
  update:   (id, data) => api.put(`/support/${id}`, data),
};

export default api;