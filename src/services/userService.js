import api from '@/config/api';
import { buildQueryString } from '@/utils/helpers';

export const userService = {
  async getAll(params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/users${qs}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/users', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  async toggleStatus(id) {
    const { data } = await api.put(`/users/${id}/toggle-status`);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
