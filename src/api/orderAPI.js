import axiosInstance from './axiosConfig';

const orderAPI = {
  // Payment API
  createPaymentOrder: (data) => {
    return axiosInstance.post('/payments/create-order', data);
  },

  verifyPayment: (data) => {
    return axiosInstance.post('/payments/verify', data);
  },

  getPaymentStatus: (paymentId) => {
    return axiosInstance.get(`/payments/status/${paymentId}`);
  },

  // Create new order (COD)
  createOrder: (orderData) => {
    return axiosInstance.post('/orders', orderData);
  },

  // Create order with payment verification
  createOrderWithPayment: (orderData) => {
    return axiosInstance.post('/orders/with-payment', orderData);
  },

  // Get user orders
  getOrders: (params = {}) => {
    return axiosInstance.get('/orders', { params });
  },

  // Get order by ID
  getOrderById: (id) => {
    return axiosInstance.get(`/orders/${id}`);
  },

  // Update order status
  updateOrderStatus: (id, status) => {
    return axiosInstance.put(`/orders/${id}/status`, { status });
  },

  // Cancel order
  cancelOrder: (id, reason) => {
    return axiosInstance.put(`/orders/${id}/cancel`, { reason });
  },

  // Request cancellation (user)
  requestCancelOrder: (id, reason) => {
    const safeId = encodeURIComponent(id);
    return axiosInstance.put(`/orders/${safeId}/request-cancel`, { reason });
  },

  // Admin approve cancellation + refund
  adminApproveCancel: (id) => {
    return axiosInstance.put(`/admin/orders/${id}/approve-cancel`);
  },

  // Get cart
  getCart: () => {
    return axiosInstance.get('/users/cart');
  },

  // Add to cart
  addToCart: (productData) => {
    return axiosInstance.post('/users/cart', productData);
  },

  // Remove from cart
  removeFromCart: (productId) => {
    return axiosInstance.delete(`/users/cart/${productId}`);
  },

  // Update cart item quantity
  updateCartQuantity: (productId, quantity) => {
    return axiosInstance.put(`/users/cart/${productId}`, { quantity });
  },

  // Get wishlist
  getWishlist: () => {
    return axiosInstance.get('/users/wishlist');
  },

  // Add to wishlist
  addToWishlist: (productId) => {
    return axiosInstance.post(`/users/wishlist/${productId}`);
  },

  // Remove from wishlist
  removeFromWishlist: (productId) => {
    return axiosInstance.delete(`/users/wishlist/${productId}`);
  },
};

export default orderAPI; 