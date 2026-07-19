import api from '@/config/api';

export const registrationService = {
  async getCourses() {
    const { data } = await api.get('/registration/courses');
    return data;
  },

  async register(payload) {
    const { data } = await api.post('/registration/register', payload);
    return data;
  },

  async uploadFile(file, type, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const { data } = await api.post('/registration/upload', formData, {
      onUploadProgress: onProgress,
    });
    return data;
  },

  async deleteFile(path) {
    const formData = new FormData();
    formData.append('path', path);
    const { data } = await api.post('/registration/delete-file', formData);
    return data;
  },
};
