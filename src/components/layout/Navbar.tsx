import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Search,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNotification } from "@/components/ui/notification";
import { fadeIn, fadeInDown } from "@/lib/animation-variants";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/ui/global-search";
import { NotificationCenter } from "@/components/ui/notification-center";

// Importăm hook-uri personalizate
import { useAuth, useUI } from "@/store";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { t } = useTranslation();
  const { user, userProfile, logout, role } = useAuth();
  const { theme, setTheme, currentPage, addNotification } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Proiect nou",
      message: "Un nou proiect a fost creat",
      time: "acum 5 minute",
      read: false,
    },
    {
      id: "2",
      title: "Material adăugat",
      message: "S-a adăugat un material nou în inventar",
      time: "acum 1 oră",
      read: false,
    },
  ]);

  // Obținem titlul paginii curente din store
  const getPageTitle = () => {
    return currentPage || "Acasă";
  };

  // Funcție pentru a obține culoarea rolului
  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "text-red-400";
      case "manager":
        return "text-blue-400";
      case "director":
        return "text-purple-400";
      default:
        return "text-green-400";
    }
  };

  // Gestionăm căutarea
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    addNotification({
      type: "info",
      title: "Căutare",
      message: `Ai căutat: "${searchQuery}"`,
      duration: 3000,
    });

    // Aici ar trebui să implementăm logica reală de căutare
    console.log("Searching for:", searchQuery);

    // Resetăm căutarea
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  // Gestionăm deconectarea
  const handleSignOut = async () => {
    await logout();
    addNotification({
      type: "success",
      title: "Deconectat",
      message: "Te-ai deconectat cu succes",
      duration: 3000,
    });
    navigate("/login");
  };

  // Gestionăm schimbarea temei
  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    addNotification({
      type: "info",
      title: "Temă schimbată",
      message:
        newTheme === "light"
          ? "Temă deschisă activată"
          : "Temă întunecată activată",
      duration: 3000,
    });
  };

  // Gestionăm citirea notificărilor
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    addNotification({
      type: "success",
      title: "Notificări",
      message: "Toate notificările au fost marcate ca citite",
      duration: 3000,
    });
  };

  // Numărul de notificări necitite
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-3 px-4 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold hidden md:block">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        {/* Search */}
        {/* Global Search */}
        <GlobalSearch />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tutorial")}
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <NotificationCenter />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 rounded-full flex items-center gap-2 pl-2 pr-1"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${
                    userProfile?.displayName ||
                    user?.email?.split("@")[0] ||
                    "user"
                  }`}
                  alt={
                    userProfile?.displayName ||
                    user?.email?.split("@")[0] ||
                    "User"
                  }
                />
                <AvatarFallback className={getRoleColor()}>
                  {userProfile?.displayName?.charAt(0) ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span
                className={`hidden md:inline-block text-sm font-medium max-w-[100px] truncate ${getRoleColor()}`}
              >
                {userProfile?.displayName ||
                  user?.email?.split("@")[0] ||
                  "Utilizator"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-800 border-slate-700"
          >
            <div className="flex items-center justify-start p-2 border-b border-slate-700">
              <div className="flex flex-col space-y-1 leading-none">
                <p className={`font-medium ${getRoleColor()}`}>
                  {userProfile?.displayName ||
                    user?.email?.split("@")[0] ||
                    "Utilizator"}
                </p>
                <p className="text-sm text-slate-400 truncate">
                  {userProfile?.email || user?.email || ""}
                </p>
              </div>
            </div>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-slate-700 flex items-center"
              onClick={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
              <span className="ml-auto text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                P
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-slate-700 flex items-center"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Setări</span>
              <span className="ml-auto text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                S
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              className="cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Deconectare</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
