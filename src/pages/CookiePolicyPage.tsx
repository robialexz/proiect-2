import React from "react";
import { motion } from "framer-motion";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ModernNavbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-muted-foreground">
              Information about how we use cookies on our website
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                1. What Are Cookies
              </h2>
              <p>
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                2. How We Use Cookies
              </h2>
              <p>
                InventoryMaster uses cookies for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Essential cookies:</strong> These are necessary for the website to function properly and cannot be turned off in our systems.
                </li>
                <li>
                  <strong>Performance cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </li>
                <li>
                  <strong>Functional cookies:</strong> These enable the website to provide enhanced functionality and personalization.
                </li>
                <li>
                  <strong>Targeting cookies:</strong> These may be set through our site by our advertising partners to build a profile of your interests.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                3. Types of Cookies We Use
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-slate-300 mt-4">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-3 text-left">Cookie Name</th>
                      <th className="border border-slate-300 p-3 text-left">Purpose</th>
                      <th className="border border-slate-300 p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-3">session_id</td>
                      <td className="border border-slate-300 p-3">Maintains your session state</td>
                      <td className="border border-slate-300 p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">auth_token</td>
                      <td className="border border-slate-300 p-3">Authentication</td>
                      <td className="border border-slate-300 p-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">preferences</td>
                      <td className="border border-slate-300 p-3">Stores user preferences</td>
                      <td className="border border-slate-300 p-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-3">_ga</td>
                      <td className="border border-slate-300 p-3">Google Analytics</td>
                      <td className="border border-slate-300 p-3">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                4. Managing Cookies
              </h2>
              <p>
                Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The following links provide information on how to modify your cookie settings in the most popular browsers:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" className="text-blue-600 hover:underline">Microsoft Edge</a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-blue-600 hover:underline">Mozilla Firefox</a>
                </li>
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline">Google Chrome</a>
                </li>
                <li>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline">Safari</a>
                </li>
              </ul>
              <p className="mt-4">
                Please note that restricting cookies may impact the functionality of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                5. Changes to Our Cookie Policy
              </h2>
              <p>
                We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                6. Contact Us
              </h2>
              <p>
                If you have any questions about our Cookie Policy, please contact us at:
              </p>
              <p className="mt-2">
                Email: privacy@inventorymaster.com<br />
                Phone: +1 (555) 123-4567
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
