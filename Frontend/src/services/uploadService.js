import api from './api';

export const uploadService = {
  async uploadImage(file, folder = 'merogadget/uploads') {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(
      `/upload?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

  async deleteImage(publicId) {
    const response = await api.post('/upload/delete', { publicId });
    return response.data;
  }
};

export default uploadService;