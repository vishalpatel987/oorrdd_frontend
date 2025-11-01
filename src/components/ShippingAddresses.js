import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaCheck } from 'react-icons/fa';

const ShippingAddresses = ({ isOpen, onClose, onSelectAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    type: 'home'
  });
  const [loading, setLoading] = useState(false);

  const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli and Daman and Diu'
  ];

  // Load addresses from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedAddresses = localStorage.getItem('shippingAddresses');
      if (savedAddresses) {
        try {
          setAddresses(JSON.parse(savedAddresses));
        } catch (e) {
          console.error('Error loading addresses:', e);
        }
      }
    }
  }, [isOpen]);

  // Save addresses to localStorage
  const saveAddresses = (newAddresses) => {
    localStorage.setItem('shippingAddresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      type: 'home'
    });
    setShowAddForm(true);
    setEditingId(null);
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill all required fields');
      return;
    }

    let newAddresses;
    if (editingId) {
      // Update existing address
      newAddresses = addresses.map(addr =>
        addr.id === editingId ? { ...formData, id: editingId } : addr
      );
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      };
      newAddresses = [...addresses, newAddress];
    }

    saveAddresses(newAddresses);
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      type: 'home'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const newAddresses = addresses.filter(addr => addr.id !== id);
      saveAddresses(newAddresses);
    }
  };

  const handleSelect = (address) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
    onClose();
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      type: 'home'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-2 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Shipping Addresses</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter pincode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2 md:col-span-2 mt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaSave />
                    {editingId ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Addresses List */}
          {addresses.length === 0 && !showAddForm ? (
            <div className="text-center py-12">
              <FaMapMarkerAlt className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No shipping addresses</h3>
              <p className="text-gray-500 mb-6">Add your first shipping address to get started</p>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <FaPlus />
                Add Address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!showAddForm && (
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
                >
                  <FaPlus />
                  Add New Address
                </button>
              )}
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMapMarkerAlt className="text-blue-600" />
                        <h3 className="font-semibold text-gray-800">{address.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          address.type === 'home' ? 'bg-green-100 text-green-700' :
                          address.type === 'work' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {address.type === 'home' ? 'Home' : address.type === 'work' ? 'Work' : 'Other'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-gray-600 text-sm">India</p>
                      <p className="text-gray-600 text-sm mt-1">Phone: {address.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      {onSelectAddress && (
                        <button
                          onClick={() => handleSelect(address)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Use this address"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit address"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete address"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddresses;

