import api from '@/config/api';
import { buildQueryString } from '@/utils/helpers';

export const activityLogService = {
  async getAll(params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/activity-logs${qs}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/activity-logs/${id}`);
    return data;
  },

  async getByEntity(entityType, entityId, params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/activity-logs/entity/${entityType}/${entityId}${qs}`);
    return data;
  },
};
