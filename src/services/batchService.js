import api from '@/config/api';

export const batchService = {
  async getAll(params = {}) {
    const { data } = await api.get('/batches', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/batches/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/batches', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/batches/${id}`, payload);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/batches/${id}`);
    return data;
  },

  async getByCourse(courseId) {
    const { data } = await api.get(`/courses/${courseId}/batches`);
    return data;
  },
};
