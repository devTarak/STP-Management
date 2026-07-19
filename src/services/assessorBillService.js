import api from '@/config/api';

export const assessorBillService = {
  async getConfig() {
    const { data } = await api.get('/assessor-bill/config');
    return data;
  },
};
