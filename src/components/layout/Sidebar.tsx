import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Info,
  FileText,
  DollarSign,
  Mail,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({
  icon,
  label,
  to,
  isCollapsed = false,
  isActive = false,
  onClick,
}: NavItemProps) => {
  if (to === "#logout") {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-300 text-slate-400 hover:text-white",
                isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800",
                isCollapsed ? "h-10 w-10 p-0" : "h-10 px-4",
              )}
              onClick={onClick}
            >
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </Button>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={to} className="w-full">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-300 text-slate-400 hover:text-white",
                isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800",
                isCollapsed ? "h-10 w-10 p-0" : "h-10 px-4",
              )}
            >
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

interface SidebarProps {
  defaultCollapsed?: boolean;
  className?: string;
}

const Sidebar = ({
  defaultCollapsed = false,
  className = "",
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation hook

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Navigation items grouped by category using translation keys
  const mainNavItems = [
    { icon: <Home size={20} />, label: t("sidebar.home"), to: "/" },
    {
      icon: <LayoutDashboard size={20} />,
      label: t("sidebar.dashboard"),
      to: "/dashboard",
    },
    {
      icon: <FileText size={20} />,
      label: t("sidebar.projects"),
      to: "/projects",
    },
    {
      icon: <Package size={20} />,
      label: t("sidebar.inventory"),
      to: "/inventory-management",
    },
    {
      icon: <Users size={20} />,
      label: t("sidebar.teams"),
      to: "/teams",
    },
    {
      icon: <FileSpreadsheet size={20} />,
      label: t("sidebar.suppliers"),
      to: "/suppliers",
    },
  ];

  const secondaryNavItems = [
    {
      icon: <DollarSign size={20} />,
      label: t("sidebar.budget"),
      to: "/budget",
    },
    {
      icon: <Mail size={20} />,
      label: t("sidebar.reports"),
      to: "/reports",
    },
    {
      icon: <Info size={20} />,
      label: t("sidebar.resources"),
      to: "/resources",
    },
  ];

  const settingsNavItems = [
    {
      icon: <Settings size={20} />,
      label: t("sidebar.settings"),
      to: "/settings",
    },
    { icon: <LogOut size={20} />, label: t("Logout"), to: "#logout" }, // Assuming 'Logout' key
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64 lg:w-72",
        className,
      )}
    >
      {/* Mobile toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <span
          className={cn(
            "font-semibold transition-opacity text-white",
            isCollapsed ? "opacity-0" : "opacity-100",
          )}
        >
          {t("Menu")} {/* Assuming 'Menu' key */}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Sidebar header with logo */}
      <div className="p-4 border-b border-slate-800 hidden lg:block">
        <Link to="/" className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2">
            <span className="text-primary-foreground font-bold">IM</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-white">
              InventoryMaster
            </span>
          )}
        </Link>
      </div>

      {/* Sidebar content */}
      <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2">
        {/* Main navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isCollapsed={isCollapsed}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>

        {/* Secondary navigation */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-1">
          {secondaryNavItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isCollapsed={isCollapsed}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>

        {/* Settings and logout */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-1">
          {settingsNavItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isCollapsed={isCollapsed}
              isActive={location.pathname === item.to}
              onClick={item.to === "#logout" ? handleLogout : undefined}
            />
          ))}
        </div>

        {/* Collapse toggle button */}
        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-10 justify-center hidden lg:flex text-slate-400 hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
