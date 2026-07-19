import api from '@/config/api';
import { buildQueryString } from '@/utils/helpers';

export const studentService = {
  async getAll(params = {}, config = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/students${qs}`, config);
    return data;
  },

  async getById(id, config = {}) {
    const { data } = await api.get(`/students/${id}`, config);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/students/${id}`, payload);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  },

  async updateStatus(id, payload) {
    const { data } = await api.post(`/students/${id}/status`, payload);
    return data;
  },

  async getByBatch(batchId, params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/batches/${batchId}/students${qs}`);
    return data;
  },

  async getByBatchApproved(batchId, params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/batches/${batchId}/students/approved${qs}`);
    return data;
  },

  async exportCsv(batchId, status = 'all') {
    const response = await api.get(`/export/csv?batch_id=${batchId}&status=${status}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
