import React from 'react';

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-gray-600 mb-8">Learn more about MV Store</p>

        <div className="space-y-6 text-gray-700">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
            <p className="leading-relaxed">
              MV Store is dedicated to providing a seamless multi-vendor e-commerce platform that connects
              customers with verified sellers worldwide. We aim to create a trusted marketplace where
              quality products meet exceptional customer service.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Who We Are</h2>
            <p className="leading-relaxed mb-3">
              Founded with a vision to revolutionize online shopping, MV Store brings together thousands
              of verified sellers and millions of products under one roof. We pride ourselves on:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Verified seller network ensuring quality and reliability</li>
              <li>Wide range of products across multiple categories</li>
              <li>Secure payment processing and buyer protection</li>
              <li>Fast and reliable shipping options</li>
              <li>24/7 customer support</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Values</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Trust & Transparency</h3>
                <p className="text-sm">We believe in building trust through transparent policies and honest communication.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Customer First</h3>
                <p className="text-sm">Our customers are at the heart of everything we do. Your satisfaction is our priority.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Innovation</h3>
                <p className="text-sm">We continuously innovate to provide the best shopping experience possible.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Quality Assurance</h3>
                <p className="text-sm">We work only with verified sellers who meet our high quality standards.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Choose MV Store?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Verified Sellers</h3>
                <p className="text-sm">All our sellers are verified and meet strict quality criteria.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Secure Payments</h3>
                <p className="text-sm">Multiple secure payment options with buyer protection.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Fast Delivery</h3>
                <p className="text-sm">Quick and reliable shipping options available.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
                <p className="text-sm">Round-the-clock customer support for your convenience.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> support@mvstore.com</p>
              <p><strong>Phone:</strong> +91 9038045143</p>
              <p><strong>Address:</strong> 33, New Alipore, Kolkata 700053</p>
              <p className="mt-4">
                <a href="/contact" className="text-blue-600 hover:text-blue-800 underline">
                  Contact us for more information
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;

