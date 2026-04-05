import axios from 'axios';

const BASE_URL = 'http://192.168.1.23:5001/api'; // Replace with your IP

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
  register:   (data) => api.post('/auth/register', data),
  login:      (data) => api.post('/auth/login', data),
  socialAuth: (data) => api.post('/auth/social', data),
  getMe:      ()     => api.get('/auth/me'),
};

export const maidsAPI = {
  getAll:       (params) => api.get('/maids', { params }),
  getOne:       (id)     => api.get(`/maids/${id}`),
  getMyProfile: ()       => api.get('/maids/me', { params: { _t: Date.now() } }),
  createProfile:(data)   => api.post('/maids', data),
  updateProfile:(data)   => api.put('/maids/me', data),
  addPhoto:         (data) => api.post('/maids/me/photos', data),
  submitVerification:(data) => api.post('/maids/me/verification', data),
  toggleLike:   (id)     => api.post(`/maids/${id}/like`),
  getSaved:     ()       => api.get('/maids/saved/list'),
};

export const chatsAPI = {
  startChat:     (data)         => api.post('/chats/start', data),
  getMyChats:    ()             => api.get('/chats'),
  getMessages:   (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage:   (data)         => api.post('/chats/message', data),
  updateApproval:(chatId, data) => api.put(`/chats/${chatId}/approval`, data),
};

export const paymentsAPI = {
  fawry:        (data) => api.post('/payments/fawry', data),
  vodafoneCash: (data) => api.post('/payments/vodafone-cash', data),
  instapay:     (data) => api.post('/payments/instapay', data),
  amazonPay:    (data) => api.post('/payments/amazon-pay', data),
  getHistory:   ()     => api.get('/payments/history'),
  checkStatus:  (id)   => api.get(`/payments/${id}/status`),
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