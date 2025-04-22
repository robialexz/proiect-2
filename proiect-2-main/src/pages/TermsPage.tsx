import React from "react";
import { motion } from "framer-motion";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <ModernNavbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-300">
              Please read these terms carefully before using our platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg max-w-none prose-headings:text-blue-300 prose-p:text-slate-300"
          >
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the InventoryMaster platform, you agree to
                be bound by these Terms of Service. If you do not agree to these
                terms, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                2. Description of Service
              </h2>
              <p>
                InventoryMaster provides an inventory management platform
                designed to help businesses track, manage, and optimize their
                inventory. The platform includes features such as real-time
                analytics, Excel integration, team collaboration tools, and
                more.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p>
                To use certain features of the platform, you must create an
                account. You are responsible for maintaining the confidentiality
                of your account information and for all activities that occur
                under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Privacy Policy</h2>
              <p>
                Our Privacy Policy describes how we handle the information you
                provide to us when you use our platform. By using
                InventoryMaster, you agree that we can use such information in
                accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                5. Intellectual Property
              </h2>
              <p>
                All content, features, and functionality of the InventoryMaster
                platform, including but not limited to text, graphics, logos,
                icons, and software, are the exclusive property of
                InventoryMaster and are protected by copyright, trademark, and
                other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                6. Limitation of Liability
              </h2>
              <p>
                In no event shall InventoryMaster be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses, resulting from your access
                to or use of or inability to access or use the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any
                time. We will provide notice of any material changes by posting
                the new Terms of Service on the platform. Your continued use of
                the platform after such modifications will constitute your
                acknowledgment of the modified Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                8. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at support@inventorymaster.com.
              </p>
            </section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center text-slate-400"
          >
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
