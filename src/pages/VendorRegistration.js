import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUpload, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import sellerAPI from '../api/sellerAPI';

const VendorRegistration = () => {
  const initialFormData = {
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessDescription: '',
    website: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN',
    
    // Business Details
    taxId: '',
    businessLicense: '',
    yearsInBusiness: '',
    
    // Categories
    categories: [],
    
    // Documents
    aadharCardFile: null,
    panCardFile: null,
    businessAddressProofFile: null,
    businessLicenseFile: null,
    taxCertificateFile: null,
    bankStatementFile: null
  };
  const [formData, setFormData] = useState(initialFormData);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessTypes = [
    'Individual/Sole Proprietor',
    'Partnership',
    'Corporation',
    'Limited Liability Company (LLC)',
    'Non-Profit Organization',
    'Other'
  ];

  const categories = [
    'Electronics',
    'Clothing & Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Health & Beauty',
    'Toys & Games',
    'Automotive',
    'Food & Beverages',
    'Jewelry & Watches',
    'Art & Collectibles',
    'Pet Supplies'
  ];

  const businessTypeMap = {
    'Individual/Sole Proprietor': 'individual',
    'Partnership': 'partnership',
    'Corporation': 'corporation',
    'Limited Liability Company (LLC)': 'llc',
    // Add more mappings if you update the backend enum
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is PDF
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
      
      if (!isPdf) {
        toast.error('Only PDF files are allowed. Please upload a PDF file.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map businessType to valid enum value
      const mappedBusinessType = businessTypeMap[formData.businessType] || 'individual';
      
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('businessType', mappedBusinessType);
      formDataToSend.append('businessDescription', formData.businessDescription);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('country', 'India'); // Always send India as country
      formDataToSend.append('taxId', formData.taxId);
      formDataToSend.append('businessLicense', formData.businessLicense);
      formDataToSend.append('categories', JSON.stringify(formData.categories));
      
      // Add file uploads
      if (formData.aadharCardFile) {
        formDataToSend.append('aadharCardFile', formData.aadharCardFile);
      }
      if (formData.panCardFile) {
        formDataToSend.append('panCardFile', formData.panCardFile);
      }
      if (formData.businessAddressProofFile) {
        formDataToSend.append('businessAddressProofFile', formData.businessAddressProofFile);
      }
      if (formData.businessLicenseFile) {
        formDataToSend.append('businessLicenseFile', formData.businessLicenseFile);
      }
      if (formData.taxCertificateFile) {
        formDataToSend.append('taxCertificateFile', formData.taxCertificateFile);
      }
      if (formData.bankStatementFile) {
        formDataToSend.append('bankStatementFile', formData.bankStatementFile);
      }
      
      // Debug: Log form data
      console.log('Form data being sent:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessName: formData.businessName,
        businessType: mappedBusinessType,
        businessDescription: formData.businessDescription,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'India',
        taxId: formData.taxId,
        businessLicense: formData.businessLicense,
        categories: formData.categories,
        files: {
          aadharCardFile: !!formData.aadharCardFile,
          panCardFile: !!formData.panCardFile,
          businessAddressProofFile: !!formData.businessAddressProofFile,
          businessLicenseFile: !!formData.businessLicenseFile,
          taxCertificateFile: !!formData.taxCertificateFile,
          bankStatementFile: !!formData.bankStatementFile
        }
      });
      
      await sellerAPI.registerVendor(formDataToSend);
      setIsSubmitting(false);
      toast.success('Vendor registration submitted! Your application will be reviewed.');
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || 'Failed to submit vendor registration. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2 sm:gap-4">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold shadow-md transition-all ${
            step <= currentStep 
                ? 'bg-blue-600 text-white scale-105' 
              : 'bg-gray-200 text-gray-600'
          }`}>
              {step < currentStep ? <FaCheck className="text-sm sm:text-base" /> : step}
          </div>
          {step < 4 && (
              <div className={`w-8 sm:w-16 h-1 sm:h-1.5 mx-1 sm:mx-2 rounded-full transition-all ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Business Type</option>
            {businessTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Description *</label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your business, products, and services..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Address & Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="IN">India</option>
          </select>
        </div>
        
        {/* Business Details */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Business Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST ID *</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your GST ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business License Number *</label>
              <input
                type="text"
                name="businessLicense"
                value={formData.businessLicense}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your Business License Number"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories *</label>
        <p className="text-sm text-gray-600 mb-3">Select the categories you plan to sell in:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map(category => (
            <label key={category} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="mr-3"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Documents</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card *</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e, 'aadharCardFile')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Upload your Aadhar Card (front and back in one file) - PDF only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card *</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e, 'panCardFile')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Upload your PAN Card - PDF only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Address Proof *</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e, 'businessAddressProofFile')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Upload proof of business address (utility bill, rent agreement, etc.) - PDF only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business License *</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e, 'businessLicenseFile')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Upload your business license or registration certificate - PDF only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate *</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e, 'taxCertificateFile')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Upload your GST certificate - PDF only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Statement (Last 3 months) *</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e, 'bankStatementFile')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Upload your business bank statements for verification - PDF only</p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Important Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• All documents will be reviewed by our team within 3-5 business days</li>
          <li>• You will receive an email notification once your application is approved</li>
          <li>• Make sure all documents are clear and up-to-date</li>
          <li>• Your business information will be verified before approval</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Become a Vendor</h1>
        <p className="text-gray-600 mt-2">Join our marketplace and start selling your products to customers worldwide</p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Registration Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            {/* Step Content */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaStore />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Become a Vendor?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaStore className="text-xl" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Reach More Customers</h4>
              <p className="text-sm text-gray-600">Access our large customer base and increase your sales</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUser className="text-xl" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Easy Management</h4>
              <p className="text-sm text-gray-600">Manage your products, orders, and analytics from one dashboard</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaEnvelope className="text-xl" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600">Get paid securely and on time with our payment system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration; 