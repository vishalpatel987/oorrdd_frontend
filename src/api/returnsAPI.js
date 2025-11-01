import axiosInstance from './axiosConfig';

const returnsAPI = {
  create: (payload) => axiosInstance.post('/returns', payload),
  listAdmin: (params) => axiosInstance.get('/returns/admin', { params }),
  approve: (id) => axiosInstance.put(`/returns/admin/${id}/approve`),
  reject: (id) => axiosInstance.put(`/returns/admin/${id}/reject`),
  getMyReturnRequests: () => axiosInstance.get('/returns/mine'),
  manualReversePickup: (orderId) => axiosInstance.post('/returns/seller/reverse-pickup', { orderId }),
};

export default returnsAPI;


