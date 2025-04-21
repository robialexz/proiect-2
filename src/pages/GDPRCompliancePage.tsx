import React from "react";
import { motion } from "framer-motion";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";

const GDPRCompliancePage = () => {
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
            <h1 className="text-4xl font-bold mb-4">GDPR Compliance</h1>
            <p className="text-xl text-muted-foreground">
              How we comply with the General Data Protection Regulation
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
                1. Introduction to GDPR
              </h2>
              <p>
                The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area. It also addresses the export of personal data outside the EU and EEA areas.
              </p>
              <p className="mt-2">
                At InventoryMaster, we are committed to ensuring that all our data processing activities comply with the GDPR and other applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                2. Our Role Under GDPR
              </h2>
              <p>
                Under the GDPR, InventoryMaster acts as both a data controller and a data processor:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>As a data controller:</strong> We determine the purposes and means of processing personal data collected from our users and website visitors.
                </li>
                <li>
                  <strong>As a data processor:</strong> We process personal data on behalf of our customers who use our inventory management platform.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                3. GDPR Principles We Follow
              </h2>
              <p>
                We adhere to the principles set out in Article 5 of the GDPR, which requires that personal data shall be:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Processed lawfully, fairly and transparently</strong>
                </li>
                <li>
                  <strong>Collected for specified, explicit and legitimate purposes</strong>
                </li>
                <li>
                  <strong>Adequate, relevant and limited to what is necessary</strong>
                </li>
                <li>
                  <strong>Accurate and kept up to date</strong>
                </li>
                <li>
                  <strong>Stored for no longer than is necessary</strong>
                </li>
                <li>
                  <strong>Processed securely</strong>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                4. Legal Basis for Processing
              </h2>
              <p>
                Under the GDPR, we must have a valid legal basis for processing personal data. The legal bases we rely on include:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Consent:</strong> Where you have given clear consent for us to process your personal data for a specific purpose.
                </li>
                <li>
                  <strong>Contract:</strong> Where processing is necessary for the performance of a contract with you or to take steps at your request before entering into a contract.
                </li>
                <li>
                  <strong>Legal obligation:</strong> Where processing is necessary for compliance with a legal obligation.
                </li>
                <li>
                  <strong>Legitimate interests:</strong> Where processing is necessary for our legitimate interests or the legitimate interests of a third party, unless there is a good reason to protect your personal data which overrides those legitimate interests.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                5. Your Rights Under GDPR
              </h2>
              <p>
                The GDPR provides the following rights for individuals:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>The right to be informed</strong> about how we collect and use your personal data.
                </li>
                <li>
                  <strong>The right of access</strong> to your personal data and supplementary information.
                </li>
                <li>
                  <strong>The right to rectification</strong> of inaccurate personal data or to complete incomplete data.
                </li>
                <li>
                  <strong>The right to erasure</strong> (also known as 'the right to be forgotten').
                </li>
                <li>
                  <strong>The right to restrict processing</strong> of your personal data.
                </li>
                <li>
                  <strong>The right to data portability</strong>, allowing you to obtain and reuse your personal data for your own purposes across different services.
                </li>
                <li>
                  <strong>The right to object</strong> to processing based on legitimate interests, direct marketing, and processing for research and statistical purposes.
                </li>
                <li>
                  <strong>Rights related to automated decision making and profiling</strong>.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                6. Data Protection Measures
              </h2>
              <p>
                We have implemented appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Encryption of personal data</li>
                <li>Regular testing and evaluation of technical and organizational measures</li>
                <li>Regular data protection training for staff</li>
                <li>Pseudonymization and anonymization where appropriate</li>
                <li>Data minimization practices</li>
                <li>Regular backups and disaster recovery testing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                7. International Data Transfers
              </h2>
              <p>
                If we transfer your personal data outside the European Economic Area (EEA), we ensure that appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Standard contractual clauses approved by the European Commission</li>
                <li>Binding corporate rules for transfers within a corporate group</li>
                <li>Adherence to approved codes of conduct or certification mechanisms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                8. Data Breach Procedures
              </h2>
              <p>
                We have procedures in place to detect, report, and investigate personal data breaches. In case of a breach that is likely to result in a risk to the rights and freedoms of individuals, we will notify the relevant supervisory authority within 72 hours of becoming aware of it, and affected individuals without undue delay.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                9. Data Protection Officer
              </h2>
              <p>
                We have appointed a Data Protection Officer (DPO) responsible for overseeing questions in relation to this GDPR compliance statement and our privacy practices. If you have any questions about this statement, including any requests to exercise your legal rights, please contact our DPO using the details below:
              </p>
              <p className="mt-2">
                Email: dpo@inventorymaster.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Inventory Street, Business District, 10001
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                10. Updates to This Statement
              </h2>
              <p>
                We may update this GDPR compliance statement from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
              <p className="mt-2">
                <strong>Last Updated:</strong> June 1, 2023
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GDPRCompliancePage;
