import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataService = {
  saveEntry: async (data: Record<string, any>) => {
    const response = await api.post('/data-entry', data);
    return response.data;
  },

  getTodayEntries: async () => {
    const response = await api.get('/data-entry/today');
    return response.data;
  },

  exportDaily: async (date: string) => {
    try {
      const response = await api.get(`/export/${date}`, { 
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export data');
    }
  },

  getDailyStats: async () => {
    const response = await api.get('/reports/daily');
    return response.data;
  },

  getExportHistory: async () => {
    const response = await api.get('/export-history');
    return response.data;
  }
};