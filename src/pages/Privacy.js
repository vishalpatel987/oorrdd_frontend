import React from 'react';

const Privacy = () => {
  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: October 30, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide (like name, email, address) and data generated when
              you use our Service (like device and usage information).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Information</h2>
            <p>
              To operate MV Store, process orders, enhance security, improve our services, and
              communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Cookies</h2>
            <p>
              We use cookies and similar technologies to personalize content and analyze traffic.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Sharing of Information</h2>
            <p>
              We may share data with service providers for payment, fulfillment, and analytics. We do
              not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your data, subject to applicable
              laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Data Security</h2>
            <p>
              We implement reasonable safeguards to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p>
              For privacy concerns, contact <span className="font-medium">support@mvstore.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


