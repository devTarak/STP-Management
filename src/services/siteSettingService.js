import api from '@/config/api';

export const siteSettingService = {
  async get() {
    const { data } = await api.get('/site-settings');
    return data;
  },

  async update(payload) {
    const { data } = await api.put('/site-settings', payload);
    return data;
  },
};
