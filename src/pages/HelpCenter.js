import React, { useState } from 'react';
import { FaSearch, FaQuestionCircle, FaShoppingCart, FaBox, FaCreditCard, FaShippingFast, FaUndo, FaUser, FaLock } from 'react-icons/fa';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: <FaQuestionCircle /> },
    { id: 'orders', name: 'Orders', icon: <FaShoppingCart /> },
    { id: 'shipping', name: 'Shipping', icon: <FaShippingFast /> },
    { id: 'returns', name: 'Returns', icon: <FaUndo /> },
    { id: 'payments', name: 'Payments', icon: <FaCreditCard /> },
    { id: 'account', name: 'Account', icon: <FaUser /> },
    { id: 'products', name: 'Products', icon: <FaBox /> },
    { id: 'security', name: 'Security', icon: <FaLock /> }
  ];

  const faqs = [
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You can pay using various methods including credit/debit cards, UPI, or cash on delivery (COD).'
    },
    {
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can also track your order in your account dashboard under "My Orders" section.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can cancel orders that are still pending or processing. Go to your order history and click on "Cancel Order". Once an order is shipped, you cannot cancel it but can request a return after delivery.'
    },
    {
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI payments, net banking, and cash on delivery (COD) for eligible orders.'
    },
    {
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Shipping times vary by location and seller. Typically, orders are delivered within 3-7 business days. Express delivery options are available for select products.'
    },
    {
      category: 'shipping',
      question: 'What are your shipping charges?',
      answer: 'Shipping charges vary based on product weight and delivery location. Free shipping is available on orders above ₹500. You can check shipping charges during checkout.'
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Currently, we ship within India only. We are working on expanding our international shipping options in the near future.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 10-day return window from the date of delivery. Products must be in original condition with all tags and packaging intact. Some items like personalized products may not be eligible for returns.'
    },
    {
      category: 'returns',
      question: 'How do I return a product?',
      answer: 'To return a product, go to "My Orders" in your account, select the order you want to return, and click "Return/Replace". Fill in the return reason and submit. Our team will process your request.'
    },
    {
      category: 'returns',
      question: 'How long does it take to process a refund?',
      answer: 'Once we receive and verify your returned product, refunds are processed within 4-5 business days. The refund will be credited to your original payment method or wallet as per your preference.'
    },
    {
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payment transactions are encrypted and secure. We use industry-standard SSL encryption to protect your payment information. We never store your full card details.'
    },
    {
      category: 'payments',
      question: 'Why was my payment declined?',
      answer: 'Payment can be declined due to insufficient funds, incorrect card details, or bank security filters. Please verify your payment details and try again. If the issue persists, contact your bank.'
    },
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click on "Register" in the top menu, fill in your details including name, email, and password. You will receive a verification email to activate your account.'
    },
    {
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Go to "Profile" in the top menu, click "Edit Profile", update your information, and save the changes. You can update your name, email, phone number, and shipping addresses.'
    },
    {
      category: 'products',
      question: 'How do I know if a product is genuine?',
      answer: 'All our sellers are verified and we have strict quality control measures. Products come with authenticity guarantee and warranty where applicable. Look for verified seller badges on product pages.'
    },
    {
      category: 'products',
      question: 'What if I receive a damaged or wrong product?',
      answer: 'If you receive a damaged or incorrect product, please contact our support team immediately with photos and order details. We will arrange for a replacement or full refund at no additional cost.'
    },
    {
      category: 'security',
      question: 'How do I secure my account?',
      answer: 'Use a strong password with a mix of letters, numbers, and symbols. Never share your password. Enable two-factor authentication if available. Log out from shared devices.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Help Center</h1>
          <p className="text-gray-600 text-lg">How can we help you today?</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaShoppingCart className="text-blue-600 text-3xl mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Management</h3>
            <p className="text-gray-600 text-sm">Track orders, view history, and manage your purchases</p>
            <a href="#orders" className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block">
              Learn more →
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaUndo className="text-green-600 text-3xl mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Returns & Refunds</h3>
            <p className="text-gray-600 text-sm">Understand our return policy and process refunds</p>
            <a href="#returns" className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block">
              Learn more →
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaCreditCard className="text-purple-600 text-3xl mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Help</h3>
            <p className="text-gray-600 text-sm">Payment methods, security, and transaction issues</p>
            <a href="#payments" className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block">
              Learn more →
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No results found. Try searching with different keywords.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-700 mb-4">
            Our customer support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/contact"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@mvstore.com"
              className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

