import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useMemoizedCallback, useMemoizedValue } from "@/lib/performance";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  LayoutDashboard,
  Package,
  Users,
  FileSpreadsheet,
  Briefcase,
  Building,
  Shield,
  DollarSign,
  BarChart,
  FileText,
  Calendar,
  FolderArchive,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bug,
  ChevronDown,
  BookOpen,
  LogOut,
  HelpCircle,
  CheckCircle2,
  Bell,
  Box,
  TestTube,
  Bot,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotification } from "@/components/ui/notification";
import { fadeInLeft, fadeInRight } from "@/lib/animation-variants";

// Importăm hook-uri personalizate
import { useAuth, useUI } from "@/store";

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  badgeColor?: string;
}

interface NavItemWithItems extends Omit<NavItem, "href"> {
  items: NavItem[];
  expanded?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  icon?: React.ReactNode;
  expanded?: boolean;
}

const Sidebar = () => {
  const { t } = useTranslation();
  const { userProfile, logout, role } = useAuth();
  const {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed: setCollapsed,
    addNotification,
  } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  // Verificăm dacă utilizatorul are permisiunea de a administra rolurile
  const isAdmin = role === "admin";
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      dashboard: true,
      management: true,
      reports: true,
    }
  );

  // Definim grupurile de navigare - optimizat cu memoizare
  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        title: t("sidebar.dashboardGroup"),
        icon: <LayoutDashboard size={20} />,
        items: [
          {
            title: t("sidebar.dashboard"),
            icon: <Home size={20} />,
            href: "/dashboard",
          },
          // Eliminăm "sidebar overview" care nu ar trebui să existe
          // {
          //   title: t("sidebar.overview"),
          //   icon: <BarChart size={20} />,
          //   href: "/overview",
          // },
        ],
      },
      {
        title: t("sidebar.managementGroup"),
        icon: <Briefcase size={20} />,
        items: [
          {
            title: t("sidebar.projects"),
            icon: <Briefcase size={20} />,
            href: "/projects",
            badge: 3,
            badgeColor: "bg-blue-500",
          },
          {
            title: t("sidebar.inventory"),
            icon: <Package size={20} />,
            href: "/inventory-management",
            badge: 12,
            badgeColor: "bg-green-500",
          },
          {
            title: t("sidebar.companyInventory", "Company Inventory"),
            icon: <Package size={20} />,
            href: "/company-inventory",
          },
          {
            title: t("sidebar.suppliers"),
            icon: <Building size={20} />,
            href: "/suppliers",
          },
          {
            title: t("sidebar.teams"),
            icon: <Users size={20} />,
            href: "/teams",
          },
          {
            title: t("sidebar.budget"),
            icon: <DollarSign size={20} />,
            href: "/budget",
          },
        ],
      },
      {
        title: t("sidebar.reportsGroup"),
        icon: <FileSpreadsheet size={20} />,
        items: [
          {
            title: t("sidebar.reports"),
            icon: <FileSpreadsheet size={20} />,
            href: "/reports",
          },
          {
            title: t("sidebar.analytics", "Analytics"),
            icon: <BarChart size={20} />,
            href: "/analytics",
          },
          {
            title: t("sidebar.calendar", "Calendar"),
            icon: <Calendar size={20} />,
            href: "/calendar",
          },
          {
            title: t("sidebar.documents"),
            icon: <FileText size={20} />,
            href: "/documents",
          },
          {
            title: t("sidebar.resources"),
            icon: <FolderArchive size={20} />,
            href: "/resources",
          },
          // Eliminat elementul sidebar.task care nu ar trebui să existe
        ],
      },
    ],
    [t]
  );

  // Verificăm dacă un item este activ - optimizat cu memoizare
  const isActive = useMemoizedCallback(
    (href: string) => location.pathname === href,
    [location.pathname]
  );

  // Gestionăm expandarea/colapsarea grupurilor - optimizat cu memoizare
  const toggleGroup = useMemoizedCallback((groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  }, []);

  // Gestionăm deconectarea - optimizat cu memoizare
  const handleSignOut = useMemoizedCallback(async () => {
    await logout();
    addNotification({
      type: "success",
      title: "Deconectat",
      message: "Te-ai deconectat cu succes",
      duration: 3000,
    });
    navigate("/login");
  }, [logout, addNotification, navigate]);

  // Când se schimbă ruta, expandăm automat grupul corespunzător
  useEffect(() => {
    navGroups.forEach((group) => {
      const activeItem = group.items.find((item) => isActive(item.href));
      if (activeItem) {
        setExpandedGroups((prev) => ({
          ...prev,
          [group.title]: true,
        }));
      }
    });
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <span className="text-xl font-bold text-primary">Inventory</span>
            <span className="text-xl font-bold text-white">Pro</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                userProfile?.displayName || "user"
              }`}
              alt={userProfile?.displayName || "User"}
            />
            <AvatarFallback>
              {userProfile?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3"
            >
              <p className="font-medium text-sm">
                {userProfile?.displayName || "Utilizator"}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[160px]">
                {userProfile?.email || ""}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-4">
              {/* Group header */}
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-md"
                >
                  <div className="flex items-center">
                    {group.icon}
                    <span className="ml-3">{group.title}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform duration-200",
                      expandedGroups[group.title] ? "transform rotate-180" : ""
                    )}
                  />
                </button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleGroup(group.title)}
                        className="flex items-center justify-center w-full p-2 text-slate-400 hover:text-white rounded-md"
                      >
                        {group.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{group.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Group items */}
              <AnimatePresence>
                {(expandedGroups[group.title] || collapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 space-y-1"
                  >
                    {group.items.map((item) => (
                      <TooltipProvider key={item.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive(item.href)
                                  ? "bg-slate-800 text-white"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800",
                                collapsed && "justify-center px-2"
                              )}
                            >
                              <span className="relative">
                                {item.icon}
                                {item.badge && !collapsed && (
                                  <span
                                    className={cn(
                                      "absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white rounded-full",
                                      item.badgeColor || "bg-primary"
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </span>
                              {!collapsed && (
                                <span className="ml-3 flex-1">
                                  {item.title}
                                </span>
                              )}
                              {!collapsed && item.badge && (
                                <span
                                  className={cn(
                                    "ml-auto flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full",
                                    item.badgeColor || "bg-primary"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              <p>{item.title}</p>
                              {item.badge && (
                                <span
                                  className={cn(
                                    "ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full",
                                    item.badgeColor || "bg-primary"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="space-y-2">
          {/* Adăugăm link către pagina de administrare a rolurilor - vizibil doar pentru administratori */}
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                      collapsed && "justify-center"
                    )}
                    onClick={() => navigate("/role-management")}
                  >
                    <Shield size={20} />
                    {!collapsed && (
                      <span className="ml-3">
                        {t("sidebar.roleManagement", "Role Management")}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <p>{t("sidebar.roleManagement", "Role Management")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Link către pagina de demo notificări */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                    collapsed && "justify-center"
                  )}
                  onClick={() => navigate("/notifications-demo")}
                >
                  <Bell size={20} />
                  {!collapsed && <span className="ml-3">Notificări Demo</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>Notificări Demo</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Link către pagina de asistent AI */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                    collapsed && "justify-center",
                    location.pathname === "/ai-assistant" &&
                      "bg-slate-800 text-white"
                  )}
                  onClick={() => navigate("/ai-assistant")}
                >
                  <Bot size={20} />
                  {!collapsed && (
                    <span className="ml-3 flex items-center">
                      Asistent Inventar
                      <Sparkles size={14} className="ml-1 text-yellow-400" />
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>Asistent Inventar AI</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Link către dashboard-ul de testare */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                    collapsed && "justify-center"
                  )}
                  onClick={() => navigate("/test-dashboard")}
                >
                  <TestTube size={20} />
                  {!collapsed && <span className="ml-3">Test Dashboard</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>Test Dashboard</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Link către pagina de tutorial și ajutor */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                    collapsed && "justify-center"
                  )}
                  onClick={() => navigate("/tutorial")}
                >
                  <BookOpen size={20} />
                  {!collapsed && (
                    <span className="ml-3">
                      {t("sidebar.tutorial", "Tutoriale & Ajutor")}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{t("sidebar.tutorial", "Tutoriale & Ajutor")}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Link către pagina de debug - vizibil doar în modul de dezvoltare */}
          {import.meta.env.DEV && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                      collapsed && "justify-center"
                    )}
                    onClick={() => navigate("/debug")}
                  >
                    <Bug size={20} />
                    {!collapsed && (
                      <span className="ml-3">
                        {t("sidebar.debug", "Debug & Dezvoltare")}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <p>{t("sidebar.debug", "Debug & Dezvoltare")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                    collapsed && "justify-center"
                  )}
                  onClick={() => navigate("/settings")}
                >
                  <Settings size={20} />
                  {!collapsed && (
                    <span className="ml-3">{t("sidebar.settings")}</span>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{t("sidebar.settings")}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
                    collapsed && "justify-center"
                  )}
                  onClick={handleSignOut}
                >
                  <LogOut size={20} />
                  {!collapsed && (
                    <span className="ml-3">{t("sidebar.logout")}</span>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{t("sidebar.logout")}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

// Folosim memo pentru a preveni re-renderizări inutile
export default memo(Sidebar);
