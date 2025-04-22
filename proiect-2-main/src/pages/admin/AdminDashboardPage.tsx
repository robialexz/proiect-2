import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { UserRoles } from "@/types/supabase-tables";
import { supabase } from "@/lib/supabase";
import { usersService } from "@/services/admin/users-service";
import { logsService } from "@/services/admin/logs-service";
import {
  Users,
  Shield,
  FileText,
  AlertTriangle,
  Settings,
  UserPlus,
  UserMinus,
  LogIn,
  Activity,
} from "lucide-react";

// Tipul pentru statisticile de utilizatori
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  adminUsers: number;
  managerUsers: number;
  viewerUsers: number;
}

// Tipul pentru activitățile recente
interface RecentActivity {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
}

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userRole, hasPermission } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    adminUsers: 0,
    managerUsers: 0,
    viewerUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificăm dacă utilizatorul are rol de admin
  if (userRole !== UserRoles.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Funcție pentru încărcarea statisticilor de utilizatori
  const fetchUserStats = async () => {
    try {
      setLoading(true);

      // Obținem toți utilizatorii folosind serviciul de utilizatori
      const users = await usersService.getUsers();

      // Calculăm statisticile
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculăm statisticile
      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.last_sign_in_at).length,
        newUsers: users.filter(u => {
          const createdAt = new Date(u.created_at);
          return createdAt >= thirtyDaysAgo;
        }).length,
        adminUsers: users.filter(u => u.role === UserRoles.ADMIN).length,
        managerUsers: users.filter(u => u.role === UserRoles.MANAGER).length,
        viewerUsers: users.filter(u => u.role === UserRoles.VIEWER).length,
      };

      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru încărcarea activităților recente
  const fetchRecentActivities = async () => {
    try {
      // Obținem jurnalele de activitate folosind serviciul de jurnale
      const logs = await logsService.getLogs({
        // Limităm la ultimele 10 activități
        limit: 10,
        // Sortăm după data creării, descendent
        sortBy: 'created_at',
        sortDirection: 'desc'
      });

      // Transformăm jurnalele în formatul necesar
      const activities: RecentActivity[] = logs.map(log => ({
        id: log.id || '',
        user: log.user_email || log.user_id,
        action: log.action,
        resource: log.resource,
        timestamp: log.created_at || new Date().toISOString(),
      }));

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Dacă apare o eroare, folosim date de exemplu
      const mockActivities: RecentActivity[] = [
        {
          id: "1",
          user: "admin@example.com",
          action: "login",
          resource: "-",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          user: "manager@example.com",
          action: "update",
          resource: "user",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setRecentActivities(mockActivities);
    }
  };

  // Încărcăm datele la montarea componentei
  useEffect(() => {
    fetchUserStats();
    fetchRecentActivities();
  }, []);

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Funcție pentru obținerea iconului pentru acțiune
  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="h-4 w-4 text-blue-400" />;
      case "create":
        return <UserPlus className="h-4 w-4 text-green-400" />;
      case "update":
        return <Activity className="h-4 w-4 text-amber-400" />;
      case "delete":
        return <UserMinus className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t("admin.dashboard.title", "Admin Dashboard")}
          </h1>
        </div>

        {/* Statistici utilizatori */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
            <CardHeader className="relative z-10 border-b border-slate-700/50">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {t("admin.dashboard.userStats", "User Statistics")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <div className="text-sm text-slate-400">
                    {t("admin.dashboard.totalUsers", "Total Users")}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.totalUsers}
                  </div>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <div className="text-sm text-slate-400">
                    {t("admin.dashboard.activeUsers", "Active Users")}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.activeUsers}
                  </div>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <div className="text-sm text-slate-400">
                    {t("admin.dashboard.newUsers", "New Users (30d)")}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.newUsers}
                  </div>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-lg">
                  <div className="text-sm text-slate-400">
                    {t("admin.dashboard.adminUsers", "Admin Users")}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.adminUsers}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
            <CardHeader className="relative z-10 border-b border-slate-700/50">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-400" />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {t("admin.dashboard.recentActivity", "Recent Activity")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left pb-2 text-slate-400 font-medium">
                            {t("admin.dashboard.user", "User")}
                          </th>
                          <th className="text-left pb-2 text-slate-400 font-medium">
                            {t("admin.dashboard.action", "Action")}
                          </th>
                          <th className="text-left pb-2 text-slate-400 font-medium">
                            {t("admin.dashboard.resource", "Resource")}
                          </th>
                          <th className="text-left pb-2 text-slate-400 font-medium">
                            {t("admin.dashboard.timestamp", "Timestamp")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivities.map((activity) => (
                          <tr key={activity.id} className="border-b border-slate-700/20">
                            <td className="py-2 text-slate-300">
                              {activity.user}
                            </td>
                            <td className="py-2">
                              <div className="flex items-center">
                                {getActionIcon(activity.action)}
                                <span className="ml-2 text-slate-300">
                                  {activity.action}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 text-slate-300">
                              {activity.resource}
                            </td>
                            <td className="py-2 text-slate-400">
                              {formatDate(activity.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    {t("admin.dashboard.noActivities", "No recent activities")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acțiuni administrative */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/admin/users")}
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-transparent to-blue-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t("admin.dashboard.manageUsers", "Manage Users")}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {t("admin.dashboard.manageUsersDesc", "Add, edit, and manage user accounts")}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/admin/roles")}
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-transparent to-purple-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t("admin.dashboard.manageRoles", "Manage Roles")}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {t("admin.dashboard.manageRolesDesc", "Configure roles and permissions")}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/admin/logs")}
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-transparent to-green-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t("admin.dashboard.viewLogs", "View Logs")}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {t("admin.dashboard.viewLogsDesc", "Monitor user activity logs")}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/admin/settings")}
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08] from-transparent to-amber-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t("admin.dashboard.systemSettings", "System Settings")}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {t("admin.dashboard.systemSettingsDesc", "Configure application settings")}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Settings className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
