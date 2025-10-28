import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaDollarSign, FaChartLine, FaEdit, FaTrash, FaEye, FaPlus, FaStore, FaCheck, FaTimes, FaImage, FaStar as FaStarFilled, FaRegStar as FaStarOutline, FaCompass, FaRegCompass, FaThumbsUp, FaRegThumbsUp, FaWallet } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR } from '../utils/formatCurrency';
import sellerAPI from '../api/sellerAPI';
import productAPI from '../api/productAPI';
import axiosInstance from '../api/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import { 
  fetchWithdrawalSummary, 
  fetchAllWithdrawalRequests, 
  fetchSellerEarningsSummary,
  updateWithdrawalStatus,
  clearWalletErrors 
} from '../redux/slices/walletSlice';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorActionLoading, setVendorActionLoading] = useState(null); // vendorId or null
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
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

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image: null });
  const [categoryError, setCategoryError] = useState('');

  const [selectedMainCat, setSelectedMainCat] = useState('');

  // Wallet state
  const [walletTab, setWalletTab] = useState('overview');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('all');
  const [withdrawalModal, setWithdrawalModal] = useState({ open: false, withdrawal: null, action: '' });
  const [withdrawalForm, setWithdrawalForm] = useState({ transactionId: '', notes: '' });
  
  // Vendor details modal state
  const [vendorDetailsModal, setVendorDetailsModal] = useState({ open: false, vendor: null });
  
  // Vendor analytics modal state
  const [vendorAnalyticsModal, setVendorAnalyticsModal] = useState({ open: false, vendor: null });
  
  // Export modal state
  const [exportModal, setExportModal] = useState({ open: false, vendor: null });

  // Redux wallet state
  const { 
    summary: walletSummary, 
    withdrawals, 
    sellerEarnings,
    summaryLoading,
    withdrawalsLoading,
    earningsLoading,
    summaryError,
    withdrawalsError,
    earningsError
  } = useSelector((state) => state.wallet);

  const [eventBanner, setEventBanner] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', description: '', endDate: '', product: '' });
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState('');

  const dispatch = useDispatch();

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
      default:
        return 'text-gray-600 bg-gray-100';
    }
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

  useEffect(() => {
    // Fetch users
    axiosInstance.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
    // Fetch orders
    axiosInstance.get('/admin/orders')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]));
    // Fetch stats/analytics
    axiosInstance.get('/admin/analytics')
      .then(res => setStats(res.data))
      .catch(() => setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalSales: 0,
        totalOrders: 0,
        totalVendors: 0,
        pendingVendors: 0
      }));
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        const res = await sellerAPI.getAllSellers();
        setVendors(res.data);
      } catch (err) {
        // Optionally show error
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    productAPI.getProducts()
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    setLoadingCategories(true);
    productAPI.getCategories()
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    productAPI.getEventBanner().then(res => {
      setEventBanner(res.data);
      if (res.data) {
        setEventForm({
          title: res.data.title,
          description: res.data.description,
          endDate: res.data.endDate ? res.data.endDate.slice(0, 16) : '',
          product: res.data.product?._id || ''
        });
      }
    });
  }, []);

  // Wallet effects
  useEffect(() => {
    if (activeTab === 'wallet') {
      if (walletTab === 'overview') {
        dispatch(fetchWithdrawalSummary());
      } else if (walletTab === 'withdrawals') {
        dispatch(fetchAllWithdrawalRequests({ 
          search: withdrawalSearch, 
          status: withdrawalStatusFilter 
        }));
      } else if (walletTab === 'sellerEarnings') {
        dispatch(fetchSellerEarningsSummary());
      }
    }
  }, [activeTab, walletTab, withdrawalSearch, withdrawalStatusFilter, dispatch]);

  // Wallet functions
  const handleWithdrawalStatusUpdate = async (withdrawalId, status) => {
    try {
      await dispatch(updateWithdrawalStatus({
        id: withdrawalId,
        status,
        transactionId: withdrawalForm.transactionId,
        notes: withdrawalForm.notes
      })).unwrap();
      
      setWithdrawalModal({ open: false, withdrawal: null, action: '' });
      setWithdrawalForm({ transactionId: '', notes: '' });
      
      // Refresh data
      dispatch(fetchAllWithdrawalRequests({ 
        search: withdrawalSearch, 
        status: withdrawalStatusFilter 
      }));
      dispatch(fetchWithdrawalSummary());
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
    }
  };

  const handleVendorAction = async (vendorId, action) => {
    setVendorActionLoading(vendorId + action);
    try {
      if (action === 'approve') {
        await sellerAPI.approveSeller(vendorId);
      } else if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason:') || 'Rejected by admin';
        await sellerAPI.rejectSeller(vendorId, reason);
      }
      // Refresh vendor list
      const res = await sellerAPI.getAllSellers();
      setVendors(res.data);
    } catch (err) {
      // Optionally show error
    } finally {
      setVendorActionLoading(null);
    }
  };

  // Approve all pending vendors
  const handleApproveAllPending = async () => {
    if (!window.confirm('Are you sure you want to approve all pending vendors?')) return;
    
    setVendorActionLoading('approveAll');
    try {
      const pendingVendors = vendors.filter(v => !v.isApproved && !v.rejectionReason);
      
      // Approve each pending vendor
      for (const vendor of pendingVendors) {
        await sellerAPI.approveSeller(vendor._id);
      }
      
      // Refresh vendor list
      const res = await sellerAPI.getAllSellers();
      setVendors(res.data);
      
      alert(`Successfully approved ${pendingVendors.length} vendors!`);
    } catch (err) {
      alert('Error approving vendors: ' + (err.response?.data?.message || err.message));
    } finally {
      setVendorActionLoading(null);
    }
  };

  // Add new vendor
  const handleAddVendor = () => {
    // For now, redirect to vendor registration page
    window.open('/vendor-registration', '_blank');
  };

  // Handle vendor details view
  const handleViewVendorDetails = (vendor) => {
    setVendorDetailsModal({ open: true, vendor });
  };

  // Close vendor details modal
  const handleCloseVendorDetailsModal = () => {
    setVendorDetailsModal({ open: false, vendor: null });
  };

  // Handle vendor analytics view
  const handleViewVendorAnalytics = (vendor) => {
    setVendorAnalyticsModal({ open: true, vendor });
  };

  // Close vendor analytics modal
  const handleCloseVendorAnalyticsModal = () => {
    setVendorAnalyticsModal({ open: false, vendor: null });
  };

  // Handle export report
  const handleExportReport = (vendor) => {
    setExportModal({ open: true, vendor });
  };

  // Close export modal
  const handleCloseExportModal = () => {
    setExportModal({ open: false, vendor: null });
  };

  // Export to CSV
  const exportToCSV = (vendor, format = 'detailed') => {
    const currentDate = new Date().toLocaleDateString();
    const fileName = `${vendor.name.replace(/\s+/g, '_')}_Analytics_${currentDate.replace(/\//g, '-')}.csv`;
    
    let csvContent = '';
    
    if (format === 'summary') {
      // Summary export
      csvContent = `Vendor Analytics Summary - ${vendor.name}
Generated on: ${new Date().toLocaleString()}

Metric,Value
Total Earnings,₹${vendor.totalEarnings || 0}
Total Withdrawals,₹${vendor.totalWithdrawn || 0}
Current Balance,₹${vendor.currentBalance || 0}
Commission Rate,10%
Total Orders,0
Account Status,Active
Last Login,Today
Products Listed,0
Join Date,Recently`;
    } else {
      // Detailed export
      csvContent = `Vendor Analytics Report - ${vendor.name}
Generated on: ${new Date().toLocaleString()}
Email: ${vendor.email}

=== FINANCIAL SUMMARY ===
Metric,Value (INR),Percentage
Total Earnings,₹${vendor.totalEarnings || 0},100%
Total Withdrawals,₹${vendor.totalWithdrawn || 0},${vendor.totalEarnings > 0 ? ((vendor.totalWithdrawn / vendor.totalEarnings) * 100).toFixed(2) : 0}%
Current Balance,₹${vendor.currentBalance || 0},${vendor.totalEarnings > 0 ? ((vendor.currentBalance / vendor.totalEarnings) * 100).toFixed(2) : 0}%
Commission Rate,10%,Fixed

=== PERFORMANCE METRICS ===
Metric,Value
Total Orders,0
Products Listed,0
Account Status,Active
Last Login,Today
Join Date,Recently

=== ACTIVITY SUMMARY ===
Period,Revenue,Orders,Withdrawals
Last 7 Days,₹0,0,₹0
Last 30 Days,₹0,0,₹0
Last 90 Days,₹0,0,₹0
Last 6 Months,₹0,0,₹0

=== NOTES ===
Generated by MV Store Admin Dashboard
For internal use only`;
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Close export modal
    handleCloseExportModal();
    
    // Show success message
    alert(`Report exported successfully as ${fileName}`);
  };

  // Export to PDF
  const exportToPDF = (vendor) => {
    try {
      const currentDate = new Date().toLocaleDateString();
      const fileName = `${vendor.name.replace(/\s+/g, '_')}_Analytics_Report_${currentDate.replace(/\//g, '-')}.pdf`;
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Vendor Analytics Report - ${vendor.name}`,
        subject: 'Vendor Performance Analysis',
        author: 'MV Store Admin Dashboard',
        creator: 'MV Store E-Commerce Platform'
      });
      
      // Colors
      const primaryColor = [59, 130, 246]; // Blue
      const secondaryColor = [16, 185, 129]; // Green
      const accentColor = [139, 92, 246]; // Purple
      const warningColor = [245, 158, 11]; // Orange
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('MV Store E-Commerce', 20, 30);
      
      doc.setFontSize(18);
      doc.setTextColor(50, 50, 50);
      doc.text('Vendor Analytics Report', 20, 45);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 55);
      doc.text(`Report for: ${vendor.name}`, 20, 65);
      doc.text(`Email: ${vendor.email}`, 20, 75);
      
      // Draw line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 85, 190, 85);
      
      // Key Metrics Section
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Key Performance Metrics', 20, 100);
      
      // Metrics table
      const metricsData = [
        ['Metric', 'Value', 'Status'],
        ['Total Revenue', `₹${vendor.totalEarnings || 0}`, 'Active'],
        ['Total Orders', '0', 'Active'],
        ['Commission Rate', '10%', 'Fixed'],
        ['Total Withdrawals', `₹${vendor.totalWithdrawn || 0}`, 'Active'],
        ['Current Balance', `₹${vendor.currentBalance || 0}`, 'Available']
      ];
      
      autoTable(doc, {
        startY: 110,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 }
        }
      });
      
      // Financial Summary Section
      let finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Financial Summary', 20, finalY);
      
      const financialData = [
        ['Financial Metric', 'Amount (INR)', 'Percentage'],
        ['Total Earnings', `₹${vendor.totalEarnings || 0}`, '100%'],
        ['Total Withdrawals', `₹${vendor.totalWithdrawn || 0}`, 
          vendor.totalEarnings > 0 ? ((vendor.totalWithdrawn / vendor.totalEarnings) * 100).toFixed(2) + '%' : '0%'],
        ['Current Balance', `₹${vendor.currentBalance || 0}`, 
          vendor.totalEarnings > 0 ? ((vendor.currentBalance / vendor.totalEarnings) * 100).toFixed(2) + '%' : '100%'],
        ['Commission Rate', '10%', 'Platform Fee']
      ];
      
      autoTable(doc, {
        startY: finalY + 10,
        head: [financialData[0]],
        body: financialData.slice(1),
        theme: 'striped',
        headStyles: {
          fillColor: secondaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 }
        }
      });
      
      // Activity Summary Section
      finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('Activity Summary', 20, finalY);
      
      const activityData = [
        ['Period', 'Revenue', 'Orders', 'Withdrawals'],
        ['Last 7 Days', '₹0', '0', '₹0'],
        ['Last 30 Days', '₹0', '0', '₹0'],
        ['Last 90 Days', '₹0', '0', '₹0'],
        ['Last 6 Months', '₹0', '0', '₹0']
      ];
      
      autoTable(doc, {
        startY: finalY + 10,
        head: [activityData[0]],
        body: activityData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: accentColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 }
        }
      });
      
      // Performance Insights Section
      finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
      doc.text('Performance Insights', 20, finalY);
      
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const insights = [
        `• Vendor Status: Active and approved`,
        `• Account Type: Standard vendor account`,
        `• Commission Structure: 10% platform fee`,
        `• Payment Method: Razorpay integration`,
        `• Last Activity: ${new Date().toLocaleDateString()}`,
        `• Platform Performance: Good standing`,
        `• Recommendation: Continue current operations`
      ];
      
      insights.forEach((insight, index) => {
        doc.text(insight, 25, finalY + 15 + (index * 8));
      });
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by MV Store Admin Dashboard', 20, pageHeight - 20);
      doc.text('For internal use only', 20, pageHeight - 15);
      doc.text(`Page 1 of 1`, 170, pageHeight - 15);
      
      // Save the PDF
      doc.save(fileName);
      
      // Close export modal
      handleCloseExportModal();
      
      // Show success message
      alert(`PDF report exported successfully as ${fileName}`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Error generating PDF report. Please try again.');
      handleCloseExportModal();
    }
  };

  // Approve product
  const handleApprove = async (id) => {
    setActionLoading(id + 'approve');
    try {
      const res = await productAPI.approveProduct(id);
      setProducts(products.map(p => p._id === id ? res.data : p));
    } finally {
      setActionLoading(null);
    }
  };
  // Reject product
  const handleReject = async (id, reason) => {
    setActionLoading(id + 'reject');
    try {
      const res = await productAPI.rejectProduct(id, reason);
      setProducts(products.map(p => p._id === id ? res.data : p));
      setRejectModal({ open: false, product: null });
      setRejectReason('');
    } finally {
      setActionLoading(null);
    }
  };
  // Delete product
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
  // Edit product
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

  // Edit user
  const handleEditUser = (user) => {
    setEditUserForm({ ...user });
    setEditUserModal({ open: true, user });
    setEditUserError('');
  };
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditUserError('');
    setUserActionLoading(editUserModal.user._id + 'edit');
    try {
      const res = await axiosInstance.put(`/admin/users/${editUserModal.user._id}`, editUserForm);
      setUsers(users.map(u => u._id === editUserModal.user._id ? res.data : u));
      setEditUserModal({ open: false, user: null });
    } catch (err) {
      setEditUserError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUserActionLoading(null);
    }
  };
  // Delete user
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };
  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleOpenCategoryModal = (category = null) => {
    setCategoryForm(category ? { ...category, image: null } : { name: '', slug: '', description: '', image: null });
    setCategoryModal({ open: true, category });
    setCategoryError('');
  };
  const handleCategoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setCategoryForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setCategoryForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    const formData = new FormData();
    formData.append('name', categoryForm.name);
    formData.append('slug', categoryForm.slug);
    formData.append('description', categoryForm.description);
    if (categoryForm.image) formData.append('image', categoryForm.image);
    try {
      if (categoryModal.category) {
        await productAPI.updateCategory(categoryModal.category._id, formData);
      } else {
        await productAPI.createCategory(formData);
      }
      // Refresh categories
      setLoadingCategories(true);
      const res = await productAPI.getCategories();
      setCategories(res.data);
      setCategoryModal({ open: false, category: null });
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Feature/unfeature product
  const handleFeatureProduct = async (id, isFeatured) => {
    setActionLoading(id + 'feature');
    try {
      let res;
      if (isFeatured) {
        res = await productAPI.unfeatureProduct(id);
      } else {
        res = await productAPI.featureProduct(id);
      }
      setProducts(products.map(p => p._id === id ? res.data.product : p));
      dispatch(fetchFeaturedProducts());
    } finally {
      setActionLoading(null);
    }
  };

  // Discover/un-discover product
  const handleDiscoverProduct = async (id, isDiscover) => {
    setActionLoading(id + 'discover');
    try {
      let res;
      if (isDiscover) {
        res = await productAPI.unsetDiscoverProduct(id);
      } else {
        res = await productAPI.setDiscoverProduct(id);
      }
      setProducts(products.map(p => p._id === id ? res.data : p));
    } finally {
      setActionLoading(null);
    }
  };
  // Recommend/un-recommend product
  const handleRecommendProduct = async (id, isRecommended) => {
    setActionLoading(id + 'recommend');
    try {
      let res;
      if (isRecommended) {
        res = await productAPI.unsetRecommendedProduct(id);
      } else {
        res = await productAPI.setRecommendedProduct(id);
      }
      setProducts(products.map(p => p._id === id ? res.data : p));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    setEventError('');
    try {
      await productAPI.createOrUpdateEventBanner(eventForm);
      await productAPI.setEventProduct(eventForm.product);
      const res = await productAPI.getEventBanner();
      setEventBanner(res.data);
    } catch (err) {
      setEventError(err.response?.data?.message || 'Failed to update event banner');
    } finally {
      setEventLoading(false);
    }
  };

  const handleDeleteEventBanner = async () => {
    if (!window.confirm('Are you sure you want to delete the event banner?')) return;
    setEventLoading(true);
    setEventError('');
    try {
      await productAPI.deleteEventBanner();
      setEventBanner(null);
      setEventForm({ title: '', description: '', endDate: '', product: '' });
    } catch (err) {
      setEventError(err.response?.data?.message || 'Failed to delete event banner');
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
              <p className="text-2xl font-bold text-gray-800">{formatINR(typeof stats.totalSales === 'number' ? stats.totalSales * 83 : 0)}</p>
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
              onClick={() => setActiveTab('eventBanner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'eventBanner'
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
              <FaWallet className="inline mr-2" />
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Vendors</h3>
                  <div className="space-y-3">
                    {(Array.isArray(vendors) ? vendors : []).slice(0, 3).map((vendor) => (
                      <div key={vendor._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{vendor.shopName}</p>
                          <p className="text-sm text-gray-600">{vendor.userId?.name || '-'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.isApproved ? 'approved' : vendor.rejectionReason ? 'rejected' : 'pending')}`}>
                            {vendor.isApproved ? 'Approved' : vendor.rejectionReason ? 'Rejected' : 'Pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {(Array.isArray(orders) ? orders : []).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Analytics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Analytics dashboard coming soon...</p>
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
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                    onClick={handleApproveAllPending}
                    disabled={vendorActionLoading === 'approveAll'}
                  >
                    <FaCheck />
                    {vendorActionLoading === 'approveAll' ? 'Approving...' : 'Approve All Pending'}
                  </button>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={handleAddVendor}
                  >
                    <FaPlus />
                    Add Vendor
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Vendors</h2>
                {loadingVendors ? (
                  <div>Loading vendors...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border">Business Name</th>
                          <th className="px-4 py-2 border">Owner</th>
                          <th className="px-4 py-2 border">Email</th>
                          <th className="px-4 py-2 border">Phone</th>
                          <th className="px-4 py-2 border">Business Type</th>
                          <th className="px-4 py-2 border">Status</th>
                          <th className="px-4 py-2 border">Applied</th>
                          <th className="px-4 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(vendors) ? vendors : []).map((vendor) => (
                          <tr key={vendor._id}>
                            <td className="px-4 py-2 border">{vendor.shopName}</td>
                            <td className="px-4 py-2 border">{vendor.userId?.name || '-'}</td>
                            <td className="px-4 py-2 border">{vendor.email}</td>
                            <td className="px-4 py-2 border">{vendor.phone}</td>
                            <td className="px-4 py-2 border">{vendor.businessInfo?.businessType || '-'}</td>
                            <td className={`px-4 py-2 border ${getStatusColor(vendor.isApproved ? 'approved' : vendor.rejectionReason ? 'rejected' : 'pending')}`}>{vendor.isApproved ? 'Approved' : vendor.rejectionReason ? 'Rejected' : 'Pending'}</td>
                            <td className="px-4 py-2 border">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 border">
                              {!vendor.isApproved && !vendor.rejectionReason && (
                                <>
                                  <button
                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 disabled:opacity-50"
                                    onClick={() => handleVendorAction(vendor._id, 'approve')}
                                    disabled={vendorActionLoading === vendor._id + 'approve'}
                                  >
                                    {vendorActionLoading === vendor._id + 'approve' ? 'Approving...' : 'Approve'}
                                  </button>
                                  <button
                                    className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                                    onClick={() => handleVendorAction(vendor._id, 'reject')}
                                    disabled={vendorActionLoading === vendor._id + 'reject'}
                                  >
                                    {vendorActionLoading === vendor._id + 'reject' ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {vendor.rejectionReason && (
                                <span title={vendor.rejectionReason} className="text-xs text-red-600">Rejected</span>
                              )}
                              {vendor.isApproved && (
                                <span className="text-xs text-green-600">Approved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
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
                    {(Array.isArray(users) ? users : []).map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>{user.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800" onClick={() => handleEditUser(user)} disabled={userActionLoading === user._id + 'edit'}><FaEdit /></button>
                            <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteUser(user._id)} disabled={userActionLoading === user._id + 'delete'}><FaTrash /></button>
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
                    <h2 className="text-xl font-bold mb-4">Edit User</h2>
                    {editUserError && <div className="text-red-500 mb-2">{editUserError}</div>}
                    <form onSubmit={handleEditUserSubmit} className="space-y-4">
                      <input type="text" className="form-input" placeholder="Name" value={editUserForm.name || ''} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} required />
                      <input type="email" className="form-input" placeholder="Email" value={editUserForm.email || ''} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} required />
                      <select className="form-input" value={editUserForm.role || ''} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })} required>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="seller">Seller</option>
                        <option value="customer">Customer</option>
                      </select>
                      <select className="form-input" value={editUserForm.status || ''} onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value })} required>
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button type="submit" className="btn-primary w-full">Update User</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">All Products</h3>
              {loadingProducts ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(products) ? products : []).map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 hover:shadow-md transition"
                    >
                      {/* First line: main info */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <img
                            src={product.images && product.images[0] ? product.images[0].url : '/product-images/default.webp'}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
                          </div>
                          <div className="font-bold text-gray-800 whitespace-nowrap">{formatINR(product.price)}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 justify-end md:justify-start">
                          <button
                            className={product.isFeatured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"}
                            title={product.isFeatured ? "Unfeature Product" : "Feature Product"}
                            onClick={() => handleFeatureProduct(product._id, product.isFeatured)}
                            disabled={actionLoading === product._id + 'feature'}
                          >
                            {product.isFeatured ? <FaStarFilled /> : <FaStarOutline />}
                          </button>
                          <button
                            className={product.isDiscover ? "text-blue-500 hover:text-blue-600" : "text-gray-400 hover:text-blue-500"}
                            title={product.isDiscover ? "Remove from Discover" : "Add to Discover"}
                            onClick={() => handleDiscoverProduct(product._id, product.isDiscover)}
                            disabled={actionLoading === product._id + 'discover'}
                          >
                            {product.isDiscover ? <FaCompass /> : <FaRegCompass />}
                          </button>
                          <button
                            className={product.isRecommended ? "text-green-500 hover:text-green-600" : "text-gray-400 hover:text-green-500"}
                            title={product.isRecommended ? "Remove from Recommended" : "Add to Recommended"}
                            onClick={() => handleRecommendProduct(product._id, product.isRecommended)}
                            disabled={actionLoading === product._id + 'recommend'}
                          >
                            {product.isRecommended ? <FaThumbsUp /> : <FaRegThumbsUp />}
                          </button>
                          {!product.isApproved && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-800"
                                disabled={actionLoading === product._id + 'approve'}
                                onClick={() => handleApprove(product._id)}
                              >
                                {actionLoading === product._id + 'approve' ? '...' : <FaCheck />}
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                disabled={actionLoading === product._id + 'reject'}
                                onClick={() => setRejectModal({ open: true, product })}
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleEdit(product)}
                            disabled={actionLoading === product._id + 'edit'}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(product._id)}
                            disabled={actionLoading === product._id + 'delete'}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      {/* Second line: secondary info */}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 mt-2 pl-0 md:pl-20">
                        <span title={product._id} className="cursor-pointer">ID: {product._id.slice(0, 4)}...{product._id.slice(-4)}</span>
                        <span title={product.seller?._id || product.seller} className="cursor-pointer">Seller: {product.seller?.shopName || product.seller || 'N/A'}</span>
                        <span>Stock: {product.stock}</span>
                        <span>Category: {product.category || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Order #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Seller</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(orders) ? orders : []).map((order) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">{order.orderNumber || order._id}</td>
                        <td className="py-3 px-4">{order.user?.name} <span className="text-xs text-gray-500">{order.user?.email}</span></td>
                        <td className="py-3 px-4">{order.seller?.shopName || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{order.orderItems?.map(item => `${item.product?.name || item.name} (x${item.quantity})`).join(', ')}</td>
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
              {/* Order Details Modal */}
              {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-2 relative overflow-y-auto max-h-[90vh]">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={handleCloseOrderModal}>&times;</button>
                    <h2 className="text-2xl font-bold mb-2">Order Details</h2>
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
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Category Management</h3>
                {!selectedMainCat && (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => handleOpenCategoryModal()}
                  >
                    <FaPlus /> Add Main Category
                  </button>
                )}
                {selectedMainCat && (
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => setSelectedMainCat('')}
                  >
                    &larr; Back to Main Categories
                  </button>
                )}
              </div>
              {loadingCategories ? (
                <div>Loading categories...</div>
              ) : !selectedMainCat ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {categories.filter(cat => !cat.parentCategory).map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedMainCat(cat._id)}
                      className="group w-full"
                    >
                      <div className="relative bg-gray-100 rounded-lg p-6 text-center hover:bg-primary-50 transition-colors overflow-hidden h-40 flex flex-col justify-end items-center">
                        <div className="relative z-10">
                          <h3 className="font-semibold mb-2 group-hover:text-primary-600 text-gray-800 text-lg">
                            {cat.name || 'Unnamed Category'}
                          </h3>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Subcategories of {categories.find(cat => cat._id === selectedMainCat)?.name}</h4>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                      onClick={() => handleOpenCategoryModal({ parentCategory: selectedMainCat })}
                    >
                      <FaPlus /> Add Subcategory
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.filter(cat => cat.parentCategory === selectedMainCat).map(subcat => (
                      <div key={subcat._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center min-w-[160px]">
                        <span className="font-semibold mb-2">{subcat.name}</span>
                        <span className="text-xs text-gray-500 mb-2">{subcat.productCount || 0} products</span>
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleOpenCategoryModal(subcat)}
                            title="Edit Subcategory"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={async () => {
                              if (window.confirm('Delete this subcategory?')) {
                                await productAPI.deleteCategory(subcat._id);
                                setLoadingCategories(true);
                                const res = await productAPI.getCategories();
                                setCategories(res.data);
                                setLoadingCategories(false);
                              }
                            }}
                            title="Delete Subcategory"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.filter(cat => cat.parentCategory === selectedMainCat).length === 0 && <span className="text-gray-400">No subcategories found.</span>}
                  </div>
                </>
              )}
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
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event Banner Tab */}
          {activeTab === 'eventBanner' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Event Banner Management</h3>
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
              {eventBanner && (
                <div className="mt-8 p-4 bg-gray-50 rounded shadow w-full overflow-x-auto">
                  <h4 className="font-bold mb-2">Current Event Banner</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <div><span className="font-semibold">Title:</span> {eventBanner.title}</div>
                      <div><span className="font-semibold">Description:</span> {eventBanner.description}</div>
                      <div><span className="font-semibold">End:</span> {new Date(eventBanner.endDate).toLocaleString()}</div>
                      <div><span className="font-semibold">Product:</span> {eventBanner.product?.name}</div>
                    </div>
                    <div className="flex justify-center md:justify-end">
                      {eventBanner.product?.images && eventBanner.product.images[0]?.url && (
                        <img src={eventBanner.product.images[0].url} alt={eventBanner.product.name} className="w-32 h-24 object-contain rounded shadow" />
                      )}
                    </div>
                  </div>
                  <button
                    className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-semibold shadow"
                    onClick={handleDeleteEventBanner}
                    disabled={eventLoading}
                  >
                    Delete Event Banner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Wallet Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <FaWallet className="text-4xl mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold">Wallet Management</h2>
                    <p className="text-blue-100">Manage platform finances, withdrawals, and vendor earnings.</p>
                  </div>
                </div>
              </div>

              {/* Wallet Sub Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setWalletTab('overview')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    walletTab === 'overview'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaWallet className="mx-auto mb-2" />
                  <div className="font-medium">Overview</div>
                  <div className="text-sm text-gray-500">Platform financial summary</div>
                </button>
                
                <button
                  onClick={() => setWalletTab('withdrawals')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    walletTab === 'withdrawals'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaDollarSign className="mx-auto mb-2" />
                  <div className="font-medium">Withdrawals</div>
                  <div className="text-sm text-gray-500">Manage withdrawal requests</div>
                </button>
                
                <button
                  onClick={() => setWalletTab('sellerEarnings')}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    walletTab === 'sellerEarnings'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaChartLine className="mx-auto mb-2" />
                  <div className="font-medium">Vendor Earnings</div>
                  <div className="text-sm text-gray-500">Track vendor performance</div>
                </button>
              </div>

              {/* Wallet Content */}
              {walletTab === 'overview' && (
                <div className="space-y-6">
                  {/* Enhanced Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Requests Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="p-3 rounded-full bg-blue-500 shadow-lg">
                              <FaUsers className="text-white text-xl" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Requests</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-blue-900 mb-1">
                            {summaryLoading ? '...' : walletSummary.totalRequests}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            All withdrawal requests
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Withdrawals Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="p-3 rounded-full bg-green-500 shadow-lg">
                              <FaDollarSign className="text-white text-xl" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Total Withdrawals</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-green-900 mb-1">
                            {formatINR(summaryLoading ? 0 : walletSummary.totalWithdrawalAmount)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Total amount withdrawn
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pending Card */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-xl shadow-lg border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="p-3 rounded-full bg-yellow-500 shadow-lg">
                              <FaTimes className="text-white text-xl" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-yellow-900 mb-1">
                            {summaryLoading ? '...' : walletSummary.pendingRequests}
                          </div>
                          <div className="text-sm text-yellow-600 font-medium">
                            Awaiting approval
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Processed Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="p-3 rounded-full bg-purple-500 shadow-lg">
                              <FaCheck className="text-white text-xl" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Processed</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-purple-900 mb-1">
                            {summaryLoading ? '...' : walletSummary.processedRequests}
                          </div>
                          <div className="text-sm text-purple-600 font-medium">
                            Successfully completed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Placeholder */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow border">
                      <h3 className="text-lg font-semibold mb-4">Withdrawal Trends</h3>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FaChartLine className="text-4xl mx-auto mb-2" />
                          <p>Chart will be implemented here</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow border">
                      <h3 className="text-lg font-semibold mb-4">Top Vendors by Earnings</h3>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FaChartLine className="text-4xl mx-auto mb-2" />
                          <p>Chart will be implemented here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {walletTab === 'withdrawals' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold mb-4">Withdrawal Management</h3>
                    <p className="text-gray-600 mb-6">Manage vendor withdrawal requests.</p>
                    
                    {/* Enhanced Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      {/* Total Requests Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-blue-500 shadow-lg">
                                <FaEye className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Requests</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-900 mb-1">
                              {summaryLoading ? '...' : walletSummary.totalRequests}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">
                              All withdrawal requests
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pending Requests Card */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-xl shadow-lg border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-yellow-500 shadow-lg">
                                <FaTimes className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-yellow-900 mb-1">
                              {summaryLoading ? '...' : walletSummary.pendingRequests}
                            </div>
                            <div className="text-sm text-yellow-600 font-medium">
                              Awaiting approval
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Approved Requests Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-green-500 shadow-lg">
                                <FaCheck className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Approved</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-green-900 mb-1">
                              {summaryLoading ? '...' : walletSummary.approvedRequests}
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              Ready for processing
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Processed Requests Card */}
                      <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-purple-500 shadow-lg">
                                <FaCheck className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Processed</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-900 mb-1">
                              {summaryLoading ? '...' : walletSummary.processedRequests}
                            </div>
                            <div className="text-sm text-purple-600 font-medium">
                              Successfully completed
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by vendor name, email, or withdrawal ID..."
                          value={withdrawalSearch}
                          onChange={(e) => setWithdrawalSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                          <FaEye className="absolute left-3 top-3 text-gray-400" />
                        </div>
                      </div>
                      
                      <select
                        value={withdrawalStatusFilter}
                        onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="processed">Processed</option>
                      </select>
                    </div>

                    {/* Withdrawal Requests Table */}
                    <div className="overflow-x-auto">
                      <h4 className="font-semibold mb-4">Withdrawal Requests ({withdrawals.length})</h4>
                      
                      {withdrawalsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading...</p>
                        </div>
                      ) : withdrawals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FaDollarSign className="text-4xl mx-auto mb-2" />
                          <p>No withdrawal requests found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {withdrawals.map((withdrawal) => (
                            <div key={withdrawal._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <span className="font-semibold">{withdrawal.seller?.name}</span>
                                    <span className="text-sm text-gray-500">{withdrawal.seller?.email}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                      withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {withdrawal.status}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">{formatINR(withdrawal.amount)}</span> • 
                                    {withdrawal.paymentMethod} • 
                                    {new Date(withdrawal.requestDate).toLocaleDateString()}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  {withdrawal.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => setWithdrawalModal({ open: true, withdrawal, action: 'approve' })}
                                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => setWithdrawalModal({ open: true, withdrawal, action: 'reject' })}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  
                                  {withdrawal.status === 'approved' && (
                                    <button
                                      onClick={() => setWithdrawalModal({ open: true, withdrawal, action: 'process' })}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                    >
                                      Process
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => setWithdrawalModal({ open: true, withdrawal, action: 'view' })}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                  >
                                    View
                                  </button>
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

              {walletTab === 'sellerEarnings' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold mb-4">Vendor Earnings Report</h3>
                    <p className="text-gray-600 mb-6">Monitor vendor earnings and wallet balances.</p>
                    
                    {/* Enhanced Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      {/* Total Vendors Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-blue-500 shadow-lg">
                                <FaUsers className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Vendors</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-900 mb-1">
                              {earningsLoading ? '...' : sellerEarnings.totalSellers}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">
                              Active vendors on platform
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Earnings Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-green-500 shadow-lg">
                                <FaDollarSign className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                              <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Total Earnings</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-green-900 mb-1">
                            {earningsLoading ? '...' : formatINR(sellerEarnings.totalEarnings)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Cumulative vendor earnings
                          </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Withdrawals Card */}
                      <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-orange-500 shadow-lg">
                                <FaChartLine className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">Total Withdrawals</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-orange-900 mb-1">
                              {earningsLoading ? '...' : formatINR(sellerEarnings.totalWithdrawals)}
                            </div>
                            <div className="text-sm text-orange-600 font-medium">
                              Amount withdrawn by vendors
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Total Balance Card */}
                      <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="p-3 rounded-full bg-purple-500 shadow-lg">
                                <FaWallet className="text-white text-xl" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Total Balance</p>
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-900 mb-1">
                              {earningsLoading ? '...' : formatINR(sellerEarnings.totalBalance)}
                            </div>
                            <div className="text-sm text-purple-600 font-medium">
                              Available in vendor wallets
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sellers List */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Vendor Earnings ({sellerEarnings.sellers.length})</h4>
                      
                      {earningsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading...</p>
                        </div>
                      ) : sellerEarnings.sellers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FaStore className="text-4xl mx-auto mb-2" />
                          <p>No vendors found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sellerEarnings.sellers.map((seller) => (
                            <div key={seller._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <span className="font-semibold">{seller.name}</span>
                                    <span className="text-sm text-gray-500">{seller.email}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                      Active
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <div className="font-medium text-gray-600">Total Earnings</div>
                                      <div className="font-semibold">{formatINR(seller.totalEarnings)}</div>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-600">Withdrawals</div>
                                      <div className="font-semibold">{formatINR(seller.totalWithdrawn)}</div>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-600">Current Balance</div>
                                      <div className="font-semibold">{formatINR(seller.currentBalance)}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <button 
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  onClick={() => handleViewVendorDetails(seller)}
                                >
                                  View Details
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
                  <option value="">Select Main Category</option>
                  {categories.filter(cat => !cat.parentCategory).map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  className="form-input"
                  value={editForm.subCategory || ''}
                  onChange={e => setEditForm({ ...editForm, subCategory: e.target.value })}
                  required
                  disabled={!editForm.category}
                >
                  <option value="">Select Subcategory</option>
                  {categories.filter(cat => cat.parentCategory === editForm.category).map(subcat => (
                    <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                  ))}
                </select>
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

      {/* Vendor Details Modal */}
      {vendorDetailsModal.open && vendorDetailsModal.vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" 
              onClick={handleCloseVendorDetailsModal}
            >
              &times;
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Vendor Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vendor Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-800">{vendorDetailsModal.vendor.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-800">{vendorDetailsModal.vendor.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                        Active
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Join Date:</span>
                      <span className="ml-2 text-gray-800">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Total Earnings:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatINR(vendorDetailsModal.vendor.totalEarnings || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Total Withdrawals:</span>
                      <span className="font-bold text-orange-600 text-lg">
                        {formatINR(vendorDetailsModal.vendor.totalWithdrawn || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-medium text-gray-600">Current Balance:</span>
                      <span className="font-bold text-blue-600 text-xl">
                        {formatINR(vendorDetailsModal.vendor.currentBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Statistics */}
              <div className="space-y-6">
                {/* Earnings Chart Placeholder */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Earnings Trend</h3>
                  <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                    <div className="text-center">
                      <FaChartLine className="text-4xl mx-auto mb-2" />
                      <p>Earnings chart will be implemented here</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Last withdrawal</span>
                      <span className="text-sm font-medium text-gray-800">
                        {vendorDetailsModal.vendor.totalWithdrawn > 0 ? 'Recent' : 'No withdrawals yet'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total orders</span>
                      <span className="text-sm font-medium text-gray-800">0</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Commission rate</span>
                      <span className="text-sm font-medium text-gray-800">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={handleCloseVendorDetailsModal}
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  handleCloseVendorDetailsModal();
                  handleViewVendorAnalytics(vendorDetailsModal.vendor);
                }}
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Analytics Modal */}
      {vendorAnalyticsModal.open && vendorAnalyticsModal.vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" 
              onClick={handleCloseVendorAnalyticsModal}
            >
              &times;
            </button>
            
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Vendor Analytics</h2>
              <p className="text-gray-600">Detailed performance analysis for {vendorAnalyticsModal.vendor.name}</p>
            </div>
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatINR(vendorAnalyticsModal.vendor.totalEarnings || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <FaDollarSign className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Total Orders</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">0</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Commission Rate</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">10%</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <FaWallet className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">Withdrawals</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {formatINR(vendorAnalyticsModal.vendor.totalWithdrawn || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-full">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Trend (Last 6 Months)</h3>
                <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                  <div className="text-center">
                    <FaChartLine className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Revenue chart will be implemented here</p>
                    <p className="text-xs text-gray-400 mt-1">Monthly earnings breakdown</p>
                  </div>
                </div>
              </div>

              {/* Orders Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Volume</h3>
                <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                  <div className="text-center">
                    <FaBox className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Order volume chart will be implemented here</p>
                    <p className="text-xs text-gray-400 mt-1">Daily/Weekly order trends</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Top Products */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Products</h3>
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500">
                    <FaBox className="text-3xl mx-auto mb-2" />
                    <p className="text-sm">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Best selling products will appear here</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Last login</span>
                    <span className="text-sm font-medium text-gray-800">Today</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Products listed</span>
                    <span className="text-sm font-medium text-gray-800">0</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Account status</span>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Joined platform</span>
                    <span className="text-sm font-medium text-gray-800">Recently</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">Total Earnings</span>
                      <span className="font-bold text-green-800">
                        {formatINR(vendorAnalyticsModal.vendor.totalEarnings || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-orange-700">Total Withdrawals</span>
                      <span className="font-bold text-orange-800">
                        {formatINR(vendorAnalyticsModal.vendor.totalWithdrawn || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Current Balance</span>
                      <span className="font-bold text-blue-800">
                        {formatINR(vendorAnalyticsModal.vendor.currentBalance || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Commission Rate</span>
                      <span className="font-bold text-gray-800">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={handleCloseVendorAnalyticsModal}
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => handleExportReport(vendorAnalyticsModal.vendor)}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive fix for tab navigation */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Transaction Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaChartLine className="text-4xl mr-4" />
                <div>
                  <h2 className="text-2xl font-bold">Transaction History</h2>
                  <p className="text-green-100">View and manage all platform transactions</p>
                </div>
              </div>
              <button
                onClick={() => setTransactionExportModal({ open: true })}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={transactionFilters.type}
                  onChange={(e) => setTransactionFilters({...transactionFilters, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="refund">Refund</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="commission">Commission</option>
                  <option value="order_payment">Order Payment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={transactionFilters.category}
                  onChange={(e) => setTransactionFilters({...transactionFilters, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="sales">Sales</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="commission">Commission</option>
                  <option value="refund">Refund</option>
                  <option value="order">Order</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={transactionFilters.status}
                  onChange={(e) => setTransactionFilters({...transactionFilters, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={transactionFilters.search}
                  onChange={(e) => setTransactionFilters({...transactionFilters, search: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={transactionFilters.startDate}
                  onChange={(e) => setTransactionFilters({...transactionFilters, startDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={transactionFilters.endDate}
                  onChange={(e) => setTransactionFilters({...transactionFilters, endDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => dispatch(fetchAllTransactions(transactionFilters))}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setTransactionFilters({
                    type: 'all',
                    category: 'all',
                    status: 'all',
                    user: 'all',
                    seller: 'all',
                    startDate: '',
                    endDate: '',
                    search: ''
                  });
                  dispatch(fetchAllTransactions());
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Transaction Summary */}
          {transactionSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <FaDollarSign className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-2xl font-bold text-green-600">{formatINR(transactionSummary.totalCredits || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-full mr-4">
                    <FaDollarSign className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Debits</p>
                    <p className="text-2xl font-bold text-red-600">{formatINR(transactionSummary.totalDebits || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FaChartLine className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">{transactionSummary.totalTransactions || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
            </div>
            
            {transactionLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading transactions...</p>
              </div>
            ) : transactionError ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{transactionError}</p>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.transactionId || transaction._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'credit' ? 'bg-green-100 text-green-800' :
                            transaction.type === 'debit' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatINR(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.user?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.seller?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => {
                              // View transaction details
                              console.log('View transaction:', transaction);
                            }}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.open && exportModal.vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-4 relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" 
              onClick={handleCloseExportModal}
            >
              &times;
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Export Report</h2>
              <p className="text-gray-600">Choose export format for {exportModal.vendor.name}'s analytics data</p>
            </div>
            
            {/* Export Options */}
            <div className="space-y-4 mb-8">
              {/* CSV Export Options */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">CSV Export</h3>
                    <p className="text-sm text-gray-600">Download data in spreadsheet format</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    onClick={() => exportToCSV(exportModal.vendor, 'detailed')}
                  >
                    <div className="text-left">
                      <div className="font-medium text-green-800">Detailed Report</div>
                      <div className="text-sm text-green-600">Complete analytics with all metrics</div>
                    </div>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => exportToCSV(exportModal.vendor, 'summary')}
                  >
                    <div className="text-left">
                      <div className="font-medium text-blue-800">Summary Report</div>
                      <div className="text-sm text-blue-600">Key metrics only</div>
                    </div>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* PDF Export Option */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">PDF Export</h3>
                    <p className="text-sm text-gray-600">Download formatted PDF report</p>
                  </div>
                </div>
                
                <button
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  onClick={() => exportToPDF(exportModal.vendor)}
                >
                  <div className="text-left">
                    <div className="font-medium text-red-800">PDF Report</div>
                    <div className="text-sm text-red-600">Professional formatted report with charts</div>
                  </div>
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Export Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Export Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Reports include vendor name and generation date</li>
                <li>• CSV files can be opened in Excel or Google Sheets</li>
                <li>• All financial data is included in exports</li>
                <li>• Files are saved to your default download folder</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={handleCloseExportModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Export Modal */}
      {transactionExportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-4 relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" 
              onClick={() => setTransactionExportModal({ open: false })}
            >
              &times;
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Export Transaction Data</h2>
              <p className="text-gray-600">Choose the format and filters for your transaction export</p>
            </div>

            {/* Export Options */}
            <div className="space-y-6">
              {/* CSV Export Options */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">CSV Export</h3>
                    <p className="text-sm text-gray-600">Download transaction data as CSV file</p>
                  </div>
                </div>
                
                <button
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  onClick={() => {
                    dispatch(exportTransactions({
                      format: 'csv',
                      ...transactionFilters
                    }));
                    setTransactionExportModal({ open: false });
                  }}
                  disabled={transactionExportLoading}
                >
                  <div className="text-left">
                    <div className="font-medium text-green-800">
                      {transactionExportLoading ? 'Exporting...' : 'CSV Export'}
                    </div>
                    <div className="text-sm text-green-600">
                      {transactionExportLoading ? 'Please wait...' : 'Download filtered transaction data'}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Export Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Export Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Export includes all applied filters</li>
                <li>• CSV files can be opened in Excel or Google Sheets</li>
                <li>• All transaction details are included</li>
                <li>• Files are saved to your default download folder</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setTransactionExportModal({ open: false })}
              >
                Cancel
              </button>
            </div>
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
    </div>
  );
};

export default AdminDashboard; 