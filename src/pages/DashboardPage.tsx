import React from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom"; // Import useNavigate
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart2, Package, Users, AlertCircle } from "lucide-react";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">
                Welcome, {user.email}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/upload-excel")} // Add onClick handler
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Total Items",
                  value: "...", // Placeholder
                  change: "...", // Placeholder
                  icon: <Package className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Low Stock Items",
                  value: "...", // Placeholder
                  change: "...", // Placeholder
                  icon: <AlertCircle className="h-8 w-8 text-amber-500" />,
                },
                {
                  title: "Active Users",
                  value: "...", // Placeholder
                  change: "...", // Placeholder
                  icon: <Users className="h-8 w-8 text-green-500" />,
                },
                {
                  title: "Reports Generated",
                  value: "...", // Placeholder
                  change: "...", // Placeholder
                  icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                >
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">
                        {stat.title}
                      </CardTitle>
                      {stat.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-slate-400 mt-1">
                        {stat.change} (Example Data)
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-2 bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Example: Added new item", // Placeholder
                        user: "User Name", // Placeholder
                        time: "Recent", // Placeholder
                      },
                      {
                        action: "Example: Updated stock", // Placeholder
                        user: "Another User", // Placeholder
                        time: "Recent", // Placeholder
                      },
                      {
                        action: "Example: Generated report", // Placeholder
                        user: "Admin User", // Placeholder
                        time: "Recent", // Placeholder
                      },
                      {
                        action: "Example: Added user", // Placeholder
                        user: "System", // Placeholder
                        time: "Recent", // Placeholder
                      },
                    ].map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-slate-400">
                            By {activity.user}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => navigate("/upload-excel")} // Add onClick handler
                  >
                    <Upload className="h-4 w-4 mr-2" /> Upload Inventory
                  </Button>
                  <Button
                    className="w-full justify-start"
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/reports")} // Add onClick handler
                  >
                    <BarChart2 className="h-4 w-4 mr-2" /> Generate Report
                  </Button>
                  <Button
                    className="w-full justify-start"
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/add-material")} // Add onClick handler
                  >
                    <Package className="h-4 w-4 mr-2" /> Add New Item
                  </Button>
                  <Button
                    className="w-full justify-start"
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/teams")} // Add onClick handler
                  >
                    <Users className="h-4 w-4 mr-2" /> Manage Users
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

