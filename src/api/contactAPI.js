import axiosInstance from './axiosConfig';

const contactAPI = {
  // Submit contact form
  submitContact: (formData) => {
    return axiosInstance.post('/contact', formData);
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

