import api from '@/config/api';

export const courseService = {
  async getAll(params = {}) {
    const { data } = await api.get('/courses', { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/courses', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/courses/${id}`, payload);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  },

  async getBatches(courseId) {
    const { data } = await api.get(`/courses/${courseId}/batches`);
    return data;
  },
};
