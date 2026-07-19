import api from '@/config/api';

export const bdAddressService = {
  async getDivisions() {
    const { data } = await api.get('/bd-address/divisions');
    return data;
  },

  async getDistricts(divisionId) {
    const { data } = await api.get(`/bd-address/districts/${divisionId}`);
    return data;
  },

  async getUpazilas(districtId) {
    const { data } = await api.get(`/bd-address/upazilas/${districtId}`);
    return data;
  },
};
