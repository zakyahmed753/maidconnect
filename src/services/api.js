import axios from 'axios';

const BASE_URL = 'https://api.servix.world/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  try {
    const SecureStore = require('expo-secure-store');
    const token = await SecureStore.getItemAsync('maidconnect_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync('maidconnect_token');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:        (data)  => api.post('/auth/register', data),
  login:           (data)  => api.post('/auth/login', data),
  socialAuth:      (data)  => api.post('/auth/social', data),
  getMe:           ()      => api.get('/auth/me'),
  updateMe:        (data)  => api.put('/auth/me', data),
  deleteAccount:   (data)  => api.delete('/auth/me', { data }),
  updateFCMToken:  (token) => api.put('/auth/fcm-token', { token }),
  verifyOTP:       (data)  => api.post('/auth/verify-otp', data),
  resendOTP:       (data)  => api.post('/auth/resend-otp', data),
  forgotPassword:  (data)  => api.post('/auth/forgot-password', data),
  resetPassword:   (data)  => api.post('/auth/reset-password', data),
};

export const hwAPI = {
  getProfile:            ()     => api.get('/housewives/me'),
  updateProfile:         (data) => api.put('/housewives/me', data),
  getSubscriptionStatus: ()     => api.get('/housewives/me'),
  hireMaid:              (data) => api.post('/housewives/hire', data),
  requestOfflinePayment: (data) => api.post('/housewives/me/offline-payment-request', data),
};

export const maidsAPI = {
  getAll:       (params) => api.get('/maids', { params }),
  getOne:       (id)     => api.get(`/maids/${id}`),
  getMyProfile: ()       => api.get('/maids/me', { params: { _t: Date.now() } }),
  createProfile:(data)   => api.post('/maids', data),
  updateProfile:(data)   => api.put('/maids/me', data),
  addPhoto:         (data) => api.post('/maids/me/photos', data),
  submitVerification:(data) => api.post('/maids/me/verification', data),
  toggleLike:    (id)     => api.post(`/maids/${id}/like`),
  getSaved:      ()       => api.get('/maids/saved/list'),
  submitReview:  (id, data) => api.post(`/maids/${id}/reviews`, data),
  getReviews:    (id)     => api.get(`/maids/${id}/reviews`),
  getHireRequests:         ()           => api.get('/maids/hire-requests'),
  respondHireRequest:      (id, action) => api.put(`/maids/hire-requests/${id}/respond`, { action }),
  requestOfflinePayment:   (data)       => api.post('/maids/me/offline-payment-request', data),
};

export const chatsAPI = {
  startChat:     (data)         => api.post('/chats/start', data),
  getMyChats:    ()             => api.get('/chats'),
  getMessages:   (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage:   (data)         => api.post('/chats/message', data),
  updateApproval:(chatId, data) => api.put(`/chats/${chatId}/approval`, data),
};

export const paymentsAPI = {
  initiatePaymob:              (data) => api.post('/payments/paymob/initiate', data),
  initiateCustomerSubscription: ()    => api.post('/payments/paymob/initiate', { type: 'customer_subscription' }),
  returnMaid:                  (data) => api.post('/payments/return-maid', data),
  getHistory:                  ()     => api.get('/payments/history'),
  checkStatus:                 (id)   => api.get(`/payments/${id}/status`),
};

export const configAPI = {
  getAreas:    ()           => api.get('/config/areas'),
  updateAreas: (activeAreas) => api.put('/config/areas', { activeAreas }),
  getTerms:    ()           => api.get('/config/terms'),
  updateTerms: (termsUrl)   => api.put('/config/terms', { termsUrl }),
};

export const couponsAPI = {
  getMyCode:      ()           => api.get('/coupons/my-code'),
  validate:       (data)       => api.post('/coupons/validate', data),
  adminList:      ()           => api.get('/coupons'),
  adminCreate:    (data)       => api.post('/coupons', data),
  adminToggle:    (id)         => api.put(`/coupons/${id}/toggle`),
};

export const supportAPI = {
  create:   (data) => api.post('/support', data),
  getMine:  ()     => api.get('/support/mine'),
};

export const notificationsAPI = {
  getAll:   ()   => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAll:  ()   => api.put('/notifications/read-all'),
};

export const uploadAPI = {
  image: async (uri) => {
    const form = new FormData();
    form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' });
    return api.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  voice: async (uri, duration) => {
    const form = new FormData();
    form.append('voice', { uri, name: 'voice.m4a', type: 'audio/m4a' });
    form.append('duration', String(duration));
    return api.post('/upload/voice', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;