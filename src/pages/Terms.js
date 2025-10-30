import React from 'react';

const Terms = () => {
  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: October 30, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MV Store, you agree to be bound by these Terms. If you do not
              agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and
              for restricting access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Purchases & Payments</h2>
            <p>
              Prices shown may include applicable charges as described on product pages. By placing an
              order, you authorize us and our payment partners to process the transaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Shipping & Returns</h2>
            <p>
              Shipping timelines are estimates. Returns and exchanges follow our Returns Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Prohibited Activities</h2>
            <p>
              You agree not to misuse the Service, including but not limited to attempting to gain
              unauthorized access or violating any applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Changes to Terms</h2>
            <p>
              We may update these Terms periodically. Continued use of the Service constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p>
              Questions? Contact us at <span className="font-medium">support@mvstore.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;


