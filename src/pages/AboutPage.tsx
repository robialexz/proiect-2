import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-muted-foreground">
              Learn more about our mission and the team behind InventoryMaster
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-6">
              At InventoryMaster, we're dedicated to transforming how businesses
              manage their inventory. Our mission is to provide a powerful,
              intuitive platform that streamlines inventory management
              processes, reduces waste, and optimizes resource allocation.
            </p>
            <p className="text-lg mb-6">
              Founded in 2023, we've quickly grown to become a trusted partner
              for businesses of all sizes, from small startups to large
              enterprises. Our platform is designed with flexibility and
              scalability in mind, ensuring that it can adapt to the unique
              needs of each organization.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Alex Johnson",
                  role: "CEO & Founder",
                  image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
                  bio: "10+ years in supply chain management",
                },
                {
                  name: "Sarah Chen",
                  role: "CTO",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
                  bio: "Former lead developer at Amazon",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Head of Product",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
                  bio: "UX specialist with MBA from Stanford",
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-card border rounded-lg p-6 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full bg-primary/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our team. If
              you're passionate about creating innovative solutions and want to
              make a difference, we'd love to hear from you.
            </p>
            <Button size="lg" asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </motion.section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
