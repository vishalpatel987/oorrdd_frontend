import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaDollarSign, FaChartLine, FaEdit, FaTrash, FaEye, FaPlus, FaStore, FaCheck, FaTimes, FaWallet } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import sellerAPI from '../api/sellerAPI';
import productAPI from '../api/productAPI';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorActionLoading, setVendorActionLoading] = useState(null); // vendorId or null
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [productStockFilter, setProductStockFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    totalVendors: 0,
    pendingVendors: 0
  });

  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [rejectModal, setRejectModal] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [editUserModal, setEditUserModal] = useState({ open: false, user: null });
  const [editUserForm, setEditUserForm] = useState({});
  const [editUserError, setEditUserError] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Vendor details modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  
  // Bulk selection state
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image: null });
  const [categoryError, setCategoryError] = useState('');

  // Wallet state
  const [walletTab, setWalletTab] = useState('overview');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('all');
  const [walletOverview, setWalletOverview] = useState({
    totalSellers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    processedWithdrawals: 0
  });
  const [withdrawalSummary, setWithdrawalSummary] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    processedRequests: 0
  });
  const [sellerEarnings, setSellerEarnings] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [withdrawalEdits, setWithdrawalEdits] = useState({}); // { [id]: { status, transactionId, notes } }
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [withdrawalTrend, setWithdrawalTrend] = useState([]); // [{date, amount}]
  // Admin earnings state
  const [adminSummary, setAdminSummary] = useState({ totalCommission: 0, onlineCommission: 0, codCommission: 0, totalOrders: 0 });
  const [adminTrend, setAdminTrend] = useState([]); // {date, amount}
  const [adminTrendPeriod, setAdminTrendPeriod] = useState('daily');

  // Reports state
  const [salesPeriod, setSalesPeriod] = useState('daily'); // daily | monthly | yearly
  const [salesReport, setSalesReport] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [withdrawTrendPeriod, setWithdrawTrendPeriod] = useState('daily');
  const [topVendorsPeriod, setTopVendorsPeriod] = useState('daily');

  // Event Banner state
  const [eventBanners, setEventBanners] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    endDate: '',
    product: ''
  });
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'rejected':
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending':
      case 'Processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'suspended':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUserStatus = (user) => {
    if (user.isActive === false) return 'blocked';
    if (user.isActive === true) return 'active';
    return 'pending';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-100';
      case 'seller':
        return 'text-blue-600 bg-blue-100';
      case 'customer':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Fetch data functions
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
      const response = await sellerAPI.getAllSellers();
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      } finally {
        setLoadingVendors(false);
      }
    };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axiosInstance.get('/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/analytics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchEventBanners = async () => {
    try {
      const response = await productAPI.getEventBanners();
      setEventBanners(response.data);
    } catch (error) {
      console.error('Error fetching event banners:', error);
    }
  };

  // Wallet data fetch functions
  const fetchWalletOverview = async () => {
    try {
      const response = await axiosInstance.get('/admin/wallet/overview');
      setWalletOverview(response.data);
    } catch (error) {
      console.error('Error fetching wallet overview:', error);
    }
  };

  const fetchSellerEarnings = async () => {
    try {
      const response = await axiosInstance.get('/admin/wallet/seller-earnings');
      setSellerEarnings(response.data);
    } catch (error) {
      console.error('Error fetching seller earnings:', error);
    }
  };

  // Build withdrawals trend (sum of amounts by requestDate)
  const fetchWithdrawalTrend = async () => {
    try {
      const response = await axiosInstance.get('/withdrawals/admin', {
        params: { status: 'all', page: 1, limit: 500 }
      });
      const list = response.data?.data || [];
      const byKey = {};
      list.forEach(w => {
        const d = w.requestDate ? new Date(w.requestDate) : null;
        if (!d) return;
        let key;
        if (withdrawTrendPeriod === 'yearly') {
          key = `${d.getFullYear()}`;
        } else if (withdrawTrendPeriod === 'monthly') {
          key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        } else {
          key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        }
        byKey[key] = (byKey[key] || 0) + (w.amount || 0);
      });
      const series = Object.keys(byKey)
        .sort()
        .map(k => ({ date: k, amount: byKey[k] }));
      setWithdrawalTrend(series);
    } catch (e) {
      console.error('Error building withdrawal trend', e);
      setWithdrawalTrend([]);
    }
  };

  const fetchWithdrawalSummary = async () => {
    try {
      const res = await axiosInstance.get('/withdrawals/admin/summary');
      const data = res.data?.data || res.data || {};
      setWithdrawalSummary({
        totalRequests: data.totalRequests || 0,
        pendingRequests: data.pendingRequests || 0,
        approvedRequests: data.approvedRequests || 0,
        processedRequests: data.processedRequests || 0
      });
    } catch (e) {
      console.error('Error fetching withdrawal summary', e);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      // Use unified withdrawals admin API with pagination + filters
      const response = await axiosInstance.get('/withdrawals/admin', {
        params: {
          status: withdrawalStatusFilter,
          search: withdrawalSearch
        }
      });
      // API returns { success, data, pagination }
      setWithdrawalRequests(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  const handleUpdateWithdrawalStatus = async (id, status, transactionId) => {
    try {
      let body = { status };
      if (status === 'processed') {
        const tx = transactionId !== undefined ? transactionId : window.prompt('Enter transaction/reference ID (optional):', '');
        if (tx) body.transactionId = tx;
      }
      const prevStatus = withdrawalRequests.find(w => w._id === id)?.status;
      await axiosInstance.put(`/withdrawals/admin/${id}/status`, body);
      // Optimistic update for snappy UX (list)
      setWithdrawalRequests((prev) => prev.map(w => w._id === id ? { ...w, status: body.status } : w));
      // Optimistic update for summary counters
      const wasProcessed = prevStatus === 'processing' || prevStatus === 'processed';
      const nowProcessed = body.status === 'processing' || body.status === 'processed';
      const wasPending = prevStatus === 'pending';
      const nowPending = body.status === 'pending';
      const wasApproved = prevStatus === 'approved';
      const nowApproved = body.status === 'approved';
      setWithdrawalSummary((s) => ({
        ...s,
        processedRequests: (s.processedRequests || 0) + (nowProcessed ? 1 : 0) - (wasProcessed ? 1 : 0),
        pendingRequests: (s.pendingRequests || 0) + (nowPending ? 1 : 0) - (wasPending ? 1 : 0),
        approvedRequests: (s.approvedRequests || 0) + (nowApproved ? 1 : 0) - (wasApproved ? 1 : 0),
      }));
      // Refresh list + summary in parallel
      await Promise.all([fetchWithdrawalRequests(), fetchWithdrawalSummary()]);
      toast.success(`Withdrawal ${status} successfully`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaveWithdrawal = async (w) => {
    const edit = withdrawalEdits[w._id] || {};
    const nextStatus = edit.status || w.status;
    await handleUpdateWithdrawalStatus(w._id, nextStatus, edit.transactionId);
    setWithdrawalEdits(prev => ({ ...prev, [w._id]: { ...prev[w._id], transactionId: '' } }));
  };

  const fetchCancellationRequests = async () => {
    try {
      const res = await axiosInstance.get('/admin/orders/cancellation-requests');
      setCancellationRequests(res.data || []);
    } catch (e) {
      console.error('Error fetching cancellation requests', e);
    }
  };

  // Reports fetchers
  const fetchSalesReport = async (period = salesPeriod) => {
    try {
      const res = await axiosInstance.get('/admin/reports/sales', { params: { period } });
      const data = (res.data?.data || []).map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders }));
      setSalesReport(data);
    } catch (e) {
      console.error('Error fetching sales report', e);
    }
  };

  const fetchTopVendors = async () => {
    try {
      const res = await axiosInstance.get('/admin/reports/top-vendors', { params: { limit: 10, period: topVendorsPeriod } });
      const data = (res.data || []).map(d => ({ name: d.shopName || (d._id || '').slice(-4), revenue: d.revenue, orders: d.orders }));
      setTopVendors(data);
    } catch (e) { console.error('Error fetching top vendors', e); }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await axiosInstance.get('/admin/reports/top-products', { params: { limit: 10 } });
      const data = (res.data || []).map(d => ({ name: d.name || (d._id || '').slice(-4), quantity: d.quantity, revenue: d.revenue }));
      setTopProducts(data);
    } catch (e) { console.error('Error fetching top products', e); }
  };

  const fetchAdminEarningsSummary = async () => {
    try {
      const res = await axiosInstance.get('/admin/wallet/admin-earnings');
      setAdminSummary(res.data || { totalCommission: 0, onlineCommission: 0, codCommission: 0, totalOrders: 0 });
    } catch (e) {
      console.error('Error fetching admin earnings summary', e);
    }
  };

  const fetchAdminEarningsTrend = async () => {
    try {
      const res = await axiosInstance.get('/admin/wallet/admin-earnings/trend', { params: { period: adminTrendPeriod } });
      setAdminTrend(res.data || []);
    } catch (e) {
      console.error('Error fetching admin earnings trend', e);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchVendors();
    fetchProducts();
    fetchOrders();
    fetchStats();
    fetchCategories();
    fetchEventBanners();
    fetchWalletOverview();
    fetchSellerEarnings();
    fetchWithdrawalRequests();
    fetchWithdrawalSummary();

    // Reports initial
    fetchSalesReport('daily');
    fetchTopVendors();
    fetchTopProducts();
    fetchCancellationRequests();
  }, []);

  useEffect(() => {
    fetchSalesReport(salesPeriod);
  }, [salesPeriod]);

  // Refresh cancellation requests when switching tabs to overview or orders
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'orders') {
      fetchCancellationRequests();
    }
  }, [activeTab]);

  // Fetch wallet data when tab changes
  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchWalletOverview();
      if (walletTab === 'vendor-earnings') {
        fetchSellerEarnings();
      } else if (walletTab === 'withdrawals') {
        fetchWithdrawalRequests();
        fetchWithdrawalSummary();
      } else if (walletTab === 'overview') {
        // For charts within wallet overview
        fetchSellerEarnings();
        fetchWithdrawalTrend();
      } else if (walletTab === 'admin-earnings') {
        fetchAdminEarningsSummary();
        fetchAdminEarningsTrend();
      }
    }
  }, [activeTab, walletTab, withdrawalStatusFilter, fetchWalletOverview, fetchSellerEarnings, fetchWithdrawalRequests]);

  // Debounce live search for withdrawals
  useEffect(() => {
    if (activeTab === 'wallet' && walletTab === 'withdrawals') {
      const t = setTimeout(() => {
        fetchWithdrawalRequests();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [withdrawalSearch]);

  // Period changes
  useEffect(() => {
    if (activeTab === 'wallet' && walletTab === 'overview') {
      fetchWithdrawalTrend();
    }
  }, [withdrawTrendPeriod]);

  useEffect(() => {
    if (activeTab === 'wallet' && walletTab === 'overview') {
      fetchTopVendors();
    }
  }, [topVendorsPeriod]);

  useEffect(() => {
    if (activeTab === 'wallet' && walletTab === 'admin-earnings') {
      fetchAdminEarningsTrend();
    }
  }, [adminTrendPeriod]);

  // Vendor management functions
  const handleViewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const handleVendorAction = async (vendorId, action) => {
    setVendorActionLoading(vendorId + action);
    try {
      if (action === 'approve') {
        await sellerAPI.approveSeller(vendorId);
        alert('Vendor approved successfully!');
      } else if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason (optional):') || 'Rejected by admin';
        await sellerAPI.rejectSeller(vendorId, reason);
        alert('Vendor rejected successfully!');
      } else if (action === 'suspend') {
        const reason = window.prompt('Enter suspension reason (optional):') || 'Suspended by admin';
        await axiosInstance.put(`/admin/sellers/${vendorId}/suspend`, { reason });
        alert('Vendor suspended successfully!');
      } else if (action === 'activate') {
        await axiosInstance.put(`/admin/sellers/${vendorId}/activate`);
        alert('Vendor activated successfully!');
      }
      fetchVendors(); // Refresh vendors list
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} vendor`;
      alert(`Error: ${errorMessage}`);
    } finally {
      setVendorActionLoading(null);
    }
  };

  const handleApproveAllPending = async () => {
    const pendingVendors = vendors.filter(v => !v.isApproved && !v.rejectionReason);
    for (const vendor of pendingVendors) {
      await handleVendorAction(vendor._id, 'approve');
    }
  };

  const handleAddVendor = () => {
    // Navigate to vendor registration page
    window.location.href = '/vendor-registration';
  };

  const handleAddUser = () => {
    // Open add user modal
    setEditUserModal({ open: true, user: null });
    setEditUserForm({ name: '', email: '', password: '', role: 'customer', isActive: true });
    setEditUserError('');
  };

  // Product management functions
  const handleApprove = async (id) => {
    setActionLoading(id + 'approve');
    try {
      await productAPI.approveProduct(id);
      setProducts(products.map(p => p._id === id ? { ...p, isApproved: true, rejectionReason: undefined } : p));
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Error approving product. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, reason) => {
    setActionLoading(id + 'reject');
    try {
      await productAPI.rejectProduct(id, reason);
      setProducts(products.map(p => p._id === id ? { ...p, isApproved: false, rejectionReason: reason } : p));
      setRejectModal({ open: false, product: null });
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Error rejecting product. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setActionLoading(id + 'delete');
    try {
      await productAPI.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (product) => {
    setEditForm({ ...product, price: product.price || '', stock: product.stock || '' });
    setEditModal({ open: true, product });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setActionLoading(editModal.product._id + 'edit');
    try {
      const res = await productAPI.editProduct(editModal.product._id, editForm);
      setProducts(products.map(p => p._id === editModal.product._id ? res.data : p));
      setEditModal({ open: false, product: null });
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  // User management functions
  const handleEditUser = (user) => {
    setEditUserForm({ ...user });
    setEditUserModal({ open: true, user });
    setEditUserError('');
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditUserError('');
    const loadingId = editUserModal.user ? editUserModal.user._id + 'edit' : 'new-user';
    setUserActionLoading(loadingId);
    try {
      let res;
      if (editUserModal.user) {
        // Update existing user
        res = await axiosInstance.put(`/admin/users/${editUserModal.user._id}`, editUserForm);
      setUsers(users.map(u => u._id === editUserModal.user._id ? res.data : u));
      } else {
        // Create new user
        res = await axiosInstance.post('/admin/users', editUserForm);
        setUsers([...users, res.data]);
      }
      setEditUserModal({ open: false, user: null });
    } catch (err) {
      setEditUserError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setUserActionLoading(id + 'delete');
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } finally {
      setUserActionLoading(null);
    }
  };

  // Block user
  const handleBlockUser = async (id) => {
    if (!window.confirm('Block this user?')) return;
    setUserActionLoading(id + 'block');
    try {
      await axiosInstance.put(`/admin/users/${id}/block`);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: false } : u));
    } finally {
      setUserActionLoading(null);
    }
  };

  // Unblock user
  const handleUnblockUser = async (id) => {
    if (!window.confirm('Unblock this user?')) return;
    setUserActionLoading(id + 'unblock');
    try {
      await axiosInstance.put(`/admin/users/${id}/unblock`);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: true } : u));
    } finally {
      setUserActionLoading(null);
    }
  };

  // View user orders
  const handleViewUserOrders = async (user) => {
    setUserActionLoading(user._id + 'orders');
    try {
      const response = await axiosInstance.get(`/admin/users/${user._id}/orders`);
      setSelectedOrder({ ...user, orders: response.data });
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Bulk selection functions
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      console.log('Selected products:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAllProducts = () => {
    // Allow selection of all products (pending, approved, and rejected)
    const selectableProducts = products; // All products can be selected
    
    if (selectedProducts.length === selectableProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(selectableProducts.map(p => p._id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to approve');
      return;
    }
    
    setBulkActionLoading(true);
    try {
      console.log('Bulk approving products:', selectedProducts);
      
      const response = await axiosInstance.post('/admin/products/bulk-approve', {
        productIds: selectedProducts
      });
      
      console.log('Bulk approve response:', response.data);
      
      // Update products state - approve all selected products regardless of their current status
      setProducts(products.map(product => 
        selectedProducts.includes(product._id) 
          ? { ...product, isApproved: true, rejectionReason: undefined }
          : product
      ));
      
      setSelectedProducts([]);
      alert(`Successfully approved ${response.data.approvedCount || selectedProducts.length} products`);
    } catch (error) {
      console.error('Error bulk approving products:', error);
      console.error('Error response:', error.response?.data);
      alert(`Error approving products: ${error.response?.data?.message || error.message}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to reject');
      return;
    }
    
    const reason = prompt('Enter rejection reason:');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }
    
    setBulkActionLoading(true);
    try {
      console.log('Bulk rejecting products:', selectedProducts, 'Reason:', reason);
      console.log('API URL:', '/admin/products/bulk-reject');
      console.log('Request payload:', {
        productIds: selectedProducts,
        reason: reason.trim()
      });
      
      // Test API connectivity first
      try {
        const testResponse = await axiosInstance.get('/admin/products');
        console.log('Test API call successful:', testResponse.status);
      } catch (testError) {
        console.error('Test API call failed:', testError);
        throw new Error('Backend server not accessible');
      }
      
      const response = await axiosInstance.post('/admin/products/bulk-reject', {
        productIds: selectedProducts,
        reason: reason.trim()
      });
      
      console.log('Bulk reject response:', response.data);
      
      // Update products state - reject all selected products regardless of their current status
      setProducts(products.map(product => 
        selectedProducts.includes(product._id) 
          ? { ...product, isApproved: false, rejectionReason: reason.trim() }
          : product
      ));
      
      setSelectedProducts([]);
      alert(`Successfully rejected ${response.data.rejectedCount || selectedProducts.length} products`);
    } catch (error) {
      console.error('Error bulk rejecting products:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Error rejecting products: ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      alert(errorMessage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Category management functions
  const handleOpenCategoryModal = (category = null) => {
    setCategoryForm(category ? { ...category, image: null } : { name: '', slug: '', description: '', image: null });
    setCategoryModal({ open: true, category });
    setCategoryError('');
  };

  const handleCategoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setCategoryForm({ ...categoryForm, [name]: files[0] });
    } else {
      setCategoryForm({ ...categoryForm, [name]: value });
    }
  };

  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    try {
      const formData = new FormData();
      Object.keys(categoryForm).forEach(key => {
        if (categoryForm[key] !== null && categoryForm[key] !== '') {
          formData.append(key, categoryForm[key]);
        }
      });

      if (categoryModal.category) {
        await productAPI.updateCategory(categoryModal.category._id, formData);
      } else {
        await productAPI.createCategory(formData);
      }
      
      fetchCategories();
      setCategoryModal({ open: false, category: null });
    } catch (error) {
      setCategoryError(error.response?.data?.message || 'Failed to save category');
    }
  };

  // Event Banner functions
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm({ ...eventForm, [name]: value });
  };

  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    setEventError('');
    setEventLoading(true);
    try {
      await productAPI.createEventBanner(eventForm);
      setEventForm({ title: '', description: '', endDate: '', product: '' });
      fetchEventBanners();
    } catch (error) {
      setEventError(error.response?.data?.message || 'Failed to create event banner');
    } finally {
      setEventLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, vendors, products, and platform analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{typeof stats.totalUsers === 'number' ? stats.totalUsers.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaStore className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-800">{typeof stats.totalVendors === 'number' ? stats.totalVendors.toLocaleString() : '0'}</p>
              <p className="text-xs text-yellow-600">{typeof stats.pendingVendors === 'number' ? stats.pendingVendors.toLocaleString() : '0'} pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaDollarSign className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{formatINR(typeof stats.totalSales === 'number' ? stats.totalSales : 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <FaChartLine className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{typeof stats.totalOrders === 'number' ? stats.totalOrders.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 admin-tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendors
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('event-banner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'event-banner'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Event Banner
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wallet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wallet
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Vendors</h3>
                  <div className="space-y-3">
                    {vendors
                      .slice()
                      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                      .slice(0, 5)
                      .map((vendor) => (
                      <div key={vendor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{vendor.shopName}</p>
                          <p className="text-sm text-gray-600">{vendor.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block w-fit px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.isApproved ? 'approved' : vendor.rejectionReason ? 'rejected' : 'pending')}`}>
                            {vendor.isApproved ? 'Approved' : vendor.rejectionReason ? 'Rejected' : 'Pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber || order._id}</p>
                          <p className="text-sm text-gray-600">{order.user?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">${order.total}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('vendors')}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaStore className="text-blue-600 text-2xl mb-2" />
                    <p className="font-medium">Manage Vendors</p>
                    <p className="text-sm text-gray-600">{stats.pendingVendors} pending approval</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FaBox className="text-green-600 text-2xl mb-2" />
                    <p className="font-medium">Manage Products</p>
                    <p className="text-sm text-gray-600">{products.filter(p => !p.isApproved).length} pending approval</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FaChartLine className="text-purple-600 text-2xl mb-2" />
                    <p className="font-medium">View Orders</p>
                    <p className="text-sm text-gray-600">{stats.totalOrders} total orders</p>
                  </button>
                </div>
              </div>

              {/* Sales Overview (moved from Wallet → Overview) */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Sales Overview</h3>
                  <select
                    value={salesPeriod}
                    onChange={e => setSalesPeriod(e.target.value)}
                    className="border border-gray-300 text-sm rounded px-2 py-1"
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={salesReport} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(l) => `Period: ${l}`} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {Array.isArray(salesReport) && salesReport.length === 0 && (
                  <p className="text-center text-sm text-gray-500 mt-2">No sales data yet. Create some orders to see the chart.</p>
                )}
              </div>

              {/* Top Vendors & Top Products (moved from Wallet → Overview) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold mb-3">Top Vendors</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={topVendors} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={50} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => formatINR(v)} />
                        <Bar dataKey="revenue" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {Array.isArray(topVendors) && topVendors.length === 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">No vendor revenue yet.</p>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold mb-3">Top Products</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={topProducts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={50} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="quantity" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {Array.isArray(topProducts) && topProducts.length === 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">No product sales yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Vendor Management</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveAllPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <FaCheck />
                    Approve All Pending
                  </button>
                  <button
                    onClick={handleAddVendor}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaPlus />
                    Add Vendor
                  </button>
                </div>
              </div>

                  <div className="overflow-x-auto">
                <table className="w-full">
                      <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Business Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                    {loadingVendors ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-500">Loading vendors...</td>
                      </tr>
                    ) : (
                      vendors.map((vendor) => (
                        <tr key={vendor._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-800">{vendor.shopName}</td>
                          <td className="py-3 px-4 text-gray-600">{vendor.email}</td>
                            <td className="px-4 py-2 border">{vendor.phone}</td>
                            <td className="px-4 py-2 border">{vendor.businessInfo?.businessType || '-'}</td>
                          <td className="px-4 py-2 border">
                            <span className={`inline-block w-fit px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.isApproved ? 'approved' : vendor.rejectionReason ? 'rejected' : vendor.isSuspended ? 'suspended' : 'pending')}`}>
                              {vendor.isApproved ? (vendor.isSuspended ? 'Suspended' : 'Approved') : vendor.rejectionReason ? 'Rejected' : 'Pending'}
                            </span>
                          </td>
                            <td className="px-4 py-2 border">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 border">
                            <div className="flex flex-wrap gap-1">
                              <button
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleViewVendorDetails(vendor)}
                              >
                                View Details
                              </button>
                              {!vendor.isApproved && !vendor.rejectionReason && (
                                <>
                                  <button
                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                    onClick={() => handleVendorAction(vendor._id, 'approve')}
                                    disabled={vendorActionLoading === vendor._id + 'approve'}
                                  >
                                    {vendorActionLoading === vendor._id + 'approve' ? 'Approving...' : 'Approve'}
                                  </button>
                                  <button
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                    onClick={() => handleVendorAction(vendor._id, 'reject')}
                                    disabled={vendorActionLoading === vendor._id + 'reject'}
                                  >
                                    {vendorActionLoading === vendor._id + 'reject' ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {vendor.rejectionReason && (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded" title={vendor.rejectionReason}>
                                  Rejected
                                </span>
                              )}
                              {vendor.isApproved && !vendor.isSuspended && (
                                <button
                                  className="bg-orange-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                  onClick={() => handleVendorAction(vendor._id, 'suspend')}
                                  disabled={vendorActionLoading === vendor._id + 'suspend'}
                                >
                                  {vendorActionLoading === vendor._id + 'suspend' ? 'Suspending...' : 'Suspend'}
                                </button>
                              )}
                              {vendor.isApproved && vendor.isSuspended && (
                                <button
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                  onClick={() => handleVendorAction(vendor._id, 'activate')}
                                  disabled={vendorActionLoading === vendor._id + 'activate'}
                                >
                                  {vendorActionLoading === vendor._id + 'activate' ? 'Activating...' : 'Activate'}
                                </button>
                              )}
                            </div>
                          </td>
                          </tr>
                      ))
                    )}
                      </tbody>
                    </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => handleAddUser()}
                >
                  <FaPlus />
                  Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getUserStatus(user))}`}>{getUserStatus(user)}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewUserOrders(user)} disabled={userActionLoading === user._id + 'orders'} title="View Orders">
                              <FaEye />
                            </button>
                            <button className="text-green-600 hover:text-green-800" onClick={() => handleEditUser(user)} disabled={userActionLoading === user._id + 'edit'} title="Edit User">
                              <FaEdit />
                            </button>
                            {user.isActive ? (
                              <button className="text-orange-600 hover:text-orange-800" onClick={() => handleBlockUser(user._id)} disabled={userActionLoading === user._id + 'block'} title="Block User">
                                <FaTimes />
                              </button>
                            ) : (
                              <button className="text-green-600 hover:text-green-800" onClick={() => handleUnblockUser(user._id)} disabled={userActionLoading === user._id + 'unblock'} title="Unblock User">
                                <FaCheck />
                              </button>
                            )}
                            <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteUser(user._id)} disabled={userActionLoading === user._id + 'delete'} title="Delete User">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit User Modal */}
              {editUserModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditUserModal({ open: false, user: null })}>&times;</button>
                    <h2 className="text-xl font-bold mb-4">{editUserModal.user ? 'Edit User' : 'Add New User'}</h2>
                    {editUserError && <div className="text-red-500 mb-2">{editUserError}</div>}
                    <form onSubmit={handleEditUserSubmit} className="space-y-4">
                      <input type="text" className="form-input" placeholder="Name" value={editUserForm.name || ''} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} required />
                      <input type="email" className="form-input" placeholder="Email" value={editUserForm.email || ''} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} required />
                      {!editUserModal.user && (
                        <input type="password" className="form-input" placeholder="Password" value={editUserForm.password || ''} onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })} required />
                      )}
                      <select className="form-input" value={editUserForm.role || ''} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })} required>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                      </select>
                      <select className="form-input" value={editUserForm.isActive === true ? 'active' : editUserForm.isActive === false ? 'blocked' : ''} onChange={e => setEditUserForm({ ...editUserForm, isActive: e.target.value === 'active' })} required>
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <button type="submit" className="btn-primary w-full" disabled={userActionLoading === (editUserModal.user ? editUserModal.user._id + 'edit' : 'new-user')}>
                        {userActionLoading === (editUserModal.user ? editUserModal.user._id + 'edit' : 'new-user') ? 
                          (editUserModal.user ? 'Updating...' : 'Creating...') : 
                          (editUserModal.user ? 'Update User' : 'Create User')}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Product Management</h3>
                  <p className="text-sm text-gray-600">
                    Showing {products.filter(product => {
                      const matchesSearch = !productSearch || 
                        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        product.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                        product.seller?.shopName?.toLowerCase().includes(productSearch.toLowerCase());
                      
                      const matchesStatus = !productStatusFilter || 
                        (productStatusFilter === 'approved' && product.isApproved) ||
                        (productStatusFilter === 'pending' && !product.isApproved && !product.rejectionReason) ||
                        (productStatusFilter === 'rejected' && product.rejectionReason);
                      
                      const matchesStock = !productStockFilter ||
                        (productStockFilter === 'in-stock' && product.stock > 10) ||
                        (productStockFilter === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
                        (productStockFilter === 'out-of-stock' && product.stock === 0);
                      
                      return matchesSearch && matchesStatus && matchesStock;
                    }).length} of {products.length} products
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Manage all products from vendors
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search products by name, brand, or vendor..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                          </div>
                <div className="flex gap-2">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value)}
                  >
                    <option value="">All Stock</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                        </div>
              </div>

              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-blue-800">
                        {selectedProducts.length} product(s) selected
                        {selectedProducts.length > 0 && (
                          <div className="mt-1 text-xs text-gray-600">
                            {(() => {
                              const selected = products.filter(p => selectedProducts.includes(p._id));
                              const pending = selected.filter(p => !p.isApproved && !p.rejectionReason).length;
                              const approved = selected.filter(p => p.isApproved && !p.rejectionReason).length;
                              const rejected = selected.filter(p => p.rejectionReason).length;
                              return `Pending: ${pending}, Approved: ${approved}, Rejected: ${rejected}`;
                            })()}
                          </div>
                        )}
                      </span>
                          <button
                        onClick={() => setSelectedProducts([])}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear Selection
                          </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleBulkApprove}
                        disabled={bulkActionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <FaCheck />
                        <span>Approve Selected</span>
                      </button>
                      <button
                        onClick={() => {
                          console.log('Reject Selected button clicked');
                          console.log('Selected products:', selectedProducts);
                          handleBulkReject();
                        }}
                        disabled={bulkActionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <FaTimes />
                        <span>Reject Selected</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={products.length > 0 && selectedProducts.length === products.length}
                          onChange={handleSelectAllProducts}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
              {loadingProducts ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-500">Loading products...</td>
                      </tr>
                    ) : (
                      products
                        .filter(product => {
                          const matchesSearch = !productSearch || 
                            product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            product.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                            product.seller?.shopName?.toLowerCase().includes(productSearch.toLowerCase());
                          
                          const matchesStatus = !productStatusFilter || 
                            (productStatusFilter === 'approved' && product.isApproved) ||
                            (productStatusFilter === 'pending' && !product.isApproved && !product.rejectionReason) ||
                            (productStatusFilter === 'rejected' && product.rejectionReason);
                          
                          const matchesStock = !productStockFilter ||
                            (productStockFilter === 'in-stock' && product.stock > 10) ||
                            (productStockFilter === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
                            (productStockFilter === 'out-of-stock' && product.stock === 0);
                          
                          return matchesSearch && matchesStatus && matchesStock;
                        })
                        .map((product) => (
                        <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleSelectProduct(product._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img src={product.images?.[0]?.url || '/product-images/default.webp'} alt={product.name} className="w-10 h-10 object-cover rounded mr-3" />
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{formatINR(product.price)}</td>
                          <td className="py-3 px-4 text-gray-600">{product.stock}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <span className="text-blue-600 font-medium text-sm">
                                  {product.seller?.shopName?.charAt(0) || 'V'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{product.seller?.shopName || 'Unknown Vendor'}</p>
                                <p className="text-xs text-gray-500">{product.seller?.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-block w-fit px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.isApproved ? 'approved' : product.rejectionReason ? 'rejected' : 'pending')}`}>
                                {product.isApproved ? 'Approved' : product.rejectionReason ? 'Rejected' : 'Pending'}
                              </span>
                              {product.stock === 0 && (
                                <span className="inline-block w-fit px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                  Out of Stock
                                </span>
                              )}
                              {product.stock > 0 && product.stock <= 10 && (
                                <span className="inline-block w-fit px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              <button
                                className="text-blue-600 hover:text-blue-800 p-1 rounded" 
                                onClick={() => handleViewProduct(product)} 
                                title="View Details"
                              >
                                <FaEye />
                          </button>
                              {!product.isApproved && !product.rejectionReason && (
                          <button
                                  className="text-green-600 hover:text-green-800 p-1 rounded" 
                                onClick={() => handleApprove(product._id)}
                                  disabled={actionLoading === product._id + 'approve'}
                                  title="Approve Product"
                              >
                                  <FaCheck />
                              </button>
                              )}
                              {!product.isApproved && !product.rejectionReason && (
                              <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded" 
                                onClick={() => setRejectModal({ open: true, product })}
                                  title="Reject Product"
                              >
                                <FaTimes />
                              </button>
                          )}
                              {product.isApproved && !product.rejectionReason && (
                              <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded" 
                                onClick={() => setRejectModal({ open: true, product })}
                                  title="Reject Product"
                              >
                                <FaTimes />
                              </button>
                              )}
                              {product.rejectionReason && (
                              <button
                                  className="text-green-600 hover:text-green-800 p-1 rounded" 
                                onClick={() => handleApprove(product._id)}
                                  disabled={actionLoading === product._id + 'approve'}
                                  title="Approve Product"
                              >
                                <FaCheck />
                              </button>
                              )}
                        </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                      </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Order Management</h3>
              </div>

              {/* Pending Cancellation Requests */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Cancellation Requests</h4>
                  <button className="text-sm text-blue-600" onClick={fetchCancellationRequests}>Refresh</button>
                </div>
                {cancellationRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">No pending requests</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Order</th>
                          <th className="text-left py-2 px-2">Customer</th>
                          <th className="text-left py-2 px-2">Seller</th>
                          <th className="text-left py-2 px-2">Total</th>
                          <th className="text-left py-2 px-2">Reason</th>
                          <th className="text-left py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancellationRequests.map((o) => (
                          <tr key={o._id} className="border-b">
                            <td className="py-2 px-2">{o.orderNumber || o._id}</td>
                            <td className="py-2 px-2">{o.user?.name || o.user?.email}</td>
                            <td className="py-2 px-2">{o.seller?.shopName || '-'}</td>
                            <td className="py-2 px-2">{formatINR(o.totalPrice || 0)}</td>
                            <td className="py-2 px-2 max-w-[240px] truncate" title={o.cancellationRequestReason || ''}>{o.cancellationRequestReason || '-'}</td>
                            <td className="py-2 px-2">
                              <div className="flex gap-2">
                                {o.cancellationRequested && o.orderStatus !== 'cancelled' && (
                                  <button className="px-3 py-1 bg-red-600 text-white rounded text-xs" onClick={async () => {
                                    try {
                                      await axiosInstance.put(`/admin/orders/${o._id}/approve-cancel`);
                                      toast.success('Cancellation approved');
                                      fetchCancellationRequests();
                                    } catch (e) {
                                      toast.error(e.response?.data?.message || 'Approve failed');
                                    }
                                  }}>Approve</button>
                                )}
                                {o.refundStatus === 'pending' && o.paymentMethod !== 'cod' && (
                                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs" onClick={async () => {
                                    try {
                                      const res = await axiosInstance.put(`/admin/orders/${o._id}/refund`);
                                      toast.success(res.data?.message || 'Refund processed');
                                      fetchCancellationRequests();
                                    } catch (e) {
                                      toast.error(e.response?.data?.message || 'Refund failed');
                                    }
                                  }}>Refund</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">#{order.orderNumber || order._id}</td>
                        <td className="py-3 px-4 text-gray-600">{order.user?.name}</td>
                        <td className="py-3 px-4 text-gray-600">{order.seller?.shopName}</td>
                        <td className="py-3 px-4 font-medium">{formatINR(order.totalPrice)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewOrder(order)}><FaEye /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

              {/* Order Details Modal */}
              {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl mx-2 relative overflow-y-auto max-h-[90vh]">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={handleCloseOrderModal}>&times;</button>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedOrder.orders ? `Orders for ${selectedOrder.name}` : 'Order Details'}
                </h2>
                
                {selectedOrder.orders ? (
                  // User Orders View
                  <div className="space-y-4">
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">User Information</h3>
                      <p><strong>Name:</strong> {selectedOrder.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                      <p><strong>Role:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedOrder.role)}`}>{selectedOrder.role}</span></p>
                      <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getUserStatus(selectedOrder))}`}>{getUserStatus(selectedOrder)}</span></p>
                      <p><strong>Total Orders:</strong> {selectedOrder.orders.length}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">Order History</h3>
                      {selectedOrder.orders.length === 0 ? (
                        <p className="text-gray-500">No orders found for this user.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedOrder.orders.map((order) => (
                            <div key={order._id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">Order #{order.orderNumber || order._id}</p>
                                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-blue-600">{formatINR(order.totalPrice)}</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p><strong>Seller:</strong> {order.seller?.shopName}</p>
                                <p><strong>Payment:</strong> {order.paymentMethod}</p>
                                <p><strong>Items:</strong> {order.orderItems.length} item(s)</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Single Order View
                  <div className="space-y-4">
                    <div className="mb-2 text-sm text-gray-600">Order #: <span className="font-mono">{selectedOrder.orderNumber || selectedOrder._id}</span></div>
                    <div className="mb-2 text-sm text-gray-600">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    <div className="mb-2 text-sm text-gray-600">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span></div>
                    <div className="mb-2 text-sm text-gray-600">Customer: {selectedOrder.user?.name} ({selectedOrder.user?.email})</div>
                    <div className="mb-2 text-sm text-gray-600">Seller: {selectedOrder.seller?.shopName}</div>
                    <div className="mb-2 text-sm text-gray-600">Payment: {selectedOrder.paymentMethod}</div>
                    <div className="mb-2 text-sm text-gray-600">Shipping: {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}</div>
                    <div className="mb-2 text-sm text-gray-600">Items:</div>
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
                    <div className="text-right font-bold text-lg">Total: {formatINR(selectedOrder.totalPrice)}</div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Category Management</h3>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => handleOpenCategoryModal()}
                  >
                  <FaPlus />
                  Add Category
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingCategories ? (
                  <div className="col-span-full text-center py-8 text-gray-500">Loading categories...</div>
                ) : (
                  categories.map((category) => (
                    <div key={category._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                        <div className="flex space-x-1">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleOpenCategoryModal(category)}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      {category.image && (
                        <img src={category.image} alt={category.name} className="w-full h-24 object-cover rounded" />
                      )}
                  </div>
                  ))
              )}
              </div>

              {/* Category Modal */}
              {categoryModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setCategoryModal({ open: false, category: null })}>&times;</button>
                    <h2 className="text-xl font-bold mb-4">{categoryModal.category && categoryModal.category._id ? 'Edit Category' : 'Add Category'}</h2>
                    <form onSubmit={handleCategoryFormSubmit}>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Name</label>
                        <input type="text" name="name" value={categoryForm.name} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Slug</label>
                        <input type="text" name="slug" value={categoryForm.slug} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Description</label>
                        <textarea name="description" value={categoryForm.description} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Image</label>
                        <input type="file" name="image" accept="image/*" onChange={handleCategoryFormChange} className="w-full" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Parent Category</label>
                        <select name="parentCategory" value={categoryForm.parentCategory || ''} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2">
                          <option value="">None (Main Category)</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      {categoryError && <div className="text-red-600 mb-2">{categoryError}</div>}
                      <div className="flex justify-end gap-2">
                        <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => setCategoryModal({ open: false, category: null })}>Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event Banner Tab */}
          {activeTab === 'event-banner' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Event Banner Management</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold mb-4">Create New Event Banner</h4>
              <form onSubmit={handleEventFormSubmit} className="space-y-4 max-w-xl w-full">
                <div>
                  <label className="block font-medium mb-1">Event Title</label>
                  <input type="text" name="title" className="form-input w-full" value={eventForm.title} onChange={handleEventFormChange} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Event Description</label>
                  <textarea name="description" className="form-input w-full" value={eventForm.description} onChange={handleEventFormChange} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Event End Date/Time</label>
                  <input type="datetime-local" name="endDate" className="form-input w-full" value={eventForm.endDate} onChange={handleEventFormChange} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Select Product for Banner</label>
                  <select name="product" className="form-input w-full" value={eventForm.product} onChange={handleEventFormChange} required>
                    <option value="">Select a product</option>
                    {products.filter(p => p.isApproved).map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {eventError && <div className="text-red-500">{eventError}</div>}
                <button type="submit" className="btn-primary" disabled={eventLoading}>{eventLoading ? 'Saving...' : 'Save Event Banner'}</button>
              </form>
              </div>

                    <div>
                <h4 className="text-md font-semibold mb-4">Active Event Banners</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventBanners.map((banner) => (
                    <div key={banner._id} className="bg-white border rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2">{banner.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{banner.description}</p>
                      <p className="text-xs text-gray-500">Ends: {new Date(banner.endDate).toLocaleString()}</p>
                    </div>
                  ))}
                    </div>
                  </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Wallet Management Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
                    <FaWallet className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Wallet Management</h2>
                    <p className="text-blue-100">Manage platform finances, withdrawals, and vendor earnings</p>
                  </div>
                </div>
              </div>

              {/* Wallet Tabs */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setWalletTab('overview')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    walletTab === 'overview'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-current rounded-sm"></div>
                    <span>Overview</span>
                  </div>
                  <p className="text-xs mt-1">Platform financial summary</p>
                </button>
                <button
                  onClick={() => setWalletTab('withdrawals')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    walletTab === 'withdrawals'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaWallet className="w-4 h-4" />
                    <span>Withdrawals</span>
                  </div>
                  <p className="text-xs mt-1">Manage withdrawal requests</p>
                </button>
                <button
                  onClick={() => setWalletTab('vendor-earnings')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    walletTab === 'vendor-earnings' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaChartLine className="w-4 h-4" />
                    <span>Vendor Earnings</span>
                  </div>
                  <p className="text-xs mt-1">Track vendor performance</p>
                </button>
                <button
                  onClick={() => setWalletTab('admin-earnings')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    walletTab === 'admin-earnings' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaDollarSign className="w-4 h-4" />
                    <span>Admin Earnings</span>
                  </div>
                  <p className="text-xs mt-1">Platform commission summary</p>
                </button>
              </div>

              {/* Overview Tab */}
              {walletTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <FaUsers className="text-xl" />
                            </div>
                            <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                          <p className="text-2xl font-bold text-gray-800">{walletOverview.totalSellers}</p>
                            </div>
                          </div>
                          </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                          <FaDollarSign className="text-xl" />
                            </div>
                            <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                          <p className="text-2xl font-bold text-gray-800">{walletOverview.totalWithdrawals}</p>
                            </div>
                          </div>
                          </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                          <FaTimes className="text-xl" />
                            </div>
                            <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                          <p className="text-2xl font-bold text-gray-800">{walletOverview.pendingWithdrawals}</p>
                            </div>
                          </div>
                          </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                          <FaCheck className="text-xl" />
                            </div>
                            <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Processed Withdrawals</p>
                          <p className="text-2xl font-bold text-gray-800">{walletOverview.processedWithdrawals}</p>
                            </div>
                          </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Withdrawal Trends Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Withdrawal Trends</h3>
                        <select
                          value={withdrawTrendPeriod}
                          onChange={(e) => setWithdrawTrendPeriod(e.target.value)}
                          className="border border-gray-300 text-sm rounded px-2 py-1"
                        >
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <LineChart data={withdrawalTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(l) => `Date: ${l}`} />
                            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      {withdrawalTrend.length === 0 && (
                        <p className="text-center text-sm text-gray-500 mt-2">No withdrawal data yet.</p>
                      )}
                    </div>
                    
                    {/* Top Vendors Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Top Vendors by Earnings</h3>
                        <select
                          value={topVendorsPeriod}
                          onChange={(e) => setTopVendorsPeriod(e.target.value)}
                          className="border border-gray-300 text-sm rounded px-2 py-1"
                        >
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={sellerEarnings
                            .slice()
                            .sort((a,b) => (b.totalEarnings||0) - (a.totalEarnings||0))
                            .slice(0,5)
                            .map(v => ({ name: v.shopName || 'Vendor', revenue: v.totalEarnings || 0 }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={50} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v) => formatINR(v)} />
                            <Bar dataKey="revenue" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {(!sellerEarnings || sellerEarnings.length === 0) && (
                        <p className="text-center text-sm text-gray-500 mt-2">No vendor earnings data yet.</p>
                      )}
                    </div>
                  </div>

              {/* Charts moved to Main Overview */}

               {/* Cancellation Requests removed from Wallet Overview */}
                </div>
              )}

              {/* Withdrawals Tab */}
              {walletTab === 'withdrawals' && (
                <div className="space-y-6">
                  {/* Withdrawal Management Header */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Withdrawal Management</h3>
                    <p className="text-gray-600">Manage vendor withdrawal requests</p>
                  </div>

                  {/* Withdrawal Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <FaEye className="text-xl" />
                              </div>
                              <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Requests</p>
                          <p className="text-2xl font-bold text-gray-800">{withdrawalSummary.totalRequests}</p>
                              </div>
                            </div>
                            </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                          <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                              <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Pending</p>
                          <p className="text-2xl font-bold text-gray-800">{withdrawalSummary.pendingRequests}</p>
                              </div>
                            </div>
                            </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                          <FaCheck className="text-xl" />
                              </div>
                              <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Approved</p>
                          <p className="text-2xl font-bold text-gray-800">{withdrawalSummary.approvedRequests}</p>
                              </div>
                            </div>
                            </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <FaCheck className="text-xl" />
                              </div>
                              <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Processed</p>
                          <p className="text-2xl font-bold text-gray-800">{withdrawalSummary.processedRequests}</p>
                              </div>
                            </div>
                      </div>
                    </div>

                    {/* Search and Filter */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <FaEye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by vendor name, email, or withdrawal ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={withdrawalSearch}
                            onChange={(e) => setWithdrawalSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="md:w-48">
                      <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={withdrawalStatusFilter}
                        onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                          <option value="rejected">Rejected</option>
                      </select>
                    </div>
                                  </div>
                                </div>
                                
                  {/* Withdrawal Requests List */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-800">Withdrawal Requests ({withdrawalRequests.length})</h4>
                      <button
                        onClick={fetchWithdrawalRequests}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="p-6">
                      {withdrawalRequests.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaWallet className="text-gray-400 text-2xl" />
                          </div>
                          <p className="text-gray-500 text-lg">No withdrawal requests found</p>
                          <p className="text-gray-400 text-sm">Withdrawal requests will appear here when sellers make requests</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {withdrawalRequests.map((w) => (
                            <div key={w._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-gray-800 text-base">
                                    {w.seller?.name || 'Unknown Seller'}
                                  </div>
                                  <div className="text-gray-600 text-sm">{w.seller?.email || '-'}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-gray-800 font-semibold">{formatINR(w.amount || 0)}</div>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(w.status)}`}>
                                    {w.status}
                                  </span>
                                  <div className="text-gray-500 text-sm hidden md:block">
                                    {w.requestDate ? new Date(w.requestDate).toLocaleString() : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-gray-500 text-sm">
                                <div>Method: {w.paymentMethod?.replace('razorpay_', '').toUpperCase()}</div>
                                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                  {w.paymentMethod === 'razorpay_bank' && (
                                    <>
                                      <div>Account Holder: <span className="text-gray-700">{w.paymentDetails?.accountHolderName || '-'}</span></div>
                                      <div>Bank Name: <span className="text-gray-700">{w.paymentDetails?.bankName || '-'}</span></div>
                                      <div>Account Number: <span className="text-gray-700">{w.paymentDetails?.accountNumber || '-'}</span></div>
                                      <div>IFSC: <span className="text-gray-700">{w.paymentDetails?.ifscCode || '-'}</span></div>
                                    </>
                                  )}
                                  {w.paymentMethod === 'razorpay_upi' && (
                                    <div>UPI ID: <span className="text-gray-700">{w.paymentDetails?.upiId || '-'}</span></div>
                                  )}
                                  {w.paymentMethod === 'razorpay_wallet' && (
                                    <>
                                      <div>Wallet: <span className="text-gray-700">{w.paymentDetails?.walletType || '-'}</span></div>
                                      <div>Wallet ID: <span className="text-gray-700">{w.paymentDetails?.walletId || '-'}</span></div>
                                    </>
                                  )}
                                  <div>Request ID: <span className="text-gray-700 font-mono">{w._id}</span></div>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-col md:flex-row md:items-end gap-2 md:gap-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Change Status</label>
                                  <select
                                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={(withdrawalEdits[w._id]?.status) || w.status}
                                    onChange={(e) => setWithdrawalEdits(prev => ({ ...prev, [w._id]: { ...prev[w._id], status: e.target.value } }))}
                                  >
                                    <option value="pending">pending</option>
                                    <option value="processing">processing</option>
                                    <option value="approved">approved</option>
                                    <option value="paid">paid</option>
                                    <option value="rejected">rejected</option>
                                  </select>
                                </div>
                                {((withdrawalEdits[w._id]?.status) || w.status) === 'processed' && (
                                  <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Transaction ID (optional)</label>
                                    <input
                                      type="text"
                                      className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-sm"
                                      placeholder="e.g., payout_123 or bank ref"
                                      value={withdrawalEdits[w._id]?.transactionId || ''}
                                      onChange={(e) => setWithdrawalEdits(prev => ({ ...prev, [w._id]: { ...prev[w._id], transactionId: e.target.value } }))}
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => handleSaveWithdrawal(w)}
                                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Delete this withdrawal request?')) return;
                                    try {
                                      await axiosInstance.delete(`/withdrawals/admin/${w._id}`);
                                      fetchWithdrawalRequests();
                                      fetchWithdrawalSummary();
                                    } catch (e) { console.error('Delete error', e); }
                                  }}
                                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Earnings Tab */}
              {walletTab === 'admin-earnings' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Admin Earnings (Commission)</h3>
                    <p className="text-gray-600">Platform commission from online-paid and COD-delivered orders</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                          <FaDollarSign className="text-xl" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Commission</p>
                          <p className="text-2xl font-bold text-gray-800">{formatINR(adminSummary.totalCommission || 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <FaDollarSign className="text-xl" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Online Commission</p>
                          <p className="text-2xl font-bold text-gray-800">{formatINR(adminSummary.onlineCommission || 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                          <FaDollarSign className="text-xl" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">COD Commission</p>
                          <p className="text-2xl font-bold text-gray-800">{formatINR(adminSummary.codCommission || 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                          <FaChartLine className="text-xl" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Orders Count</p>
                          <p className="text-2xl font-bold text-gray-800">{adminSummary.totalOrders || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commission Trend */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Commission Trend</h3>
                      <select
                        value={adminTrendPeriod}
                        onChange={(e) => setAdminTrendPeriod(e.target.value)}
                        className="border border-gray-300 text-sm rounded px-2 py-1"
                      >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <LineChart data={adminTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(l) => `Date: ${l}`} />
                          <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {adminTrend.length === 0 && (
                      <p className="text-center text-sm text-gray-500 mt-2">No commission data yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Vendor Earnings Tab */}
              {walletTab === 'vendor-earnings' && (
                <div className="space-y-6">
                  {/* Vendor Earnings Report Header */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Vendor Earnings Report</h3>
                    <p className="text-gray-600">Monitor vendor earnings and wallet balances</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          <FaUsers className="text-xl" />
                              </div>
                              <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                          <p className="text-2xl font-bold text-gray-800">{sellerEarnings.length}</p>
                              </div>
                            </div>
                            </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                          <FaDollarSign className="text-xl" />
                            </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                          <p className="text-2xl font-bold text-gray-800">{formatINR((sellerEarnings
                            .filter(v => (v.totalEarnings||0)>0 || (v.withdrawnAmount||0)>0 || (v.currentBalance||0)>0)
                            .reduce((s, v) => s + (v.totalEarnings || 0), 0)))}</p>
                          </div>
                          </div>
                        </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                          <FaChartLine className="text-xl" />
                              </div>
                              <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                          <p className="text-2xl font-bold text-gray-800">{formatINR((sellerEarnings
                            .filter(v => (v.totalEarnings||0)>0 || (v.withdrawnAmount||0)>0 || (v.currentBalance||0)>0)
                            .reduce((s, v) => s + (v.withdrawnAmount || 0), 0)))}</p>
                            </div>
                          </div>
                          </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                          <FaWallet className="text-xl" />
                          </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Balance</p>
                          <p className="text-2xl font-bold text-gray-800">{formatINR((sellerEarnings
                            .filter(v => (v.totalEarnings||0)>0 || (v.withdrawnAmount||0)>0 || (v.currentBalance||0)>0)
                            .reduce((s, v) => s + (v.currentBalance || 0), 0)))}</p>
                          </div>
                          </div>
                        </div>
                      </div>
                      
                  {/* Search and Refresh */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search vendors..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={vendorSearch}
                          onChange={(e) => setVendorSearch(e.target.value)}
                        />
                              </div>
                      <button onClick={fetchSellerEarnings} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Refresh
                      </button>
                        </div>
                      </div>
                      
                  {/* Vendor Earnings List */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800">Vendor Earnings ({sellerEarnings
                        .filter(v => (v.totalEarnings||0) > 0 || (v.withdrawnAmount||0) > 0 || (v.currentBalance||0) > 0)
                        .filter((s) => {
                          if (!vendorSearch.trim()) return true;
                          const q = vendorSearch.toLowerCase();
                          return (s.shopName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
                        }).length})</h4>
                    </div>
                    <div className="p-6">
                      {sellerEarnings
                        .filter(v => (v.totalEarnings||0) > 0 || (v.withdrawnAmount||0) > 0 || (v.currentBalance||0) > 0)
                        .filter((s) => {
                          if (!vendorSearch.trim()) return true;
                          const q = vendorSearch.toLowerCase();
                          return (s.shopName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
                        }).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaStore className="text-gray-400 text-2xl" />
                          </div>
                          <p className="text-gray-500 text-lg">No vendors found</p>
                          <p className="text-gray-400 text-sm">Vendor earnings will appear here when vendors start selling</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sellerEarnings
                            .filter(v => (v.totalEarnings||0)>0 || (v.withdrawnAmount||0)>0 || (v.currentBalance||0)>0)
                            .filter((s) => {
                              if (!vendorSearch.trim()) return true;
                              const q = vendorSearch.toLowerCase();
                              return (s.shopName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
                            })
                            .sort((a,b) => (b.currentBalance||0) + (b.withdrawnAmount||0) - ((a.currentBalance||0) + (a.withdrawnAmount||0)))
                            .map((seller) => (
                            <div key={seller._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                    <FaStore className="text-xl" />
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-gray-800 text-lg">{seller.shopName}</h5>
                                    <p className="text-gray-600">{seller.email}</p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(seller.isApproved ? 'approved' : 'pending')}`}>
                                  {seller.isApproved ? 'Active' : 'Pending'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="flex items-center">
                                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                                    <FaDollarSign className="text-lg" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Total Earnings</p>
                                    <p className="font-semibold text-gray-800">{formatINR(seller.totalEarnings)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                                    <FaChartLine className="text-lg" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Withdrawals</p>
                                    <p className="font-semibold text-gray-800">{formatINR(seller.withdrawnAmount)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                                    <FaWallet className="text-lg" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Current Balance</p>
                                    <p className="font-semibold text-gray-800">{formatINR(seller.currentBalance)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditModal({ open: false, product: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            {editError && <div className="text-red-500 mb-2">{editError}</div>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="text" className="form-input" placeholder="Product Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              <textarea className="form-input" placeholder="Description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required />
              <input type="number" className="form-input" placeholder="Price" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required min="0" />
              <input type="number" className="form-input" placeholder="Stock" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} required min="0" />
              <input type="text" className="form-input" placeholder="Brand" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} required />
              <input type="text" className="form-input" placeholder="SKU" value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} required />
              <div className="flex gap-2">
                <select
                  className="form-input"
                  value={editForm.category || ''}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value, subCategory: '' })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {editForm.category && (
                <select
                  className="form-input"
                  value={editForm.subCategory || ''}
                  onChange={e => setEditForm({ ...editForm, subCategory: e.target.value })}
                >
                  <option value="">Select Subcategory</option>
                    {categories.find(cat => cat._id === editForm.category)?.subcategories?.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
                )}
              </div>
              <input type="text" className="form-input" placeholder="Image URL" value={editForm.images && editForm.images[0] ? editForm.images[0].url : ''} onChange={e => setEditForm({ ...editForm, images: [{ url: e.target.value }] })} required />
              <button type="submit" className="btn-primary w-full">Update Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Product Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setRejectModal({ open: false, product: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Reject Product</h2>
            <form onSubmit={e => { e.preventDefault(); handleReject(rejectModal.product._id, rejectReason); }} className="space-y-4">
              <textarea className="form-input" placeholder="Rejection Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} required />
              <button type="submit" className="btn-primary w-full">Reject</button>
            </form>
          </div>
        </div>
      )}

      {/* Responsive fix for tab navigation */}
      <style>{`
        @media (max-width: 768px) {
          .admin-tabs {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .admin-tabs button {
            flex: 1 1 45%;
            min-width: 120px;
          }
        }
      `}</style>

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl mx-2 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={handleCloseProductModal}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProduct.images?.map((image, index) => (
                    <img 
                      key={index} 
                      src={typeof image === 'string' ? image : image?.url || '/product-images/default.webp'} 
                      alt={`${selectedProduct.name} ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg" 
                    />
                  ))}
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedProduct.name}</p>
                    <p><span className="font-medium">Brand:</span> {selectedProduct.brand}</p>
                    <p><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
                    <p><span className="font-medium">Price:</span> {formatINR(selectedProduct.price)}</p>
                    <p><span className="font-medium">Stock:</span> {selectedProduct.stock}</p>
                    <p><span className="font-medium">Category:</span> {selectedProduct.category?.name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Vendor Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Shop Name:</span> {selectedProduct.seller?.shopName || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedProduct.seller?.email || selectedProduct.seller?.userId?.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedProduct.seller?.phone || selectedProduct.seller?.userId?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Status</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Approval Status:</span> 
                      <span className={`inline-block w-fit ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.isApproved ? 'approved' : selectedProduct.rejectionReason ? 'rejected' : 'pending')}`}>
                        {selectedProduct.isApproved ? 'Approved' : selectedProduct.rejectionReason ? 'Rejected' : 'Pending'}
                      </span>
                    </p>
                    {selectedProduct.rejectionReason && (
                      <p><span className="font-medium">Rejection Reason:</span> {selectedProduct.rejectionReason}</p>
                    )}
                    <p><span className="font-medium">Created:</span> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Updated:</span> {new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{selectedProduct.description}</p>
            </div>

            {/* Product Features */}
            {selectedProduct.features && selectedProduct.features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedProduct.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">
                      {typeof feature === 'object' ? JSON.stringify(feature) : String(feature)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Specifications */}
            {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedProduct.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                      <span className="font-medium">{spec.key || spec.name || `Spec ${index + 1}`}:</span>
                      <span className="text-gray-700">
                        {spec.value || spec.description || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                onClick={handleCloseProductModal}
              >
                Close
              </button>
              {!selectedProduct.isApproved && !selectedProduct.rejectionReason && (
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedProduct._id);
                    handleCloseProductModal();
                  }}
                >
                  Approve Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => setShowVendorModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Shop Name</label>
                    <p className="text-gray-800">{selectedVendor.shopName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-800">{selectedVendor.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-800">{selectedVendor.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Business Type</label>
                    <p className="text-gray-800">{selectedVendor.businessInfo?.businessType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-800">{selectedVendor.description || 'N/A'}</p>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Business Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Tax ID</label>
                    <p className="text-gray-800">{selectedVendor.businessInfo?.taxId || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Business License</label>
                    <p className="text-gray-800">{selectedVendor.businessInfo?.businessLicense || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Website</label>
                    <p className="text-gray-800">{selectedVendor.website || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Commission Rate</label>
                    <p className="text-gray-800">{selectedVendor.commissionRate || 10}%</p>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Address Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Street</label>
                    <p className="text-gray-800">{selectedVendor.address?.street || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">City</label>
                    <p className="text-gray-800">{selectedVendor.address?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">State</label>
                    <p className="text-gray-800">{selectedVendor.address?.state || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ZIP Code</label>
                    <p className="text-gray-800">{selectedVendor.address?.zipCode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Country</label>
                    <p className="text-gray-800">
                      {selectedVendor.address?.country === 'US' || selectedVendor.address?.country === 'IN' ? 'India' : (selectedVendor.address?.country || 'India')}
                    </p>
                  </div>
                </div>

                {/* Status Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Status Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Approval Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedVendor.isApproved ? 'bg-green-100 text-green-800' : 
                      selectedVendor.rejectionReason ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedVendor.isApproved ? 'Approved' : 
                       selectedVendor.rejectionReason ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Suspension Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedVendor.isSuspended ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedVendor.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Join Date</label>
                    <p className="text-gray-800">{selectedVendor.createdAt ? new Date(selectedVendor.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Approval Date</label>
                    <p className="text-gray-800">{selectedVendor.approvalDate ? new Date(selectedVendor.approvalDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {selectedVendor.rejectionReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Rejection Reason</label>
                      <p className="text-red-600">{selectedVendor.rejectionReason}</p>
                    </div>
                  )}
                  {selectedVendor.suspensionReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Suspension Reason</label>
                      <p className="text-orange-600">{selectedVendor.suspensionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Uploaded Documents</h3>
                {selectedVendor.documents && selectedVendor.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVendor.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{doc.name}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            View Document
                          </a>
                          <a 
                            href={doc.url} 
                            download
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No documents uploaded</p>
                    <p className="text-sm">This vendor has not uploaded any documents yet.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  onClick={() => setShowVendorModal(false)}
                >
                  Close
                </button>
                {!selectedVendor.isApproved && !selectedVendor.rejectionReason && (
                  <>
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => {
                        handleVendorAction(selectedVendor._id, 'approve');
                        setShowVendorModal(false);
                      }}
                    >
                      Approve Vendor
                    </button>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      onClick={() => {
                        handleVendorAction(selectedVendor._id, 'reject');
                        setShowVendorModal(false);
                      }}
                    >
                      Reject Vendor
                    </button>
                  </>
                )}
                {selectedVendor.isApproved && !selectedVendor.isSuspended && (
                  <button 
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    onClick={() => {
                      handleVendorAction(selectedVendor._id, 'suspend');
                      setShowVendorModal(false);
                    }}
                  >
                    Suspend Vendor
                  </button>
                )}
                {selectedVendor.isApproved && selectedVendor.isSuspended && (
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => {
                      handleVendorAction(selectedVendor._id, 'activate');
                      setShowVendorModal(false);
                    }}
                  >
                    Activate Vendor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;