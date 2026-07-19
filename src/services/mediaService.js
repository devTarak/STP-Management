import api from '@/config/api';
import { buildQueryString } from '@/utils/helpers';

export const mediaService = {
  async getAll(params = {}) {
    const qs = buildQueryString(params);
    const { data } = await api.get(`/media${qs}`);
    return data;
  },
};
