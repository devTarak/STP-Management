import api from '@/config/api';
import { buildQueryString } from '@/utils/helpers';

export const dashboardService = {
  async getSummary({ signal } = {}) {
    const { data } = await api.get('/dashboard/summary', { signal });
    return data;
  },

  async getCourses({ signal } = {}) {
    const { data } = await api.get('/dashboard/courses', { signal });
    return data;
  },

  async getBatches({ signal } = {}) {
    const { data } = await api.get('/dashboard/batches', { signal });
    return data;
  },

  async getRecentActivity(params = {}, { signal } = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/dashboard/recent-activity${qs}`, { signal });
    return data;
  },

  async getRegistrationTrend({ signal } = {}) {
    const { data } = await api.get('/dashboard/registrations-trend', { signal });
    return data;
  },

  async getFilterOptions({ signal } = {}) {
    const { data } = await api.get('/dashboard/filter-options', { signal });
    return data;
  },
};
