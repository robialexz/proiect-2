import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useMemoizedCallback, useMemoizedValue } from "@/lib/performance";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RoleIndicator from "@/components/auth/RoleIndicator";
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
  Laptop,
  Wrench,
  Zap,
  Lock,
  Warehouse,
  GanttChart,
  Activity,
} from "lucide-react";
import RoleBasedSidebarItem from "./RoleBasedSidebarItem";
import SystemHealthSidebarItem from "./SystemHealthSidebarItem";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotification } from "@/components/ui/notification";
import { fadeInLeft, fadeInRight } from "@/lib/animation-variants";

// Importăm hook-uri personalizate
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/store";

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
  const { user, userProfile, signOut } = useAuth();
  const {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed: setCollapsed,
    addNotification,
  } = useUI();

  const location = useLocation();
  const navigate = useNavigate();

  // Determinăm dacă utilizatorul este administrator
  const isAdmin = userProfile?.role === "ADMIN";
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
          },
          {
            title: t("sidebar.inventoryOverview", "Inventory Overview"),
            icon: <BarChart size={20} />,
            href: "/inventory-overview",
          },
          {
            title: t("sidebar.companyInventory", "Company Inventory"),
            icon: <Warehouse size={20} />,
            href: "/company-inventory",
          },
          {
            title: t("sidebar.projectInventory", "Project Inventory"),
            icon: <Package size={20} />,
            href: "/project-inventory",
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
          {
            title: t("sidebar.tenders", "Tenders"),
            icon: <GanttChart size={20} />,
            href: "/tenders",
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
    try {
      await signOut();
    } catch (error) {
      // Handle error appropriately
    }
    addNotification({
      type: "success",
      title: "Deconectat",
      message: "Te-ai deconectat cu succes",
      duration: 3000,
    });
    navigate("/login");
  }, [signOut, addNotification, navigate]);

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
              src={`https:
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
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {userProfile?.displayName || "Utilizator"}
                </p>
                {userRole && (
                  <RoleIndicator
                    showIcon={false}
                    className="text-xs py-0 px-1.5 h-4"
                  />
                )}
              </div>
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
          {/* Link către pagina de administrare - vizibil doar pentru administratori */}
          <RoleBasedSidebarItem
            path="/admin"
            icon={Shield}
            label="Panou Administrare"
            translationKey="sidebar.admin"
            allowedRoles={["admin"]}
            collapsed={collapsed}
          />

          {/* Link către pagina de administrare a permisiunilor - vizibil doar pentru administratori */}
          <RoleBasedSidebarItem
            path="/role-permissions"
            icon={Lock}
            label="Permisiuni"
            translationKey="sidebar.rolePermissions"
            allowedRoles={["admin"]}
            collapsed={collapsed}
          />

          {/* Link către pagina de asistent AI */}
          <RoleBasedSidebarItem
            path="/ai-assistant"
            icon={Bot}
            label="Asistent Inventar"
            translationKey="sidebar.aiAssistant"
            allowedRoles={["admin", "manager", "user", "viewer"]}
            collapsed={collapsed}
            iconExtra={<Sparkles size={14} className="ml-1 text-yellow-400" />}
          />

          {/* Link către pagina de tutorial și ajutor */}
          <RoleBasedSidebarItem
            path="/tutorial"
            icon={BookOpen}
            label="Tutoriale & Ajutor"
            translationKey="sidebar.tutorial"
            allowedRoles={["admin", "manager", "user", "viewer"]}
            collapsed={collapsed}
          />

          {/* Link către pagina de testare - doar pentru administratori */}
          <RoleBasedSidebarItem
            path="/tester"
            icon={TestTube}
            label="Testare Aplicație"
            translationKey="sidebar.tester"
            allowedRoles={["admin"]}
            collapsed={collapsed}
          />

          {/* Link către pagina de monitorizare a stării sistemului */}
          <SystemHealthSidebarItem collapsed={collapsed} />

          {/* Link către pagina de activitate a utilizatorilor */}
          <RoleBasedSidebarItem
            path="/user-activity"
            icon={Activity}
            label="Activitate Utilizatori"
            translationKey="sidebar.userActivity"
            allowedRoles={["admin"]}
            collapsed={collapsed}
          />

          {/* Acest link este duplicat și poate fi eliminat deoarece avem deja RoleBasedSidebarItem pentru asistentul AI */}

          {/* Link către pagina de optimizator inventar */}
          <RoleBasedSidebarItem
            path="/inventory-optimizer"
            icon={Zap}
            label="Optimizator Inventar"
            translationKey="sidebar.inventoryOptimizer"
            allowedRoles={["admin", "manager", "user"]}
            collapsed={collapsed}
          />

          {/* Link către pagina de reparare butoane inventar */}
          <RoleBasedSidebarItem
            path="/inventory-button-fixer"
            icon={Wrench}
            label="Reparare Butoane"
            translationKey="sidebar.inventoryButtonFixer"
            allowedRoles={["admin", "manager"]}
            collapsed={collapsed}
          />

          {/* Link către pagina de informații despre aplicația desktop */}
          <RoleBasedSidebarItem
            path="/desktop-info"
            icon={Laptop}
            label="Desktop Info"
            translationKey="desktop.sidebar.desktopInfo"
            allowedRoles={["admin", "manager", "user", "viewer"]}
            collapsed={collapsed}
          />

          <RoleBasedSidebarItem
            path="/settings"
            icon={Settings}
            label="Setări"
            translationKey="sidebar.settings"
            allowedRoles={["admin", "manager"]}
            collapsed={collapsed}
          />

          {/* Butonul de deconectare este disponibil pentru toți utilizatorii */}
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
