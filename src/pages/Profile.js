import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaEye, FaUndo } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import orderAPI from '../api/orderAPI';
import returnsAPI from '../api/returnsAPI';
import ShippingAddresses from '../components/ShippingAddresses';

// Removed unused ORDER_STATUSES

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [returnModal, setReturnModal] = useState({ open: false, order: null });
  const [returnForm, setReturnForm] = useState({ type: 'return', reasonCategory: 'defective', reasonText: '', refundDetails: { mode: 'upi', upiId: '' } });
  const [returnLoading, setReturnLoading] = useState(false);
  const [myReturnRequests, setMyReturnRequests] = useState([]);
  const [showShippingAddresses, setShowShippingAddresses] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: 'India',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const res = await orderAPI.getOrders();
        setOrders(res.data.orders || []);
      } catch (err) {
        setOrdersError('Failed to fetch orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchMyReturnRequests = async () => {
      try {
        const res = await returnsAPI.getMyReturnRequests();
        setMyReturnRequests(res.data.requests || []);
      } catch (err) {
        // Silently fail, user can still see orders
      }
    };
    if (user) fetchMyReturnRequests();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save profile data logic here
    console.log('Profile updated:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
  };

  // removed unused getStatusColor helper

  // Handler to open order modal
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    setCancelError('');
  };

  // Handler to close order modal
  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
    setCancelError('');
  };

  // Open reason modal
  const handleCancelOrder = () => {
    setCancelReason('');
    setShowCancelReasonModal(true);
  };

  const submitCancelReason = async () => {
    if (!selectedOrder) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      const idForCancel = selectedOrder.orderNumber || selectedOrder._id;
      await orderAPI.requestCancelOrder(idForCancel, cancelReason);
      setCancelLoading(false);
      setShowCancelReasonModal(false);
      setShowOrderModal(false);
      // refresh orders to show requested flag
      const res = await orderAPI.getOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to request cancellation');
      setCancelLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and view order history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaEdit />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FaSave />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  name="state"
                  value={profileData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select State</option>
                  {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli and Daman and Diu'].map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowOrderDrawer(true)}
              >
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-600" />
                  <span>View Order History</span>
                </div>
              </button>
              <button
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/contact')}
              >
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-600" />
                  <span>Contact Support</span>
                </div>
              </button>
              <button
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowShippingAddresses(true)}
              >
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span>Shipping Addresses</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order History Side Drawer */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowOrderDrawer(false)}></div>
          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-lg p-6 overflow-y-auto animate-slide-in-right-slow">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowOrderDrawer(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Order History</h2>
            {ordersLoading ? (
              <div>Loading...</div>
            ) : ordersError ? (
              <div className="text-red-600">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div>No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">{order.orderNumber || order._id}</td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-600' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{order.orderStatus}</span>
                          {order.shipment?.isReturning && <span className="ml-2 text-xs text-orange-600">Returned to Seller</span>}
                        </td>
                        <td className="py-3 px-4">{formatINR(order.totalPrice)}</td>
                        <td className="py-3 px-4">{order.orderItems?.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200" 
                              onClick={() => handleViewOrder(order)} 
                              title="View"
                            >
                              <FaEye />
                            </button>
                            {order.orderStatus === 'delivered' && (new Date().getTime() - new Date(order.deliveredAt || order.updatedAt).getTime() <= 10*24*60*60*1000) && !myReturnRequests.some(req => (req.order?._id === order._id || req.order?._id?.toString() === order._id?.toString()) && req.status !== 'closed') && (
                              <button
                                className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95"
                                onClick={() => setReturnModal({ open: true, order })}
                                title="Return or Replace this order"
                              >
                                <FaUndo className="text-[10px]" />
                                <span>Return/Replace</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Order Details Modal (inside drawer) */}
            {showOrderModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-2 relative overflow-y-auto max-h-[90vh]">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={handleCloseOrderModal}>&times;</button>
                  <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                  <div className="mb-2 text-sm text-gray-600">Order ID: <span className="font-mono">{selectedOrder.orderNumber || selectedOrder._id}</span></div>
                  <div className="mb-2 text-sm text-gray-600">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  <div className="mb-2 text-sm text-gray-600">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedOrder.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : selectedOrder.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-600' : selectedOrder.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{selectedOrder.orderStatus}</span></div>
                  <div className="mb-2 text-sm text-gray-600">Payment: {selectedOrder.paymentMethod}</div>
                  <div className="mb-4 text-sm text-gray-600">Shipping: {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}, {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.pincode || selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}</div>
                  <h3 className="text-lg font-semibold mb-2">Products</h3>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="py-2 px-2 text-left">Image</th>
                          <th className="py-2 px-2 text-left">Name</th>
                          <th className="py-2 px-2 text-left">Price</th>
                          <th className="py-2 px-2 text-left">Qty</th>
                          <th className="py-2 px-2 text-left">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderItems?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2">
                              <img src={item.product?.images?.[0]?.url || item.image || '/product-images/default.webp'} alt={item.product?.name || item.name} className="w-12 h-12 object-cover rounded" />
                            </td>
                            <td className="py-2 px-2">{item.product?.name || item.name}</td>
                            <td className="py-2 px-2">{formatINR(item.price)}</td>
                            <td className="py-2 px-2">{item.quantity}</td>
                            <td className="py-2 px-2">{formatINR(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-right font-bold text-lg mb-4">Total: {formatINR(selectedOrder.total || selectedOrder.totalPrice)}</div>
                  
                  {/* Shipping Details */}
                  {selectedOrder.shipment && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">Shipping & Tracking</h3>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.shipment?.courier && (
                          <div>
                            <span className="text-gray-600">Courier Partner:</span>
                            <span className="ml-2 font-medium">{selectedOrder.shipment.courier}</span>
                          </div>
                        )}
                        {selectedOrder.shipment?.awb && (
                          <div>
                            <span className="text-gray-600">AWB Number:</span>
                            <span className="ml-2 font-mono text-blue-600">{selectedOrder.shipment.awb}</span>
                          </div>
                        )}
                        {selectedOrder.shipment?.trackingUrl && (
                          <div>
                            <span className="text-gray-600">Tracking:</span>
                            <a 
                              href={selectedOrder.shipment.trackingUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="ml-2 text-blue-600 underline hover:text-blue-800"
                            >
                              Track Your Order →
                            </a>
                          </div>
                        )}
                        {selectedOrder.shipment?.status && (
                          <div>
                            <span className="text-gray-600">Shipment Status:</span>
                            <div className="ml-2 flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                                selectedOrder.shipment.status === 'DEL' || selectedOrder.shipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                selectedOrder.shipment.status === 'RTO' || selectedOrder.shipment.status === 'RTO_REQ' || selectedOrder.shipment.status === 'RTO_INT' || selectedOrder.shipment.status === 'RTO_RAD' || selectedOrder.shipment.status === 'RTO_OFD' || selectedOrder.shipment.status === 'RTO_DEL' || selectedOrder.shipment.status === 'RTO_UND' || selectedOrder.shipment.status === 'rto' || selectedOrder.shipment.isReturning ? 'bg-orange-100 text-orange-700' :
                                selectedOrder.shipment.status === 'CAN' || selectedOrder.shipment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                selectedOrder.shipment.status === 'INT' || selectedOrder.shipment.status === 'SPD' || selectedOrder.shipment.status === 'OFD' || selectedOrder.shipment.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedOrder.shipment.statusDescription || selectedOrder.shipment.status}
                              </span>
                              {selectedOrder.shipment.isReturning && (
                                <span className="text-xs text-orange-600 font-medium">⚠️ Return to Origin</span>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedOrder.estimatedDelivery && (
                          <div>
                            <span className="text-gray-600">Estimated Delivery:</span>
                            <span className="ml-2 font-medium">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedOrder.deliveredAt && (
                          <div>
                            <span className="text-gray-600">Delivered On:</span>
                            <span className="ml-2 font-medium text-green-600">{new Date(selectedOrder.deliveredAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedOrder.shipment?.isReturning && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                            ⚠️ This order has been returned to the seller
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Refund/Cancellation status hints for the user */}
                  {selectedOrder.cancellationRequested && selectedOrder.orderStatus !== 'cancelled' && (
                    <div className="text-yellow-600 text-sm mb-3">Cancellation requested. Awaiting admin approval.</div>
                  )}
                  {selectedOrder.orderStatus === 'cancelled' && selectedOrder.paymentMethod !== 'cod' && (
                    <>
                      {selectedOrder.refundStatus === 'pending' && (
                        <div className="text-yellow-600 text-sm mb-3">Refund initiated to your original payment method (Razorpay). It may take 5-7 business days to reflect.</div>
                      )}
                      {(selectedOrder.paymentStatus === 'refunded' || selectedOrder.refundStatus === 'refunded') && (
                        <div className="text-green-600 text-sm mb-3">Refund received successfully to your original payment method.</div>
                      )}
                    </>
                  )}
                  {/* Cancel Order Button */}
                  {['pending', 'confirmed', 'processing'].includes(selectedOrder.orderStatus) && !selectedOrder.cancellationRequested && (
                    <div className="mb-2">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        onClick={handleCancelOrder}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                      {cancelError && <div className="text-red-600 text-xs mt-1">{cancelError}</div>}
                    </div>
                  )}
                  {/* The above messages already cover cancellation + refund states; avoid duplicate notice here */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-2 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowCancelReasonModal(false)}>&times;</button>
            <h3 className="text-lg font-semibold mb-3">Cancel Order</h3>
            <label className="block text-sm font-medium mb-1">Reason for cancellation</label>
            <textarea className="w-full border rounded p-2 h-28" value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Please write your reason" />
            <div className="flex justify-end gap-2 mt-3">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowCancelReasonModal(false)}>Close</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50" onClick={submitCancelReason} disabled={cancelLoading || !cancelReason.trim()}>
                {cancelLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return/Replacement Modal */}
      {returnModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-2 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setReturnModal({ open: false, order: null })}>&times;</button>
            <h3 className="text-lg font-semibold mb-3">Return or Replacement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Request Type</label>
                <select className="w-full border rounded p-2" value={returnForm.type} onChange={e => setReturnForm({ ...returnForm, type: e.target.value })}>
                  <option value="return">Return</option>
                  <option value="replacement">Replacement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select className="w-full border rounded p-2" value={returnForm.reasonCategory} onChange={e => setReturnForm({ ...returnForm, reasonCategory: e.target.value })}>
                  <option value="defective">Defective/Damaged</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="size_issue">Size/Variant Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <label className="block text-sm font-medium mt-3">Details (optional)</label>
            <textarea className="w-full border rounded p-2 h-24" value={returnForm.reasonText} onChange={e => setReturnForm({ ...returnForm, reasonText: e.target.value })} />
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Refund Method</label>
              <select className="w-full border rounded p-2" value={returnForm.refundDetails.mode} onChange={e => setReturnForm({ ...returnForm, refundDetails: { mode: e.target.value } })}>
                <option value="upi">UPI</option>
                <option value="bank">Bank</option>
                <option value="wallet">Wallet Balance</option>
              </select>
              {returnForm.refundDetails.mode === 'upi' && (
                <input className="w-full border rounded p-2 mt-2" placeholder="UPI ID" value={returnForm.refundDetails.upiId || ''} onChange={e => setReturnForm({ ...returnForm, refundDetails: { ...returnForm.refundDetails, upiId: e.target.value } })} />
              )}
              {returnForm.refundDetails.mode === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <input className="border rounded p-2" placeholder="Account Holder Name" onChange={e => setReturnForm({ ...returnForm, refundDetails: { ...returnForm.refundDetails, bank: { ...returnForm.refundDetails.bank, accountHolderName: e.target.value } } })} />
                  <input className="border rounded p-2" placeholder="Bank Name" onChange={e => setReturnForm({ ...returnForm, refundDetails: { ...returnForm.refundDetails, bank: { ...returnForm.refundDetails.bank, bankName: e.target.value } } })} />
                  <input className="border rounded p-2" placeholder="Account Number" onChange={e => setReturnForm({ ...returnForm, refundDetails: { ...returnForm.refundDetails, bank: { ...returnForm.refundDetails.bank, accountNumber: e.target.value } } })} />
                  <input className="border rounded p-2" placeholder="IFSC" onChange={e => setReturnForm({ ...returnForm, refundDetails: { ...returnForm.refundDetails, bank: { ...returnForm.refundDetails.bank, ifscCode: e.target.value } } })} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setReturnModal({ open: false, order: null })}>Close</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={returnLoading}
                onClick={async () => {
                  if (!returnModal.order) return;
                  setReturnLoading(true);
                  try {
                    await returnsAPI.create({
                      orderId: returnModal.order._id,
                      type: returnForm.type,
                      reasonCategory: returnForm.reasonCategory,
                      reasonText: returnForm.reasonText,
                      refundDetails: returnForm.refundDetails
                    });
                    setReturnModal({ open: false, order: null });
                    // Refresh return requests to hide the button
                    const res = await returnsAPI.getMyReturnRequests();
                    setMyReturnRequests(res.data.requests || []);
                  } catch (e) {
                    alert(e.response?.data?.message || 'Failed to create request');
                  } finally {
                    setReturnLoading(false);
                  }
                }}
              >{returnLoading ? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Addresses Modal */}
      <ShippingAddresses
        isOpen={showShippingAddresses}
        onClose={() => setShowShippingAddresses(false)}
      />
    </div>
  );
};

export default Profile; 