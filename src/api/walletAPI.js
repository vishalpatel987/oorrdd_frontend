import axiosInstance from './axiosConfig';

const walletAPI = {
  // Admin APIs
  getWithdrawalSummary: () => {
    return axiosInstance.get('/withdrawals/admin/summary');
  },

  getAllWithdrawalRequests: (params = {}) => {
    return axiosInstance.get('/withdrawals/admin', { params });
  },

  getWithdrawalRequestById: (id) => {
    return axiosInstance.get(`/withdrawals/admin/${id}`);
  },

  updateWithdrawalStatus: (id, data) => {
    return axiosInstance.put(`/withdrawals/admin/${id}/status`, data);
  },

  getSellerEarningsSummary: () => {
    return axiosInstance.get('/withdrawals/admin/seller-earnings');
  },

  checkPayoutStatus: (id) => {
    return axiosInstance.get(`/withdrawals/admin/${id}/payout-status`);
  },

  // Seller APIs
  createWithdrawalRequest: (data) => {
    return axiosInstance.post('/withdrawals/request', data);
  },
  getMyWithdrawalRequests: (params = {}) => {
    return axiosInstance.get('/withdrawals/mine', { params });
  },
  deleteMyWithdrawal: (id) => {
    return axiosInstance.delete(`/withdrawals/${id}`);
  },
};

export default walletAPI;
