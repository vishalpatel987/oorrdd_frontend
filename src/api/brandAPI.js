import axiosInstance from './axiosConfig';

const brandAPI = {
  // Get all active brands (public)
  getAllBrands: (params = {}) => {
    return axiosInstance.get('/brands', { params });
  },

  // Get all brands including inactive (admin only)
  getBrands: () => {
    return axiosInstance.get('/brands/all');
  },

  // Get single brand by ID (admin only)
  getBrandById: (id) => {
    return axiosInstance.get(`/brands/${id}`);
  },

  // Create brand (admin only)
  createBrand: (brandData) => {
    return axiosInstance.post('/brands', brandData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update brand (admin only)
  updateBrand: (id, brandData) => {
    return axiosInstance.put(`/brands/${id}`, brandData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete brand (admin only)
  deleteBrand: (id) => {
    return axiosInstance.delete(`/brands/${id}`);
  }
};

export default brandAPI;
