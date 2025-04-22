import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";
import {
  ChevronRight,
  Star,
  Globe,
  Users,
  Building,
  Award,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import ParticleBackground from "@/components/effects/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import CountUp from "react-countup";

const AboutPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Spring animations for smoother motion
  const springConfig = { damping: 25, stiffness: 200 };
  const y1Spring = useSpring(y1, springConfig);
  const y2Spring = useSpring(y2, springConfig);
  const y3Spring = useSpring(y3, springConfig);

  // Mouse movement handler for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * 20, y: y * 20 });
  };

  // Company milestones
  const milestones = [
    {
      year: 2023,
      title: "Company Founded",
      description:
        "Started with a vision to revolutionize inventory management",
      icon: Building,
    },
    {
      year: 2023,
      title: "First Major Client",
      description:
        "Partnered with leading enterprises to enhance their operations",
      icon: Users,
    },
    {
      year: 2023,
      title: "Global Expansion",
      description: "Extended our reach to international markets",
      icon: Globe,
    },
    {
      year: 2024,
      title: "Industry Recognition",
      description: "Received multiple awards for innovation",
      icon: Award,
    },
  ];

  // Fun facts data
  const funFacts = [
    { number: 1000, suffix: "+", label: "Active Users" },
    { number: 50, suffix: "M", label: "Items Tracked" },
    { number: 99, suffix: "%", label: "Accuracy Rate" },
    { number: 24, suffix: "/7", label: "Support" },
  ];

  // Team members data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      image: "{process.env.URL_1}",
      bio: "10+ years in supply chain management",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      image: "{process.env.URL_2}",
      bio: "Former lead developer at Amazon",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product",
      image: "{process.env.URL_3}",
      bio: "UX specialist with MBA from Stanford",
      linkedin: "#",
      twitter: "#",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Animated background particles */}
      <ParticleBackground />

      {/* Dynamic background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [100, 50, 100],
                  y: [-100, -50, -100],
                  scale: [1, 1.1, 1],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [-50, -100, -50],
                  y: [50, 100, 50],
                  scale: [1, 1.2, 1],
                }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <ModernNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center"
            onMouseMove={handleMouseMove}
            style={{
              perspective: 1000,
            }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge
                className="px-4 py-1 text-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300"
                variant="outline"
              >
                Welcome to InventoryMaster
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                rotateX: -mousePosition.y,
                rotateY: mousePosition.x,
                transformStyle: "preserve-3d",
              }}
            >
              <span className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                Transforming
              </span>{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              We're on a mission to revolutionize how businesses manage their
              inventory through innovative technology and intuitive design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                onClick={() => {
                  const element = document.getElementById("mission");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
                <ChevronDown className="ml-2 h-4 w-4 animate-bounce" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Our Mission
              </motion.h2>
              <motion.p
                className="text-lg text-slate-300 mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                At InventoryMaster, we're dedicated to transforming how
                businesses manage their inventory. Our mission is to provide a
                powerful, intuitive platform that streamlines inventory
                management processes, reduces waste, and optimizes resource
                allocation.
              </motion.p>
              <motion.p
                className="text-lg text-slate-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Founded in 2023, we've quickly grown to become a trusted partner
                for businesses of all sizes, from small startups to large
                enterprises. Our platform is designed with flexibility and
                scalability in mind, ensuring that it can adapt to the unique
                needs of each organization.
              </motion.p>
            </div>

            {/* Animated statistics grid */}
            <div className="grid grid-cols-2 gap-4">
              {funFacts.map((fact, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={prefersReducedMotion ? {} : { y: -5 }}
                >
                  <motion.div
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  >
                    <CountUp
                      end={fact.number}
                      suffix={fact.suffix}
                      duration={2.5}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </motion.div>
                  <p className="text-slate-300">{fact.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Journey
          </motion.h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-blue-500 to-purple-500" />

            {/* Timeline items */}
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className={`flex items-center mb-12 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-1/2 px-6">
                  <motion.div
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6"
                    whileHover={prefersReducedMotion ? {} : { y: -5 }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <milestone.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-slate-300">{milestone.description}</p>
                  </motion.div>
                </div>
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping" />
                </div>
                <div className="w-1/2 px-6" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Meet Our Team
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -10 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300" />
                <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center">
                  <motion.div
                    className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-700/50 relative"
                    whileHover={
                      prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }
                    }
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-blue-400 mb-4">{member.role}</p>
                  <p className="text-slate-300 mb-6">{member.bio}</p>
                  <div className="flex justify-center space-x-4">
                    {/* Add social media links here */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700">
              {/* Animated shapes */}
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [50, 100, 50],
                        y: [-50, -100, -50],
                        scale: [1, 1.2, 1],
                      }
                }
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [-50, -100, -50],
                        y: [50, 100, 50],
                        scale: [1, 1.2, 1],
                      }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="relative z-10 py-16 px-8 text-center">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Join Our Journey
              </motion.h2>
              <motion.p
                className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                We're always looking for talented individuals to join our team.
                If you're passionate about creating innovative solutions and
                want to make a difference, we'd love to hear from you.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                  asChild
                >
                  <a href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
