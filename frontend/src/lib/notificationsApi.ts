import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = Cookies.get('token');
  return { Authorization: `Bearer ${token}` };
};

export const notificationsAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await axios.patch(
      `${API_URL}/notifications/${id}/read`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.patch(
      `${API_URL}/notifications/read-all`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

export const customersAPI = {
  getPending: async () => {
    const response = await axios.get(`${API_URL}/customers/pending`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await axios.patch(
      `${API_URL}/customers/${id}/approve`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await axios.patch(
      `${API_URL}/customers/${id}/reject`,
      { reason },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
