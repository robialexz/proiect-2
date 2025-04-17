import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Download,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  Users,
  Package,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  Layers,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import EmailWidget from "@/components/dashboard/EmailWidget";
import { FullPageSplineScene } from "@/components/ui/full-page-spline-scene";

const HomePage = () => {
  const { user, userProfile } = useAuth();
  const { t } = useTranslation();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Set greeting based on time of day
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Format time
      setCurrentTime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
      );

      // Set greeting based on time of day
      if (hours >= 5 && hours < 12) {
        setGreeting(t("Good morning"));
      } else if (hours >= 12 && hours < 18) {
        setGreeting(t("Good afternoon"));
      } else {
        setGreeting(t("Good evening"));
      }
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [t]);

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Dashboard stats
  const stats = [
    {
      title: t("Active Projects"),
      value: "24",
      change: "+3",
      icon: <Layers className="h-5 w-5 text-primary" />,
      color: "bg-primary/10",
    },
    {
      title: t("Inventory Items"),
      value: "1,248",
      change: "+12%",
      icon: <Package className="h-5 w-5 text-secondary" />,
      color: "bg-secondary/10",
    },
    {
      title: t("Team Members"),
      value: "36",
      change: "+2",
      icon: <Users className="h-5 w-5 text-accent" />,
      color: "bg-accent/10",
    },
    {
      title: t("Pending Deliveries"),
      value: "8",
      change: "-3",
      icon: <Clock className="h-5 w-5 text-warning" />,
      color: "bg-warning/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Spline Scene - Full Page */}
      {!user && <FullPageSplineScene />}

      {/* Navigation */}
      <ModernNavbar
        isLoggedIn={!!user}
        userName={userProfile?.displayName || user?.email || ""}
        userAvatar=""
      />

      <main className="pt-20 relative z-10">
        {" "}
        {/* Added padding-top to account for fixed navbar */}
        {/* User Dashboard Section - Only shown when logged in */}
        {!!user && (
          <section className="py-8 bg-slate-800/30">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">
                      {currentTime}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                      {greeting},{" "}
                      {userProfile?.displayName ||
                        user.email?.split("@")[0] ||
                        t("User")}
                    </h1>
                    <p className="text-slate-400">
                      {t("Welcome back to your inventory dashboard")}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString()}
                    </Button>
                    <Button className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t("View Reports")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700">
                        {stat.change}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                  </motion.div>
                ))}
              </div>

              {/* Welcome Card */}
              <WelcomeCard
                userName={userProfile?.displayName || user?.email || ""}
                className="bg-slate-800 border border-slate-700 rounded-xl mb-6"
              />

              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2">
                  {/* Quick Actions */}
                  <QuickActions className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                  {/* Projects Overview */}
                  <ProjectsOverview className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                  {/* Recent Activity */}
                  <RecentActivity className="bg-slate-800 border border-slate-700 rounded-xl p-4" />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1">
                  {/* Notifications Panel */}
                  <NotificationsPanel className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                  {/* Calendar Widget */}
                  <CalendarWidget className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" />

                  {/* Email Widget */}
                  <EmailWidget className="bg-slate-800 border border-slate-700 rounded-xl p-4" />
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Hero Section - Minimal version with just buttons */}
        {!user && (
          <section className="relative pt-32 pb-24 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex justify-end items-center h-[60vh]">
                <motion.div
                  className="w-full md:w-1/3 text-right"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white font-medium px-8 w-full sm:w-auto backdrop-blur-sm bg-opacity-80"
                        onClick={() =>
                          (window.location.href = user
                            ? "/dashboard"
                            : "/register")
                        }
                      >
                        {user ? "Go to Dashboard" : "Încearcă acum"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}
        {/* Only show these sections when not logged in */}
        {!user && (
          <>
            {/* Trusted By Section */}
            <section className="py-16 bg-slate-800/50">
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold mb-2">
                    Trusted by Industry Leaders
                  </h2>
                  <p className="text-slate-400">
                    Join hundreds of companies managing their inventory with
                    precision
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {[
                    { name: "BuildCorp", logo: "B" },
                    { name: "TechStructures", logo: "T" },
                    { name: "GlobalEngineering", logo: "G" },
                    { name: "MetroProjects", logo: "M" },
                    { name: "AlphaConstruction", logo: "A" },
                  ].map((company, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      variants={staggerItem}
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-700/50 rounded-full flex items-center justify-center text-2xl font-bold text-primary mb-2 mx-auto">
                        {company.logo}
                      </div>
                      <div className="text-sm text-slate-300">
                        {company.name}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-24">
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/20 px-3 py-1 text-sm">
                    Powerful Features
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Everything You Need to Manage Inventory
                  </h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    Our comprehensive platform provides all the tools necessary
                    for efficient inventory management across your projects
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <BarChart3 className="h-6 w-6 text-primary" />,
                      title: "Real-time Analytics",
                      description:
                        "Monitor inventory levels, track usage patterns, and generate comprehensive reports with our powerful analytics tools.",
                    },
                    {
                      icon: <Package className="h-6 w-6 text-primary" />,
                      title: "Material Tracking",
                      description:
                        "Keep track of all your materials with detailed information on quantity, location, condition, and usage history.",
                    },
                    {
                      icon: <Users className="h-6 w-6 text-primary" />,
                      title: "Team Collaboration",
                      description:
                        "Enable seamless collaboration between procurement, design, and on-site teams with role-based access controls.",
                    },
                    {
                      icon: <Zap className="h-6 w-6 text-primary" />,
                      title: "Automated Workflows",
                      description:
                        "Streamline procurement processes with automated purchase orders, approvals, and inventory replenishment.",
                    },
                    {
                      icon: <Shield className="h-6 w-6 text-primary" />,
                      title: "Secure Data Storage",
                      description:
                        "Keep your inventory data secure with enterprise-grade encryption and regular automated backups.",
                    },
                    {
                      icon: <CheckCircle className="h-6 w-6 text-primary" />,
                      title: "Quality Control",
                      description:
                        "Implement quality checks and maintain standards with our integrated quality control management system.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 30px -15px rgba(139, 92, 246, 0.3)",
                      }}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-slate-800/30">
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/20 px-3 py-1 text-sm">
                    Simple Process
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    How InventoryPro Works
                  </h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    Get started in minutes with our intuitive platform designed
                    for efficiency
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "01",
                      title: "Set Up Your Projects",
                      description:
                        "Create projects, define categories, and set up your inventory structure to match your business needs.",
                    },
                    {
                      step: "02",
                      title: "Add Your Inventory",
                      description:
                        "Import existing inventory data or add items manually with our user-friendly interface.",
                    },
                    {
                      step: "03",
                      title: "Manage & Optimize",
                      description:
                        "Track usage, generate reports, and make data-driven decisions to optimize your inventory management.",
                    },
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                      {/* Connecting line */}
                      {index < 2 && (
                        <div
                          className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0"
                          style={{ width: "calc(100% - 3rem)" }}
                        ></div>
                      )}

                      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-8 relative z-10">
                        <div className="text-4xl font-bold text-primary/30 mb-4">
                          {step.step}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                          {step.title}
                        </h3>
                        <p className="text-slate-400">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24">
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/20 px-3 py-1 text-sm">
                    Flexible Pricing
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Plans That Scale With Your Business
                  </h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">
                    Choose the perfect plan for your team's needs with
                    transparent pricing and no hidden fees
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {[
                    {
                      name: "Starter",
                      price: "$49",
                      description:
                        "Perfect for small teams just getting started",
                      features: [
                        "Up to 5 team members",
                        "1,000 inventory items",
                        "Basic analytics",
                        "Email support",
                        "1 project",
                      ],
                      cta: "Start Free Trial",
                      popular: false,
                    },
                    {
                      name: "Professional",
                      price: "$99",
                      description:
                        "Ideal for growing businesses with multiple projects",
                      features: [
                        "Up to 20 team members",
                        "10,000 inventory items",
                        "Advanced analytics",
                        "Priority support",
                        "10 projects",
                        "API access",
                        "Custom fields",
                      ],
                      cta: "Start Free Trial",
                      popular: true,
                    },
                    {
                      name: "Enterprise",
                      price: "Custom",
                      description: "Tailored solutions for large organizations",
                      features: [
                        "Unlimited team members",
                        "Unlimited inventory items",
                        "Custom analytics",
                        "24/7 dedicated support",
                        "Unlimited projects",
                        "Advanced security",
                        "Custom integrations",
                        "Onboarding assistance",
                      ],
                      cta: "Contact Sales",
                      popular: false,
                    },
                  ].map((plan, index) => (
                    <motion.div
                      key={index}
                      className={`bg-slate-800/50 border ${plan.popular ? "border-primary" : "border-slate-700"} rounded-xl overflow-hidden relative`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: plan.popular
                          ? "0 10px 30px -15px rgba(139, 92, 246, 0.4)"
                          : "0 10px 30px -15px rgba(30, 41, 59, 0.4)",
                      }}
                    >
                      {plan.popular && (
                        <div className="bg-primary text-white text-xs font-medium py-1 px-3 absolute top-0 right-0 rounded-bl-lg">
                          Most Popular
                        </div>
                      )}

                      <div className="p-6 border-b border-slate-700">
                        <h3 className="text-xl font-semibold mb-2">
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline mb-2">
                          <span className="text-3xl font-bold">
                            {plan.price}
                          </span>
                          {plan.price !== "Custom" && (
                            <span className="text-slate-400 ml-1">/month</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {plan.description}
                        </p>
                      </div>

                      <div className="p-6">
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                              <span className="text-slate-300">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-slate-700 hover:bg-slate-600"}`}
                          onClick={() =>
                            (window.location.href =
                              plan.cta === "Contact Sales"
                                ? "/contact"
                                : "/register")
                          }
                        >
                          {plan.cta}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary/20 to-blue-600/20">
              <div className="container mx-auto px-4">
                <motion.div
                  className="max-w-3xl mx-auto text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Transform Your Inventory Management?
                  </h2>
                  <p className="text-xl text-slate-300 mb-8">
                    Join thousands of businesses that have streamlined their
                    operations with InventoryPro
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white font-medium px-8 w-full sm:w-auto"
                        onClick={() =>
                          (window.location.href = user
                            ? "/dashboard"
                            : "/register")
                        }
                      >
                        {user ? "Go to Dashboard" : "Start Your Free Trial"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                        onClick={() => (window.location.href = "/contact")}
                      >
                        Schedule a Demo
                      </Button>
                    </motion.div>
                  </div>

                  <p className="mt-6 text-sm text-slate-400">
                    No credit card required for trial • Cancel anytime
                  </p>
                </motion.div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;

