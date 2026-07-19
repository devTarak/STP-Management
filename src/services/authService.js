import api from '@/config/api';

export const authService = {
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async changePassword(payload) {
    const { data } = await api.post('/auth/change-password', payload);
    return data;
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data;
  },
};
