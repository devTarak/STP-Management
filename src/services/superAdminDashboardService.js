import api from '@/config/api';

export const superAdminDashboardService = {
  async getSummary({ signal } = {}) {
    const { data } = await api.get('/super-admin/dashboard', { signal });
    return data;
  },
};
