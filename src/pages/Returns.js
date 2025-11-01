import React from 'react';
import { FaUndo, FaBox, FaClock, FaCheckCircle, FaExclamationTriangle, FaCreditCard, FaTruck } from 'react-icons/fa';

const Returns = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <FaUndo className="text-blue-600 text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Returns & Exchanges</h1>
          <p className="text-gray-600 text-lg">Easy returns and exchanges within 10 days of delivery</p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FaClock className="text-blue-600 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">10-Day Returns</h3>
            <p className="text-gray-600 text-sm">Return window from delivery date</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Process</h3>
            <p className="text-gray-600 text-sm">Simple online return request</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FaCreditCard className="text-purple-600 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Refunds</h3>
            <p className="text-gray-600 text-sm">Refunds processed in 4-5 days</p>
          </div>
        </div>

        {/* Return Policy */}
        <div className="space-y-6">
          {/* Return Eligibility */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Policy</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Eligible for Returns</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>✓ Products in original condition with all tags and packaging</li>
                  <li>✓ Unused and unwashed items</li>
                  <li>✓ All accessories and original packaging included</li>
                  <li>✓ Return request within 10 days of delivery</li>
                </ul>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Not Eligible for Returns</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>✗ Personalized or custom-made products</li>
                  <li>✗ Products without original packaging or tags</li>
                  <li>✗ Used, damaged, or washed items</li>
                  <li>✗ Perishable items (food, beverages)</li>
                  <li>✗ Items past the 10-day return window</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Return */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Return a Product</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Log into Your Account</h3>
                  <p className="text-gray-600 text-sm">
                    Go to "My Orders" in your account dashboard and select the order you want to return.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Request Return/Replace</h3>
                  <p className="text-gray-600 text-sm">
                    Click on "Return/Replace" button, select the items you want to return, choose return or replacement, 
                    and provide the reason for return.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Wait for Approval</h3>
                  <p className="text-gray-600 text-sm">
                    Our team will review your return request within 24-48 hours. You'll receive an email notification 
                    once your request is approved.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Package & Ship</h3>
                  <p className="text-gray-600 text-sm">
                    Once approved, pack the product in its original packaging with all accessories. 
                    Our reverse pickup service will collect it from your address, or you can drop it at the nearest courier service.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Receive Refund/Replacement</h3>
                  <p className="text-gray-600 text-sm">
                    After we receive and verify the returned product, your refund will be processed within 4-5 business days, 
                    or replacement will be dispatched for exchange requests.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <FaCreditCard className="text-blue-600 text-2xl mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Refund Process</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Processing Time</h3>
                    <p className="text-gray-600 text-sm">
                      Refunds are processed within 4-5 business days after we receive and verify the returned product. 
                      You will receive an email confirmation once the refund is processed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Refund Methods</h3>
                    <p className="text-gray-600 text-sm mb-2">Refunds will be credited to your preferred method:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                      <li>Original payment method (Credit/Debit card, UPI, Net Banking)</li>
                      <li>Wallet balance</li>
                      <li>Bank account (NEFT/IMPS transfer)</li>
                      <li>UPI ID (for UPI payments)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Refund Amount</h3>
                    <p className="text-gray-600 text-sm">
                      Full product amount will be refunded. Shipping charges may apply based on return reason. 
                      For defective/wrong items, full refund including shipping is provided.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Process */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <FaBox className="text-blue-600 text-2xl mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Exchange Process</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">What Can Be Exchanged?</h3>
                    <p className="text-gray-600 text-sm">
                      You can exchange products for a different size, color, or variant within the same category. 
                      Exchanges are subject to product availability.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Exchange Timeline</h3>
                    <p className="text-gray-600 text-sm">
                      The exchange process is similar to returns. After we receive your returned product and verify it, 
                      the replacement product will be dispatched within 3-5 business days.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Price Difference</h3>
                    <p className="text-gray-600 text-sm">
                      If the replacement product has a different price, you will be charged or refunded the difference accordingly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Return Reasons */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Return Reasons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Defective Product</h3>
                <p className="text-gray-600 text-sm">
                  If you receive a damaged or defective item, we'll provide a full refund including shipping charges.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Wrong Item</h3>
                <p className="text-gray-600 text-sm">
                  Received wrong product? We'll arrange immediate replacement or full refund at no cost to you.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Size/Color Mismatch</h3>
                <p className="text-gray-600 text-sm">
                  Order wrong size or color? Exchange for the correct variant or return for full refund.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Not as Described</h3>
                <p className="text-gray-600 text-sm">
                  Product doesn't match description? Return within 10 days for full refund.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  How long does it take to process a refund?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Refunds are processed within 4-5 business days after we receive and verify the returned product. 
                  The amount will reflect in your account based on your payment method (5-7 business days for bank transfers).
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Can I exchange instead of returning?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Yes, you can request an exchange while placing a return request. Select "Replacement" instead of "Return" 
                  and choose the variant you want.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Who pays for return shipping?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Return shipping charges depend on the return reason. For defective, wrong, or not-as-described items, 
                  we cover return shipping. For other reasons (size issue, changed mind), charges may apply as per our policy.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  What if I miss the 10-day return window?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Standard returns are accepted within 10 days. However, for defective or wrong items, please contact 
                  customer support even after the return window - we'll assist you on a case-by-case basis.
                </p>
              </details>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help with Returns?</h3>
            <p className="text-gray-700 mb-4">
              Our customer support team is available 24/7 to assist you with return requests, refunds, or any questions.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;

