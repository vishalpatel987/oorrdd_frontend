import axiosInstance from './axiosConfig';

const contactAPI = {
  // Submit contact form
  submitContact: (formData) => {
    // Response is sent immediately from backend, so shorter timeout is fine
    // But keep it at 15 seconds to be safe
    return axiosInstance.post('/contact', formData, {
      timeout: 15000 // 15 seconds (backend responds immediately, but network can be slow)
    });
  },

  // Admin: Get all contacts (requires admin auth)
  getAllContacts: (params) => {
    return axiosInstance.get('/contact/admin', { params });
  },

  // Admin: Get single contact
  getContact: (id) => {
    return axiosInstance.get(`/contact/admin/${id}`);
  },

  // Admin: Update contact status
  updateContactStatus: (id, data) => {
    return axiosInstance.put(`/contact/admin/${id}/status`, data);
  },

  // Admin: Reply to contact
  replyToContact: (id, replyMessage) => {
    return axiosInstance.post(`/contact/admin/${id}/reply`, { replyMessage });
  }
};

export default contactAPI;

