import api from '@/config/api';
import { buildQueryString } from '@/utils/helpers';

export const instituteService = {
  async getAll(params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/institutes${qs}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/institutes/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/institutes', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/institutes/${id}`, payload);
    return data;
  },

  async toggleStatus(id) {
    const { data } = await api.put(`/institutes/${id}/toggle-status`);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/institutes/${id}`);
    return data;
  },

  async getStats(id) {
    const { data } = await api.get(`/institutes/${id}/stats`);
    return data;
  },
};
