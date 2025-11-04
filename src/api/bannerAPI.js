import axiosInstance from './axiosConfig';

const bannerAPI = {
  // Get all active banners (public)
  getAllBanners: () => {
    return axiosInstance.get('/banners');
  },

  // Get all banners including inactive (admin only)
  getBanners: () => {
    return axiosInstance.get('/banners/all');
  },

  // Get single banner by ID (admin only)
  getBannerById: (id) => {
    return axiosInstance.get(`/banners/${id}`);
  },

  // Create banner (admin only)
  createBanner: (bannerData) => {
    return axiosInstance.post('/banners', bannerData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update banner (admin only)
  updateBanner: (id, bannerData) => {
    return axiosInstance.put(`/banners/${id}`, bannerData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete banner (admin only)
  deleteBanner: (id) => {
    return axiosInstance.delete(`/banners/${id}`);
  }
};

export default bannerAPI;

