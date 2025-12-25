import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = Cookies.get('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const statsAPI = {
  getAdminStats: async () => {
    const response = await axios.get(`${API_URL}/stats/admin`, getAuthHeaders());
    return response.data;
  },

  getBranchStats: async () => {
    const response = await axios.get(`${API_URL}/stats/branch`, getAuthHeaders());
    return response.data;
  },
};
