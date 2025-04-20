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
      setTimeIcon(<Sun className="h-5 w-5 text-amber-400" />);
    } else if (hour >= 12 && hour < 18) {
      newGreeting = "Bună ziua";
      setTimeIcon(<Sun className="h-5 w-5 text-yellow-400" />);
    } else if (hour >= 18 && hour < 22) {
      newGreeting = "Bună seara";
      setTimeIcon(<Moon className="h-5 w-5 text-blue-400" />);
    } else {
      newGreeting = "Noapte bună";
      setTimeIcon(<Moon className="h-5 w-5 text-indigo-400" />);
    }

    setGreeting(newGreeting);

    // Nu mai afișăm mesajul de bun venit
    setShowWelcome(false);
  }, []);

  // Folosim un loader mai simplu și mai eficient pentru a reduce timpul de încărcare
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 relative overflow-hidden">
        {/* Fundal animat pentru ecranul de încărcare - simplificat */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="text-center z-10">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              {/* Spinner simplificat */}
              <div
                className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"
                style={{ animationDuration: "1s" }}
              />
              <div
                className="absolute inset-0 rounded-full border-r-2 border-purple-500 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div className="text-xl font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Se încarcă...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Fundal animat */}
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
      </div>

      {/* Mesaj de bun venit simplificat pentru performanță mai bună */}
      {showWelcome && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-900/95 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4 text-4xl font-bold">
              <span className="mr-3">{timeIcon}</span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {greeting},
              </span>
            </div>
            <div className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {userProfile?.displayName ||
                user?.email?.split("@")[0] ||
                "Utilizator"}
            </div>
            <p className="text-slate-400 text-lg">
              Bine ați revenit în aplicația InventoryMaster
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative z-10">
        <motion.header
          className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Dashboard
            </motion.h1>
            <div className="flex items-center space-x-4">
              <WelcomeMessage />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate("/projects")}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Proiecte
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Total Materiale",
                  value: "1,234",
                  change: "+12% față de luna trecută",
                  icon: <Package className="h-8 w-8 text-blue-500" />,
                  color: "from-blue-500 to-blue-700",
                  bgColor: "bg-blue-500/10",
                },
                {
                  title: "Stoc Redus",
                  value: "28",
                  change: "-5% față de luna trecută",
                  icon: <AlertCircle className="h-8 w-8 text-amber-500" />,
                  color: "from-amber-500 to-amber-700",
                  bgColor: "bg-amber-500/10",
                },
                {
                  title: "Utilizatori Activi",
                  value: "42",
                  change: "+8% față de luna trecută",
                  icon: <Users className="h-8 w-8 text-green-500" />,
                  color: "from-green-500 to-green-700",
                  bgColor: "bg-green-500/10",
                },
                {
                  title: "Rapoarte Generate",
                  value: "156",
                  change: "+24% față de luna trecută",
                  icon: <BarChart2 className="h-8 w-8 text-purple-500" />,
                  color: "from-purple-500 to-purple-700",
                  bgColor: "bg-purple-500/10",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card
                    className={`bg-slate-800 border-slate-700 h-full overflow-hidden relative ${stat.bgColor}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-transparent to-white"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                      <CardTitle className="text-sm font-medium text-slate-200">
                        {stat.title}
                      </CardTitle>
                      <div
                        className={`p-2 rounded-full bg-gradient-to-br ${stat.color}`}
                      >
                        {stat.icon}
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-slate-400 mt-1">
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-slate-800 border-slate-700 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Activitate Recentă
                      </span>
                      <div className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                        Live
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center py-8 text-slate-400">
                        <p>Nu există activități recente.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <UserRoleInfo className="h-full" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="bg-slate-800 border-slate-700 overflow-hidden relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Acțiuni Rapide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 relative z-10">
                    {[
                      {
                        label: "Încărcare Inventar",
                        icon: <Upload className="h-4 w-4 mr-2" />,
                        path: "/upload-excel",
                        variant: "default",
                        color: "bg-blue-600 hover:bg-blue-700",
                      },
                      {
                        label: "Generare Raport",
                        icon: <BarChart2 className="h-4 w-4 mr-2" />,
                        path: "/reports",
                        variant: "outline",
                        color:
                          "border-purple-500/50 text-purple-400 hover:bg-purple-500/10",
                      },
                      {
                        label: "Adăugare Material Nou",
                        icon: <Package className="h-4 w-4 mr-2" />,
                        path: "/add-material",
                        variant: "outline",
                        color:
                          "border-green-500/50 text-green-400 hover:bg-green-500/10",
                      },
                      {
                        label: "Gestionare Utilizatori",
                        icon: <Users className="h-4 w-4 mr-2" />,
                        path: "/teams",
                        variant: "outline",
                        color:
                          "border-amber-500/50 text-amber-400 hover:bg-amber-500/10",
                      },
                    ].map((action, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 * i + 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className={`w-full justify-start ${action.color}`}
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
