import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  search: (query: string) => api.get(`/customers/search?query=${query}`),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  search: (query: string) => api.get(`/products/search?query=${query}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
};

// Branches API
export const branchesAPI = {
  getAll: () => api.get('/branches'),
  getActive: () => api.get('/branches/active'),
  getById: (id: string) => api.get(`/branches/${id}`),
  create: (data: any) => api.post('/branches', data),
  update: (id: string, data: any) => api.put(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
  getStats: (id: string) => api.get(`/branches/${id}/stats`),
};

// Import API
export const importAPI = {
  downloadTemplate: () => {
    return api.get('/import/template', { responseType: 'blob' });
  },
  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Financing Files API
export const filesAPI = {
  getAll: (status?: string) => api.get(`/files${status ? `?status=${status}` : ''}`),
  getById: (id: string) => api.get(`/files/${id}`),
  create: (data: any) => api.post('/files', data),
  update: (id: string, data: any) => api.put(`/files/${id}`, data),
  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    api.patch(`/files/${id}/status`, { status, rejection_reason: rejectionReason }),
  delete: (id: string) => api.delete(`/files/${id}`),
  getStats: () => api.get('/files/stats'),
  uploadDocuments: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });
    return api.post('/files/upload-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for large uploads
    });
  },
};

// Documents API
export const documentsAPI = {
  upload: (fileId: string, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_id', fileId);
    formData.append('document_type', documentType);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for large uploads
    });
  },
  getByFileId: (fileId: string) => api.get(`/documents/file/${fileId}`),
  getById: (id: string) => api.get(`/documents/${id}`),
  getExtractedData: (id: string) => api.get(`/documents/${id}/extracted`),
  delete: (id: string) => api.delete(`/documents/${id}`),
  retryOCR: (id: string) => api.post(`/documents/${id}/retry-ocr`),
  getStats: () => api.get(`/documents/stats`),
  // Secure document serving
  getSecureDocument: (filename: string) => {
    return api.get(`/secure/documents/${filename}`, { 
      responseType: 'blob',
      timeout: 300000, // 5 minutes
    });
  },
};

// Chat API
export const chatAPI = {
  // Get all conversations (admin only)
  getAllConversations: () => api.get('/chat/conversations'),
  
  // Get or create conversation with a branch
  getOrCreateConversation: (branchId: string) => api.get(`/chat/conversations/${branchId}`),
  
  // Get messages for a conversation
  getMessages: (conversationId: string, limit = 50, offset = 0) => 
    api.get(`/chat/messages/${conversationId}?limit=${limit}&offset=${offset}`),
  
  // Send text message
  sendMessage: (conversationId: string, content: string) => 
    api.post('/chat/messages', { conversationId, content, messageType: 'text' }),
  
  // Send file/image message
  sendFileMessage: (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return api.post('/chat/messages/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },
};


