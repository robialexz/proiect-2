import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";

const bgAnim = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: { duration: 12, repeat: Infinity, ease: "linear" },
  },
};

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, #3b82f6 0%, #a78bfa 50%, #f472b6 100%)",
          backgroundSize: "200% 200%",
        }}
        variants={bgAnim}
        animate="animate"
      />
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl z-0"
        animate={{
          x: [0, 40, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl z-0"
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <ModernNavbar />

      <div className="relative z-10 pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-12 text-center"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              tabIndex={0}
            >
              Contact Us
            </motion.h1>
            <motion.p
              className="text-xl text-slate-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              tabIndex={0}
            >
              Have questions or need assistance? We're here to help!
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
              className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-8"
              aria-label="Contact form"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">
                Get in Touch
              </h2>
              <form className="space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-400 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                      aria-label="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-400 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                      aria-label="Email Address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-200">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    className="rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-400 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    aria-label="Subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-200">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide details about your inquiry..."
                    className="min-h-[150px] rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-400 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    aria-label="Message"
                  />
                </div>

                <motion.div
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 8px 32px 0 rgba(59,130,246,0.25)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full md:w-auto"
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                    aria-label="Send Message"
                  >
                    Send Message
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
              className="flex flex-col"
              aria-label="Contact information"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">
                Contact Information
              </h2>
              <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl p-6 mb-8 space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "Email Us",
                    lines: [
                      {
                        label: "For general inquiries:",
                        value: "info@inventorymaster.com",
                      },
                      {
                        label: "For support:",
                        value: "support@inventorymaster.com",
                      },
                    ],
                  },
                  {
                    icon: Phone,
                    title: "Call Us",
                    lines: [
                      { label: "Main office:", value: "+1 (555) 123-4567" },
                      { label: "Support hotline:", value: "+1 (555) 987-6543" },
                    ],
                  },
                  {
                    icon: MapPin,
                    title: "Visit Us",
                    lines: [
                      { label: "Headquarters:", value: "123 Inventory Street" },
                      { label: "", value: "Suite 456" },
                      { label: "", value: "San Francisco, CA 94103" },
                    ],
                  },
                  {
                    icon: Clock,
                    title: "Business Hours",
                    lines: [
                      {
                        label: "Monday - Friday:",
                        value: "9:00 AM - 6:00 PM (PST)",
                      },
                      {
                        label: "Support Hours:",
                        value: "24/7 for Enterprise customers",
                      },
                    ],
                  },
                ].map((info, idx) => (
                  <motion.div
                    key={info.title}
                    className="flex items-start group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.5 }}
                  >
                    <motion.div
                      className="mr-4 mt-1 rounded-full p-2 bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200"
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      tabIndex={0}
                      aria-label={info.title}
                    >
                      <info.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-white">{info.title}</h3>
                      {info.lines.map((line, i) => (
                        <div key={i}>
                          {line.label && (
                            <p className="text-slate-400 mb-1">{line.label}</p>
                          )}
                          <p className="font-medium text-slate-200 mb-1">
                            {line.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="rounded-2xl overflow-hidden h-[250px] border border-slate-700 shadow-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                aria-label="Map location"
              >
                <p className="text-slate-300 text-lg font-medium">
                  Map would be displayed here
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
