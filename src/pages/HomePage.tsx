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
  AlertCircle,
  Sparkles,
  Workflow,
  FolderPlus,
  PackagePlus,
  CreditCard,
  Rocket,
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
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
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
      {/* Navigation */}
      <ModernNavbar
        isLoggedIn={!!user}
        userName={userProfile?.displayName || user?.email || ""}
        userAvatar=""
      />

      <main className="pt-20">
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
        {/* Hero Section - Only shown when not logged in */}
        {!user && (
          <section className="relative pt-32 pb-24 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-r from-indigo-600/30 to-blue-600/30 blur-3xl rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
              <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.1,
                    }}
                    animate={{
                      y: [0, Math.random() * 100 - 50],
                      x: [0, Math.random() * 100 - 50],
                      opacity: [Math.random() * 0.5 + 0.1, 0],
                    }}
                    transition={{
                      duration: Math.random() * 10 + 10,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>

              {/* Grid pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwYzkuOTQgMCAxOCA4LjA2IDE4IDE4aDEuNWE0LjUgNC41IDAgMDA0LjUtNC41IDQuNSA0LjUgMCAwMC00LjUtNC41SDM2djEuNWE0LjUgNC41IDAgMDA0LjUgNC41IDQuNSA0LjUgMCAwMDQuNS00LjVIMTh2LTEuNU0wIDE4YzAtOS45NCA4LjA2LTE4IDE4LTE4djE4SDBaIiBmaWxsPSIjMjAyNDJlIiBmaWxsLW9wYWNpdHk9XCIuMlwiLz48L2c+PC9zdmc+')] opacity-20"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                  className="lg:w-1/2 text-center lg:text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative inline-block mb-4">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0 px-3 py-1.5 text-sm font-medium">
                      <span className="relative z-10">
                        Revolutionizing Inventory Management
                      </span>
                    </Badge>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-50 blur-sm rounded-full"></div>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                    Streamline Your{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Project Materials
                      </span>
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"></div>
                    </span>{" "}
                    With Precision
                  </h1>

                  <p className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-xl mx-auto lg:mx-0">
                    A powerful platform designed for construction and
                    engineering teams to track, manage, and optimize inventory
                    with real-time insights and AI-powered analytics.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium px-8 w-full sm:w-auto group"
                        onClick={() =>
                          (window.location.href = user
                            ? "/dashboard"
                            : "/register")
                        }
                      >
                        <span className="relative z-10 flex items-center">
                          {user ? "Go to Dashboard" : "Încearcă acum"}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-indigo-500/50 text-white hover:bg-indigo-500/10 w-full sm:w-auto group relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center">
                          <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
                          Download App
                        </span>
                        <span className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-blue-500 text-xs px-2 py-0.5 rounded-bl-md font-medium">
                          Coming Soon...
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="mt-8 flex items-center justify-center lg:justify-start text-sm text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>No credit card required</span>
                    <span className="mx-2">•</span>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>14-day free trial</span>
                  </div>
                </motion.div>

                <motion.div
                  className="lg:w-1/2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative">
                    {/* Dashboard preview with animated glow */}
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-xl opacity-70 blur-lg"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />

                    {/* Dashboard preview */}
                    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden relative z-10">
                      <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-gradient-to-r from-slate-800 to-slate-800/70">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-sm font-medium text-blue-100/80 flex items-center">
                          <Settings className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                          InventoryPro Dashboard
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <motion.div
                            className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden group"
                            whileHover={{
                              y: -5,
                              boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/5 rounded-full blur-xl transform translate-x-5 -translate-y-5 group-hover:translate-x-3 transition-transform"></div>
                            <div className="text-sm text-blue-200/70 flex items-center">
                              <Package className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                              Total Items
                            </div>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                              1,248
                            </div>
                            <div className="text-xs text-green-400 mt-1 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +12% this month
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden group"
                            whileHover={{
                              y: -5,
                              boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 rounded-full blur-xl transform translate-x-5 -translate-y-5 group-hover:translate-x-3 transition-transform"></div>
                            <div className="text-sm text-blue-200/70 flex items-center">
                              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                              Projects
                            </div>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                              24
                            </div>
                            <div className="text-xs text-green-400 mt-1 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +3 new
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden group"
                            whileHover={{
                              y: -5,
                              boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/5 rounded-full blur-xl transform translate-x-5 -translate-y-5 group-hover:translate-x-3 transition-transform"></div>
                            <div className="text-sm text-blue-200/70 flex items-center">
                              <Users className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                              Suppliers
                            </div>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                              36
                            </div>
                            <div className="text-xs text-green-400 mt-1 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              All active
                            </div>
                          </motion.div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-5 mb-6 border border-slate-700/30 backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-5">
                            <div className="text-sm font-medium flex items-center">
                              <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-400" />
                              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                                Inventory Status
                              </span>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-slate-700/70 text-blue-200/70 flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-blue-400" />
                              Last updated: Today
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="text-sm flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                  Steel Pipes
                                </div>
                                <div className="text-sm font-medium text-green-400 flex items-center">
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  In Stock
                                </div>
                              </div>
                              <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: "70%" }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="text-sm flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                  Concrete Mix
                                </div>
                                <div className="text-sm font-medium text-yellow-400 flex items-center">
                                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                  Low Stock
                                </div>
                              </div>
                              <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: "20%" }}
                                  transition={{ duration: 1, delay: 0.7 }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="text-sm flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                  Electrical Wiring
                                </div>
                                <div className="text-sm font-medium text-blue-400 flex items-center">
                                  <Package className="w-3.5 h-3.5 mr-1" />
                                  Ordered
                                </div>
                              </div>
                              <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: "45%" }}
                                  transition={{ duration: 1, delay: 0.9 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-5 border border-slate-700/30 backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm font-medium flex items-center">
                              <Bell className="w-4 h-4 mr-1.5 text-purple-400" />
                              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                                Recent Activity
                              </span>
                            </div>
                            <motion.div
                              className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 cursor-pointer"
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: "rgba(99, 102, 241, 0.3)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View All
                            </motion.div>
                          </div>
                          <div className="space-y-4">
                            <motion.div
                              className="flex items-center p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/20 flex items-center justify-center mr-3 shadow-lg">
                                <Package className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-blue-100">
                                  New shipment received
                                </div>
                                <div className="text-xs text-blue-200/60 flex items-center mt-0.5">
                                  <Clock className="h-3 w-3 mr-1 text-blue-400/70" />
                                  2 hours ago
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              className="flex items-center p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center mr-3 shadow-lg">
                                <Users className="h-5 w-5 text-green-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-blue-100">
                                  Team meeting scheduled
                                </div>
                                <div className="text-xs text-blue-200/60 flex items-center mt-0.5">
                                  <Calendar className="h-3 w-3 mr-1 text-green-400/70" />
                                  Tomorrow, 10:00 AM
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              className="flex items-center p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center mr-3 shadow-lg">
                                <Bell className="h-5 w-5 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-blue-100">
                                  Inventory alert: Low stock
                                </div>
                                <div className="text-xs text-blue-200/60 flex items-center mt-0.5">
                                  <Clock className="h-3 w-3 mr-1 text-purple-400/70" />
                                  Just now
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <motion.div
                      className="absolute -bottom-10 -right-10 w-80 h-80 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-full blur-3xl opacity-20 z-0"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                    <motion.div
                      className="absolute -top-10 -left-10 w-80 h-80 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-3xl opacity-20 z-0"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.15, 0.2, 0.15],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />

                    {/* Floating particles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, Math.random() * 30 - 15],
                          x: [0, Math.random() * 30 - 15],
                          opacity: [0.4, 0.1, 0.4],
                        }}
                        transition={{
                          duration: Math.random() * 5 + 5,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    ))}
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
            <section className="py-20 bg-gradient-to-b from-slate-800/70 to-slate-900/90 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-1/3 h-1/3 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 blur-3xl rounded-full"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block mb-3">
                    <Badge className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border-0 px-3 py-1 text-sm">
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      Enterprise Ready
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                    Trusted by Industry Leaders
                  </h2>
                  <p className="text-blue-100/70 text-lg max-w-2xl mx-auto">
                    Join hundreds of companies managing their inventory with
                    precision and transforming their operations
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
                    {
                      name: "BuildCorp",
                      logo: "B",
                      color: "from-blue-500 to-indigo-500",
                    },
                    {
                      name: "TechStructures",
                      logo: "T",
                      color: "from-indigo-500 to-purple-500",
                    },
                    {
                      name: "GlobalEngineering",
                      logo: "G",
                      color: "from-cyan-500 to-blue-500",
                    },
                    {
                      name: "MetroProjects",
                      logo: "M",
                      color: "from-purple-500 to-pink-500",
                    },
                    {
                      name: "AlphaConstruction",
                      logo: "A",
                      color: "from-blue-500 to-cyan-500",
                    },
                  ].map((company, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      variants={staggerItem}
                    >
                      <motion.div
                        className={`relative w-20 h-20 md:w-24 md:h-24 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold mb-3 mx-auto border border-slate-700/50 group overflow-hidden`}
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${company.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                        ></div>
                        <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 text-3xl">
                          {company.logo}
                        </span>
                        <motion.div
                          className={`absolute -inset-0.5 bg-gradient-to-r ${company.color} rounded-full opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300`}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </motion.div>
                      <p className="text-sm font-medium text-blue-100/80">
                        {company.name}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 right-0 w-1/2 h-1/2 bg-gradient-to-l from-indigo-600/5 to-transparent blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-r from-blue-600/5 to-transparent blur-3xl rounded-full"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block mb-3">
                    <Badge className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border-0 px-3 py-1 text-sm">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Powerful Features
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                    Everything You Need to Manage Inventory
                  </h2>
                  <p className="text-blue-100/70 text-lg max-w-2xl mx-auto">
                    Our comprehensive platform provides all the tools necessary
                    for efficient inventory management across your projects
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <BarChart3 className="h-6 w-6 text-indigo-400" />,
                      title: "Real-time Analytics",
                      color: "from-indigo-500 to-blue-500",
                      description:
                        "Monitor inventory levels, track usage patterns, and generate comprehensive reports with our powerful analytics tools.",
                    },
                    {
                      icon: <Package className="h-6 w-6 text-blue-400" />,
                      title: "Material Tracking",
                      color: "from-blue-500 to-cyan-500",
                      description:
                        "Keep track of all your materials with detailed information on quantity, location, condition, and usage history.",
                    },
                    {
                      icon: <Users className="h-6 w-6 text-purple-400" />,
                      title: "Team Collaboration",
                      color: "from-purple-500 to-indigo-500",
                      description:
                        "Enable seamless collaboration between procurement, design, and on-site teams with role-based access controls.",
                    },
                    {
                      icon: <Zap className="h-6 w-6 text-amber-400" />,
                      title: "Automated Workflows",
                      color: "from-amber-500 to-orange-500",
                      description:
                        "Streamline procurement processes with automated purchase orders, approvals, and inventory replenishment.",
                    },
                    {
                      icon: <Shield className="h-6 w-6 text-emerald-400" />,
                      title: "Secure Data Storage",
                      color: "from-emerald-500 to-teal-500",
                      description:
                        "Keep your inventory data secure with enterprise-grade encryption and regular automated backups.",
                    },
                    {
                      icon: <CheckCircle className="h-6 w-6 text-cyan-400" />,
                      title: "Quality Control",
                      color: "from-cyan-500 to-blue-500",
                      description:
                        "Implement quality checks and maintain standards with our integrated quality control management system.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all duration-300 relative group overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"></div>
                      <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl z-0"></div>

                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${feature.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-5 relative z-10 shadow-lg`}
                      >
                        <div className="absolute inset-0.5 bg-slate-800 rounded-lg"></div>
                        <div className="relative z-10">{feature.icon}</div>
                      </div>

                      <h3 className="text-xl font-semibold mb-3 relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                        {feature.title}
                      </h3>

                      <p className="text-blue-100/70 relative z-10">
                        {feature.description}
                      </p>

                      <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r transition-all duration-500 ease-out"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-gradient-to-b from-slate-900/80 to-slate-800/50 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-indigo-600/5 to-transparent blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-600/5 to-transparent blur-3xl rounded-full"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block mb-3">
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-0 px-3 py-1 text-sm">
                      <Workflow className="w-3.5 h-3.5 mr-1.5" />
                      Simple Process
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                    How InventoryPro Works
                  </h2>
                  <p className="text-blue-100/70 text-lg max-w-2xl mx-auto">
                    Get started in minutes with our intuitive platform designed
                    for efficiency
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "01",
                      title: "Set Up Your Projects",
                      icon: <FolderPlus className="h-6 w-6 text-blue-400" />,
                      color: "from-blue-600 to-indigo-600",
                      description:
                        "Create projects, define categories, and set up your inventory structure to match your business needs.",
                    },
                    {
                      step: "02",
                      title: "Add Your Inventory",
                      icon: <PackagePlus className="h-6 w-6 text-cyan-400" />,
                      color: "from-cyan-600 to-blue-600",
                      description:
                        "Import existing inventory data or add items manually with our user-friendly interface.",
                    },
                    {
                      step: "03",
                      title: "Manage & Optimize",
                      icon: <BarChart3 className="h-6 w-6 text-indigo-400" />,
                      color: "from-indigo-600 to-purple-600",
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
                        <motion.div
                          className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r z-0"
                          style={{ width: "calc(100% - 3rem)" }}
                          initial={{ width: 0, opacity: 0 }}
                          whileInView={{
                            width: "calc(100% - 3rem)",
                            opacity: 1,
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-transparent blur-sm"></div>
                        </motion.div>
                      )}

                      <motion.div
                        className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 relative z-10 group overflow-hidden"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl z-0"></div>

                        <div className="flex items-center mb-5">
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mr-4 shadow-lg`}
                          >
                            {step.icon}
                          </div>
                          <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400/40 to-indigo-400/40">
                            {step.step}
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                          {step.title}
                        </h3>

                        <p className="text-blue-100/70">{step.description}</p>

                        <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r transition-all duration-500 ease-out"></div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-gradient-to-r from-emerald-600/5 to-transparent blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-l from-blue-600/5 to-transparent blur-3xl rounded-full"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block mb-3">
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-0 px-3 py-1 text-sm">
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      Flexible Pricing
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                    Plans That Scale With Your Business
                  </h2>
                  <p className="text-blue-100/70 text-lg max-w-2xl mx-auto">
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
                      color: "from-blue-600 to-indigo-600",
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
                      color: "from-indigo-600 to-purple-600",
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
                      color: "from-purple-600 to-pink-600",
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
                      className={`bg-slate-800/50 backdrop-blur-sm border ${
                        plan.popular
                          ? "border-indigo-500/50"
                          : "border-slate-700/50"
                      } rounded-xl overflow-hidden relative group`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {/* Background gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      ></div>

                      {/* Popular badge */}
                      {plan.popular && (
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium py-1.5 px-3 absolute top-0 right-0 rounded-bl-lg">
                          Most Popular
                        </div>
                      )}

                      <div className="p-6 border-b border-slate-700/50">
                        <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline mb-2">
                          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                            {plan.price}
                          </span>
                          {plan.price !== "Custom" && (
                            <span className="text-blue-200/70 ml-1">
                              /month
                            </span>
                          )}
                        </div>
                        <p className="text-blue-200/70 text-sm">
                          {plan.description}
                        </p>
                      </div>

                      <div className="p-6">
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <div className="h-5 w-5 text-emerald-400 mr-2 shrink-0 mt-0.5 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                              <span className="text-blue-100/80">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full relative overflow-hidden group ${
                            plan.popular
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                              : "bg-slate-700 hover:bg-slate-600"
                          }`}
                          onClick={() =>
                            (window.location.href =
                              plan.cta === "Contact Sales"
                                ? "/contact"
                                : "/register")
                          }
                        >
                          <span className="relative z-10">{plan.cta}</span>
                          {plan.popular && (
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                          )}
                        </Button>
                      </div>

                      {/* Bottom border animation */}
                      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r transition-all duration-500 ease-out"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-slate-900/80 z-0"></div>

              {/* Animated background elements */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwYzkuOTQgMCAxOCA4LjA2IDE4IDE4aDEuNWE0LjUgNC41IDAgMDA0LjUtNC41IDQuNSA0LjUgMCAwMC00LjUtNC41SDM2djEuNWE0LjUgNC41IDAgMDA0LjUgNC41IDQuNSA0LjUgMCAwMDQuNS00LjVIMTh2LTEuNU0wIDE4YzAtOS45NCA4LjA2LTE4IDE4LTE4djE4SDBaIiBmaWxsPSIjMjAyNDJlIiBmaWxsLW9wYWNpdHk9XCIuMlwiLz48L2c+PC9zdmc+')] opacity-10"></div>

                <motion.div
                  className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-indigo-600/20 via-blue-600/20 to-purple-600/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.4, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />

                <motion.div
                  className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-600/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.4, 0.3],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  className="max-w-3xl mx-auto text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block mb-4">
                    <Badge className="bg-gradient-to-r from-indigo-500/30 to-blue-500/30 text-white border-0 px-3 py-1.5 text-sm font-medium">
                      <Rocket className="w-3.5 h-3.5 mr-1.5" />
                      Get Started Today
                    </Badge>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                    Ready to Transform Your Inventory Management?
                  </h2>

                  <p className="text-xl text-blue-100/80 mb-10">
                    Join thousands of businesses that have streamlined their
                    operations with InventoryPro
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <Button
                        size="lg"
                        className="relative bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium px-8 w-full sm:w-auto group overflow-hidden"
                        onClick={() =>
                          (window.location.href = user
                            ? "/dashboard"
                            : "/register")
                        }
                      >
                        <span className="relative z-10 flex items-center">
                          {user ? "Go to Dashboard" : "Start Your Free Trial"}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-indigo-500/30 text-white hover:bg-indigo-500/10 w-full sm:w-auto group relative overflow-hidden"
                        onClick={() => (window.location.href = "/contact")}
                      >
                        <span className="relative z-10 flex items-center">
                          <Calendar className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                          Schedule a Demo
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Button>
                    </motion.div>
                  </div>

                  <p className="mt-8 text-sm text-blue-200/60 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 mr-1.5 text-blue-300/70" />
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
