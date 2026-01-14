import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// User APIs
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  updateTheme: (data) => API.put('/users/theme', data),
  uploadAvatar: (formData) => API.post('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  searchUsers: (query) => API.get(`/users/search?q=${query}`),
  getUserById: (id) => API.get(`/users/${id}`),
};

// Contact APIs
export const contactAPI = {
  getContacts: () => API.get('/contacts'),
  addContact: (data) => API.post('/contacts/add', data),
  updateNickname: (id, nickname) => API.put(`/contacts/${id}/nickname`, { nickname }),
  deleteContact: (id) => API.delete(`/contacts/${id}`),
  toggleBlock: (id) => API.put(`/contacts/${id}/block`),
};

// Conversation APIs
export const conversationAPI = {
  getConversations: () => API.get('/conversations'),
  getConversationById: (id) => API.get(`/conversations/${id}`),
  createConversation: (data) => API.post('/conversations/create', data),
  deleteConversation: (id) => API.delete(`/conversations/${id}`),
  updateGroupInfo: (id, data) => API.put(`/conversations/${id}/group`, data),
};

// Message APIs
export const messageAPI = {
  getMessages: (conversationId, page = 1) => 
    API.get(`/messages/${conversationId}?page=${page}`),
  sendMessage: (data) => API.post('/messages/send', data),
  uploadMedia: (formData) => API.post('/messages/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  markAsRead: (id) => API.put(`/messages/${id}/read`),
  deleteMessage: (id, deleteFor) => API.delete(`/messages/${id}`, { data: { deleteFor } }),
};

export default API;