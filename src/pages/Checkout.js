import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaPaypal, FaApplePay, FaGooglePay, FaMoneyBillWave, FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '../redux/slices/orderSlice';
import { fetchCart, clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import orderAPI from '../api/orderAPI';
import axiosInstance from '../api/axiosConfig';
import ShippingAddresses from '../components/ShippingAddresses';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli and Daman and Diu'
];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, total, loading: cartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth); // Assuming user info is in auth slice
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [coupon, setCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Load saved addresses from localStorage
  useEffect(() => {
    const savedAddresses = localStorage.getItem('shippingAddresses');
    if (savedAddresses) {
      try {
        const addresses = JSON.parse(savedAddresses);
        setSavedAddresses(addresses);
      } catch (e) {
        console.error('Error loading saved addresses:', e);
      }
    }
  }, []);

  // Auto-fill form when saved address is selected
  useEffect(() => {
    if (selectedAddressId && savedAddresses.length > 0) {
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        setFormData({
          firstName: selectedAddress.name?.split(' ')[0] || '',
          lastName: selectedAddress.name?.split(' ').slice(1).join(' ') || '',
          email: user?.email || '',
          phone: selectedAddress.phone || '',
          address: selectedAddress.address || '',
          city: selectedAddress.city || '',
          state: selectedAddress.state || '',
          pincode: selectedAddress.pincode || '',
          country: selectedAddress.country || 'India',
        });
        setShowManualForm(false);
      }
    }
  }, [selectedAddressId, savedAddresses, user?.email]);

  // Recalculate delivery date when location changes
  useEffect(() => {
    const { city, state, pincode } = formData;
    
    // If location details are not filled, don't show delivery date
    if (!city || !state || !pincode) {
      setEstimatedDeliveryDate(null);
      return;
    }

    // Metro cities and major cities typically have faster delivery (3-5 days)
    const metroCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
      'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 
      'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 
      'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
      'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Amritsar', 'Noida'
    ];

    const cityLower = city.toLowerCase().trim();
    const isMetroCity = metroCities.some(metro => metro.toLowerCase() === cityLower);
    
    // Check pincode first digit to determine region
    const pincodeFirstDigit = parseInt(pincode.charAt(0)) || 0;
    
    // Determine delivery days based on location
    let deliveryDays = 7; // Default: 7 days
    
    if (isMetroCity) {
      // Metro cities: 3-5 days (use average: 4 days)
      deliveryDays = 4;
    } else if (pincodeFirstDigit >= 1 && pincodeFirstDigit <= 6) {
      // Northern, Western, Central regions: 5-7 days (use average: 6 days)
      deliveryDays = 6;
    } else if (pincodeFirstDigit === 7 || pincodeFirstDigit === 8) {
      // Eastern and North-Eastern regions: 7-10 days (use average: 8 days)
      deliveryDays = 8;
    } else {
      // Other regions: 7-9 days (use average: 8 days)
      deliveryDays = 8;
    }

    // Calculate delivery date (excluding Sundays)
    const today = new Date();
    let daysToAdd = deliveryDays;
    let deliveryDate = new Date(today);
    
    // Add business days (excluding Sundays)
    while (daysToAdd > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Skip Sundays (0 = Sunday)
      if (deliveryDate.getDay() !== 0) {
        daysToAdd--;
      }
    }

    // Format date
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const formattedDate = deliveryDate.toLocaleDateString('en-IN', options);
    
    setEstimatedDeliveryDate({
      date: deliveryDate,
      formattedDate: formattedDate,
      days: deliveryDays
    });
  }, [formData.city, formData.state, formData.pincode]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  // Initialize Razorpay payment
  const initializeRazorpayPayment = async (orderData) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // Create payment order
      const paymentOrderResponse = await orderAPI.createPaymentOrder({
        amount: total - discount,
        currency: 'INR',
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          seller: typeof item.product.seller === 'object' ? item.product.seller._id : item.product.seller,
        }))
      });

      const { data } = paymentOrderResponse.data;

      // Razorpay options
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'MV Store',
        description: 'Order Payment',
        order_id: data.order.id,
        image: `${window.location.origin}/images/logo.png`,
        handler: async function (response) {
          try {
            // Create order with payment verification
            const orderData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: {
                type: 'home',
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.pincode,
                country: formData.country,
                phone: formData.phone,
              },
              items: cartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                seller: typeof item.product.seller === 'object' ? item.product.seller._id : item.product.seller,
              })),
              paymentMethod: 'razorpay',
              coupon: appliedCoupon,
              discount,
              total: total - discount,
            };

            const verifyResponse = await orderAPI.createOrderWithPayment(orderData);

            if (verifyResponse.data.success) {
              // Save address to localStorage after successful order
              saveCurrentAddressToStorage();
              dispatch(clearCart());
              toast.success('Payment successful! Order placed successfully!');
              navigate('/profile');
            } else {
              toast.error('Order creation failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      toast.error('Failed to initialize payment');
      console.error('Payment initialization error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      if (paymentMethod === 'razorpay') {
        await initializeRazorpayPayment();
      } else if (paymentMethod === 'cod') {
        // Handle COD orders
        const orderData = {
          shippingAddress: {
            type: 'home',
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.pincode,
            country: formData.country,
            phone: formData.phone,
          },
          items: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            seller: typeof item.product.seller === 'object' ? item.product.seller._id : item.product.seller,
          })),
          paymentMethod: 'cod',
          coupon: appliedCoupon,
          discount,
          total: total - discount,
        };

        const result = await dispatch(createOrder(orderData));
        if (!result.error) {
          // Save address to localStorage after successful order
          saveCurrentAddressToStorage();
          dispatch(clearCart());
          toast.success('Order placed successfully!');
          navigate('/profile');
        } else {
          toast.error(result.error || 'Failed to place order');
        }
      }
    } catch (err) {
      toast.error('Failed to place order');
      console.error('Order submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save current form address to localStorage
  const saveCurrentAddressToStorage = () => {
    if (!formData.firstName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      return; // Don't save incomplete addresses
    }

    const newAddress = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country || 'India',
      type: 'home'
    };

    const savedAddresses = localStorage.getItem('shippingAddresses');
    let addresses = [];
    if (savedAddresses) {
      try {
        addresses = JSON.parse(savedAddresses);
      } catch (e) {
        console.error('Error parsing saved addresses:', e);
      }
    }

    // Check if address already exists (by comparing key fields)
    const addressExists = addresses.some(addr =>
      addr.address === newAddress.address &&
      addr.city === newAddress.city &&
      addr.pincode === newAddress.pincode &&
      addr.phone === newAddress.phone
    );

    if (!addressExists) {
      newAddress.id = Date.now().toString();
      addresses.push(newAddress);
      localStorage.setItem('shippingAddresses', JSON.stringify(addresses));
      setSavedAddresses(addresses);
      toast.success('Address saved to your shipping addresses');
    }
  };

  // Handle address selection from saved addresses
  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    setShowAddressModal(false);
    toast.success('Address selected');
  };

  // Handle manual form input
  const handleManualFormToggle = () => {
    setShowManualForm(true);
    setSelectedAddressId(null);
    // Keep current form data
  };

  // Real coupon application using backend API
  const handleApplyCoupon = async () => {
    setCouponStatus('');
    setDiscount(0);
    setAppliedCoupon(null);
    if (!coupon) return;
    try {
      const { data } = await axiosInstance.post('/coupons/apply', { code: coupon });
      const couponDiscount = Number(data.discount) || 0;
      // If discount <= 100, treat as percentage; otherwise flat amount in INR
      let computed = 0;
      if (couponDiscount > 0 && couponDiscount <= 100) {
        computed = Math.round((couponDiscount / 100) * total);
      } else if (couponDiscount > 100) {
        computed = Math.min(couponDiscount, total);
      }
      if (computed <= 0) {
        setCouponStatus('Invalid coupon');
        return;
      }
      setDiscount(computed);
      setAppliedCoupon(String(coupon).trim().toUpperCase());
      setCouponStatus('Coupon applied!');
    } catch (e) {
      setCouponStatus(e.response?.data?.message || 'Invalid coupon');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="hidden md:flex items-center mb-4">
          <Link to="/cart" className="text-blue-600 hover:text-blue-800">
            ← Back to Cart
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        <p className="text-gray-600 mt-2">Complete your purchase securely</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Shipping Information</h2>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <FaMapMarkerAlt />
                  Manage Addresses
                </button>
              </div>

              {/* Saved Addresses Selection */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Saved Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleSelectAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FaMapMarkerAlt className={`text-sm ${
                                selectedAddressId === address.id ? 'text-blue-600' : 'text-gray-400'
                              }`} />
                              <span className="font-medium text-gray-800">{address.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                address.type === 'home' ? 'bg-green-100 text-green-700' :
                                address.type === 'work' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {address.type === 'home' ? 'Home' : address.type === 'work' ? 'Work' : 'Other'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{address.address}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                          </div>
                          {selectedAddressId === address.id && (
                            <FaCheck className="text-blue-600 text-lg flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleManualFormToggle}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add New Address Manually
                  </button>
                </div>
              )}

              {/* Manual Form or Form when no saved addresses */}
              {(!savedAddresses.length || showManualForm || !selectedAddressId) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select name="state" value={formData.state} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required pattern="[1-9][0-9]{5}" maxLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input type="text" name="country" value={formData.country} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                </div>
              </div>
              )}
            </div>
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3" />
                  <FaCreditCard className="text-blue-600 mr-3" />
                  <span className="font-medium">Online Payment (Razorpay)</span>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3" />
                  <FaMoneyBillWave className="text-green-600 mr-3" />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
              </div>
              {/* Credit Card Form */}
              {paymentMethod === 'credit-card' && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input type="text" name="cardholderName" value={cardData.cardholderName} onChange={handleCardInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleCardInputChange} placeholder="1234 5678 9012 3456" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input type="text" name="expiryDate" value={cardData.expiryDate} onChange={handleCardInputChange} placeholder="MM/YY" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input type="text" name="cvv" value={cardData.cvv} onChange={handleCardInputChange} placeholder="123" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Place Order Button */}
            <button 
              type="submit" 
              disabled={loading || cartLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaLock />
                  {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                </>
              )}
            </button>
          </form>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            {/* Coupon Code Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)} className="sm:flex-1 w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter coupon code" />
                <button type="button" onClick={handleApplyCoupon} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto">Apply</button>
              </div>
              {couponStatus && <div className={`mt-1 text-sm ${discount ? 'text-green-600' : 'text-red-600'}`}>{couponStatus}</div>}
            </div>
            {/* Items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatINR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {/* Estimated Delivery Date */}
            {estimatedDeliveryDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-blue-600 text-xl mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Estimated Delivery</h3>
                    <p className="text-sm text-blue-700 font-medium">{estimatedDeliveryDate.formattedDate}</p>
                    <p className="text-xs text-blue-600 mt-1">Delivery in approximately {estimatedDeliveryDate.days} business days</p>
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t pt-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatINR(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Coupon Discount</span>
                  <span className="font-medium text-green-600">- {formatINR(discount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">{formatINR(total - discount)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">✓ Secure checkout with SSL encryption</p>
              <p className="mb-2">✓ 10-day return policy</p>
              <p>✓ Free shipping on all orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Addresses Modal */}
      <ShippingAddresses
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          // Reload saved addresses when modal closes
          const savedAddresses = localStorage.getItem('shippingAddresses');
          if (savedAddresses) {
            try {
              const addresses = JSON.parse(savedAddresses);
              setSavedAddresses(addresses);
            } catch (e) {
              console.error('Error loading saved addresses:', e);
            }
          }
        }}
        onSelectAddress={handleSelectAddress}
      />
    </div>
  );
};

export default Checkout; 