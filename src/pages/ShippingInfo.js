import React from 'react';
import { FaShippingFast, FaTruck, FaMapMarkerAlt, FaClock, FaCheckCircle, FaBox, FaWeightHanging, FaShieldAlt } from 'react-icons/fa';

const ShippingInfo = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <FaShippingFast className="text-blue-600 text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Shipping Information</h1>
          <p className="text-gray-600 text-lg">Everything you need to know about shipping and delivery</p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FaTruck className="text-blue-600 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">3-7 business days delivery across India</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
            <p className="text-gray-600 text-sm">Free shipping on orders above ₹500</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FaShieldAlt className="text-purple-600 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Delivery</h3>
            <p className="text-gray-600 text-sm">Insured and secure packaging</p>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="space-y-6">
          {/* Delivery Time */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <FaClock className="text-blue-600 text-2xl mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Timeframes</h2>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Standard Delivery</h3>
                    <p className="text-gray-600 text-sm">
                      3-7 business days from the date of dispatch. Free shipping on orders above ₹500.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Express Delivery</h3>
                    <p className="text-gray-600 text-sm">
                      Available for select products and locations. Delivery within 1-3 business days with additional charges.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Same Day Delivery</h3>
                    <p className="text-gray-600 text-sm">
                      Available in select metro cities for eligible products. Order before 12 PM for same-day delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Charges */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <FaWeightHanging className="text-blue-600 text-2xl mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Charges</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Order Value</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Standard Delivery</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Express Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">Below ₹500</td>
                        <td className="py-3 px-4">₹50 - ₹100</td>
                        <td className="py-3 px-4">₹100 - ₹200</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">₹500 - ₹1000</td>
                        <td className="py-3 px-4">₹30 - ₹80</td>
                        <td className="py-3 px-4">₹80 - ₹150</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Above ₹1000</td>
                        <td className="py-3 px-4 font-semibold text-green-600">FREE</td>
                        <td className="py-3 px-4">₹50 - ₹100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  * Shipping charges may vary based on product weight and delivery location
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <FaBox className="text-blue-600 text-2xl mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Track Your Order</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">How to Track</h3>
                    <p className="text-gray-600 text-sm">
                      Once your order is dispatched, you'll receive a tracking number via email and SMS.
                      You can track your order in real-time through:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4 space-y-1">
                      <li>Your account dashboard under "My Orders"</li>
                      <li>Email notification with tracking link</li>
                      <li>SMS updates on your registered mobile number</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Locations */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-blue-600 text-2xl mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Locations</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Domestic Shipping</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      We currently ship to all major cities and towns across India including:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>✓ Mumbai</div>
                      <div>✓ Delhi</div>
                      <div>✓ Bangalore</div>
                      <div>✓ Hyderabad</div>
                      <div>✓ Chennai</div>
                      <div>✓ Kolkata</div>
                      <div>✓ Pune</div>
                      <div>✓ Ahmedabad</div>
                      <div>✓ Jaipur</div>
                      <div>✓ Surat</div>
                      <div>✓ Lucknow</div>
                      <div>✓ And 1000+ more cities</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-1">International Shipping</h3>
                    <p className="text-gray-600 text-sm">
                      Currently, we ship within India only. We are working on expanding our international shipping options in the near future.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Policies */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Policies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Processing Time</h3>
                <p className="text-gray-600 text-sm">
                  Orders are typically processed within 1-2 business days. Processing time may be longer during peak seasons or for custom products.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Packaging</h3>
                <p className="text-gray-600 text-sm">
                  All products are carefully packaged to ensure safe delivery. Fragile items receive extra protective packaging.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Failed Deliveries</h3>
                <p className="text-gray-600 text-sm">
                  If delivery cannot be completed due to incorrect address or recipient unavailable, the package will be returned to our warehouse. 
                  You can contact customer support to arrange for re-delivery.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">COD (Cash on Delivery)</h3>
                <p className="text-gray-600 text-sm">
                  Cash on Delivery is available for orders up to ₹10,000. Please keep exact change ready for delivery.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Questions</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  How long does shipping take?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Standard delivery takes 3-7 business days from dispatch. Express delivery is available for 1-3 business days.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  What are the shipping charges?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Shipping charges vary based on order value and delivery location. Free shipping is available on orders above ₹500.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  Can I change my delivery address?
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  You can update your delivery address before the order is dispatched. Once dispatched, contact customer support for assistance.
                </p>
              </details>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-gray-700 mb-4">
              Have questions about shipping? Our customer support team is here to help you 24/7.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;

