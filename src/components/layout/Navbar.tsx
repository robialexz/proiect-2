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
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/ui/notification";
import { fadeIn, fadeInDown } from "@/lib/animation-variants";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { t } = useTranslation();
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
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

  // Obținem titlul paginii curente
  const getPageTitle = () => {
    const path = location.pathname.split("/")[1];
    
    if (!path) return "Acasă";
    
    // Transformăm path în titlu (ex: "inventory-management" -> "Inventory Management")
    return path
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
    await signOut();
    addNotification({
      type: "success",
      title: "Deconectat",
      message: "Te-ai deconectat cu succes",
      duration: 3000,
    });
    navigate("/login");
  };

  // Gestionăm schimbarea temei
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Aici ar trebui să implementăm logica reală de schimbare a temei
    addNotification({
      type: "info",
      title: "Temă schimbată",
      message: isDarkMode ? "Temă deschisă activată" : "Temă întunecată activată",
      duration: 3000,
    });
  };

  // Gestionăm citirea notificărilor
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    addNotification({
      type: "success",
      title: "Notificări",
      message: "Toate notificările au fost marcate ca citite",
      duration: 3000,
    });
  };

  // Numărul de notificări necitite
  const unreadCount = notifications.filter(n => !n.read).length;

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
        <AnimatePresence>
          {isSearchOpen ? (
            <motion.form
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              className="relative"
              onSubmit={handleSearch}
            >
              <Input
                type="search"
                placeholder="Caută..."
                className="pr-8 bg-slate-700 border-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            addNotification({
              type: "info",
              title: "Ajutor",
              message: "Secțiunea de ajutor va fi disponibilă în curând",
              duration: 3000,
            });
          }}
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-[10px]"
                  variant="default"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between p-2 border-b border-slate-700">
              <h3 className="font-medium">Notificări</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllNotificationsAsRead}
                >
                  Marchează toate ca citite
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 border-b border-slate-700 last:border-0 hover:bg-slate-700/50 cursor-pointer",
                      !notification.read && "bg-slate-700/30"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-slate-400">{notification.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{notification.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  Nu ai notificări
                </div>
              )}
            </div>
            <div className="p-2 border-t border-slate-700">
              <Button variant="outline" size="sm" className="w-full">
                Vezi toate notificările
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 rounded-full flex items-center gap-2 pl-2 pr-1"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.displayName || "user"}`}
                  alt={userProfile?.displayName || "User"}
                />
                <AvatarFallback>
                  {userProfile?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium max-w-[100px] truncate">
                {userProfile?.displayName || "Utilizator"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-start p-2 border-b border-slate-700">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{userProfile?.displayName || "Utilizator"}</p>
                <p className="text-sm text-slate-400 truncate">
                  {userProfile?.email || user?.email || ""}
                </p>
              </div>
            </div>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-slate-700"
              onClick={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-slate-700"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Setări</span>
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
