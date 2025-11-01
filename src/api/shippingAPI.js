import axiosInstance from './axiosConfig';

const shippingAPI = {
  rates: (payload) => axiosInstance.post('/shipping/rates', payload),
  createShipment: (orderId) => axiosInstance.post('/shipping/shipments', { orderId }),
  schedulePickup: (payload) => axiosInstance.post('/shipping/pickups', payload),
  getLabel: (orderId) => axiosInstance.get(`/shipping/label/${orderId}`),
  cancelShipment: (orderId, reason) => axiosInstance.post(`/shipping/cancel/${orderId}`, { reason }),
  ndrAction: (payload) => axiosInstance.post('/shipping/ndr-action', payload)
};

export default shippingAPI;


