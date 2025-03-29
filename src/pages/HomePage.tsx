import React from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import FeatureGrid from "@/components/home/FeatureGrid";
import CallToAction from "@/components/home/CallToAction";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navigation */}
      <Navbar isLoggedIn={!!user} userName={user?.email || ""} />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          title="Streamline Your Inventory Management"
          subtitle="A powerful dashboard for tracking, managing, and optimizing your project materials with real-time insights and seamless collaboration."
          primaryCta={user ? "Go to Dashboard" : "Get Started"}
          secondaryCta="Learn More"
          onPrimaryClick={() =>
            (window.location.href = user ? "/dashboard" : "/register")
          }
          onSecondaryClick={() => (window.location.href = "/about")}
        />

        {/* Feature Grid */}
        <FeatureGrid />

        {/* Additional Content Section */}
        <section className="py-16 px-4 bg-slate-800">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">
                  Excel Integration Made Simple
                </h2>
                <p className="text-slate-300 mb-6">
                  Upload your Excel files and instantly transform them into
                  actionable inventory data. Our system automatically processes
                  your spreadsheets and organizes materials for easy management.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Drag and drop file uploads",
                    "Automatic data extraction",
                    "Custom field mapping",
                    "Error detection and correction",
                    "Batch processing capabilities",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2 text-slate-200"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * i }}
                    >
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <Button asChild>
                  <Link to={user ? "/dashboard" : "/register"}>
                    {user ? "Go to Dashboard" : "Try File Upload"}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="aspect-video bg-slate-900 p-4 border border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-slate-400">Excel Upload</div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center justify-center h-[calc(100%-2rem)]">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-slate-300 text-center mb-2">
                      Drag and drop your Excel file here
                    </p>
                    <p className="text-slate-400 text-sm text-center mb-4">
                      or click to browse files
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="container mx-auto px-4 py-16">
          <CallToAction
            title="Ready to Streamline Your Inventory Management?"
            description="Get started today and transform how you track, manage, and optimize your project materials."
            primaryButtonText={user ? "Go to Dashboard" : "Get Started Now"}
            secondaryButtonText="Schedule a Demo"
            onPrimaryClick={() =>
              (window.location.href = user ? "/dashboard" : "/register")
            }
            onSecondaryClick={() => (window.location.href = "/contact")}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
