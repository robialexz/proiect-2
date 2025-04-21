import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WelcomeMessage from "@/components/common/WelcomeMessage";
import UserRoleInfo from "@/components/common/UserRoleInfo";
import {
  Upload,
  BarChart2,
  Package,
  Users,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  FolderPlus,
  Activity,
} from "lucide-react";

const DashboardPage = () => {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [timeIcon, setTimeIcon] = useState<React.ReactNode>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Determinăm salutul în funcție de ora zilei
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "";

    if (hour >= 5 && hour < 12) {
      newGreeting = "Bună dimineața";
      setTimeIcon(<Sun className="h-6 w-6 text-amber-400" />);
    } else if (hour >= 12 && hour < 18) {
      newGreeting = "Bună ziua";
      setTimeIcon(<Sun className="h-6 w-6 text-yellow-400" />);
    } else if (hour >= 18 && hour < 22) {
      newGreeting = "Bună seara";
      setTimeIcon(<Moon className="h-6 w-6 text-blue-400" />);
    } else {
      newGreeting = "Noapte bună";
      setTimeIcon(<Moon className="h-6 w-6 text-indigo-400" />);
    }

    setGreeting(newGreeting);

    // Afișăm mesajul de bun venit pentru 2.5 secunde
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Loader optimizat cu animații mai fluide
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Fundal animat îmbunătățit */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="text-center z-10">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-6">
              {/* Spinner îmbunătățit */}
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-l-2 border-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-1 rounded-full border-r-2 border-b-2 border-purple-500"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border-t-2 border-indigo-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.div
              className="text-xl font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                Se încarcă...
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Fundal animat îmbunătățit cu mai multe elemente și efecte parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-indigo-500/3 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Mesaj de bun venit îmbunătățit cu animații mai fluide */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-900/98 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <motion.div
              className="text-center px-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            >
              <motion.div
                className="flex items-center justify-center mb-6 text-4xl font-bold"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.span
                  className="mr-4"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {timeIcon}
                </motion.span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {greeting},
                </span>
              </motion.div>
              <motion.div
                className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {userProfile?.displayName ||
                  user?.email?.split("@")[0] ||
                  "Utilizator"}
              </motion.div>
              <motion.p
                className="text-slate-300 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Bine ați revenit în aplicația InventoryMaster
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto relative z-10">
        {/* Header îmbunătățit cu gradient și umbre */}
        <motion.header
          className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-4 backdrop-blur-sm shadow-lg shadow-slate-900/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </motion.div>
            <div className="flex items-center space-x-4">
              <WelcomeMessage />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-md shadow-purple-900/20 border border-purple-500/20"
                  onClick={() => navigate("/projects")}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Proiecte
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Statistici îmbunătățite cu efecte hover și animații */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {[
                {
                  title: "Total Materiale",
                  value: "1,234",
                  change: "+12% față de luna trecută",
                  icon: <Package className="h-8 w-8 text-blue-400" />,
                  color: "from-blue-600 to-blue-800",
                  bgColor: "bg-blue-500/10",
                  borderColor: "border-blue-500/20",
                },
                {
                  title: "Stoc Redus",
                  value: "28",
                  change: "-5% față de luna trecută",
                  icon: <AlertCircle className="h-8 w-8 text-amber-400" />,
                  color: "from-amber-600 to-amber-800",
                  bgColor: "bg-amber-500/10",
                  borderColor: "border-amber-500/20",
                },
                {
                  title: "Utilizatori Activi",
                  value: "42",
                  change: "+8% față de luna trecută",
                  icon: <Users className="h-8 w-8 text-green-400" />,
                  color: "from-green-600 to-green-800",
                  bgColor: "bg-green-500/10",
                  borderColor: "border-green-500/20",
                },
                {
                  title: "Rapoarte Generate",
                  value: "156",
                  change: "+24% față de luna trecută",
                  icon: <BarChart2 className="h-8 w-8 text-purple-400" />,
                  color: "from-purple-600 to-purple-800",
                  bgColor: "bg-purple-500/10",
                  borderColor: "border-purple-500/20",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 },
                    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
                  }}
                  className="h-full"
                >
                  <Card
                    className={`bg-slate-800/80 backdrop-blur-sm border-slate-700 h-full overflow-hidden relative ${stat.bgColor} border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-transparent to-white"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                      <CardTitle className="text-sm font-medium text-slate-200">
                        {stat.title}
                      </CardTitle>
                      <motion.div
                        className={`p-2 rounded-full bg-gradient-to-br ${stat.color} shadow-md`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {stat.icon}
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.div
                        className="text-3xl font-bold"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + 0.1 * i }}
                      >
                        {stat.value}
                      </motion.div>
                      <p className="text-xs text-slate-400 mt-1">
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Secțiunea de activitate recentă îmbunătățită cu skeleton loader */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                  <CardHeader className="relative z-10 border-b border-slate-700/50">
                    <CardTitle className="flex items-center">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Activitate Recentă
                      </span>
                      <div className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                        Live
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-4">
                    <div className="space-y-4">
                      {/* Skeleton loader pentru activități */}
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20 border border-slate-700/50"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-slate-700/50 animate-pulse"></div>
                              <div className="ml-3">
                                <div className="h-3 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                                <div className="h-2 w-24 bg-slate-700/50 rounded mt-2 animate-pulse"></div>
                              </div>
                            </div>
                            <div className="h-2 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center py-4 text-slate-400">
                        <p>Nu există activități recente.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* UserRoleInfo îmbunătățit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <UserRoleInfo className="h-full shadow-lg hover:shadow-xl transition-all duration-300" />
              </motion.div>

              {/* Acțiuni rapide îmbunătățite cu butoane mai vibrante */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative h-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                  <CardHeader className="relative z-10 border-b border-slate-700/50">
                    <CardTitle className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Acțiuni Rapide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 relative z-10 pt-4">
                    {[
                      {
                        label: "Încărcare Inventar",
                        icon: <Upload className="h-4 w-4 mr-2" />,
                        path: "/upload-excel",
                        variant: "default",
                        color:
                          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-900/20 border border-blue-500/20",
                      },
                      {
                        label: "Generare Raport",
                        icon: <BarChart2 className="h-4 w-4 mr-2" />,
                        path: "/reports",
                        variant: "outline",
                        color:
                          "border-purple-500/30 text-purple-400 hover:bg-purple-500/20 shadow-md shadow-purple-900/10",
                      },
                      {
                        label: "Adăugare Material Nou",
                        icon: <Package className="h-4 w-4 mr-2" />,
                        path: "/add-material",
                        variant: "outline",
                        color:
                          "border-green-500/30 text-green-400 hover:bg-green-500/20 shadow-md shadow-green-900/10",
                      },
                      {
                        label: "Gestionare Utilizatori",
                        icon: <Users className="h-4 w-4 mr-2" />,
                        path: "/teams",
                        variant: "outline",
                        color:
                          "border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-md shadow-amber-900/10",
                      },
                    ].map((action, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 * i + 0.3 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className={`w-full justify-start ${action.color} rounded-md`}
                          size="sm"
                          variant={action.variant as "default" | "outline"}
                          onClick={() => navigate(action.path)}
                        >
                          {action.icon} {action.label}
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
