import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  Info,
  FileText,
  DollarSign,
  Mail,
  Bell,
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher"; // Import the switcher
import { useTranslation } from "react-i18next"; // Import useTranslation
import SettingsModal from "./SettingsModal";

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
}

// Remove hardcoded links, will use translation keys
// const navLinks = [ ... ];
// const dashboardLinks = [ ... ];

const Navbar = ({
  isLoggedIn = false,
  userName = "Guest User",
  userAvatar = "",
}: NavbarProps) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Define links using translation keys with icons
  const navLinks = [
    { name: t("sidebar.home"), path: "/", icon: <Home size={16} /> },
    { name: t("About Us"), path: "/about", icon: <Info size={16} /> },
    { name: t("Terms"), path: "/terms", icon: <FileText size={16} /> },
    { name: t("Pricing"), path: "/pricing", icon: <DollarSign size={16} /> },
    { name: t("Contact"), path: "/contact", icon: <Mail size={16} /> },
  ];

  const dashboardLinks = [
    { name: t("sidebar.dashboard"), path: "/dashboard" },
    { name: t("sidebar.projects"), path: "/projects" },
    { name: t("sidebar.inventory"), path: "/inventory-management" },
    { name: t("sidebar.teams"), path: "/teams" },
    { name: t("sidebar.suppliers"), path: "/suppliers" },
    { name: t("sidebar.budget"), path: "/budget" },
    { name: t("sidebar.reports"), path: "/reports" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -2, 2, -2, 0] }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-2xl font-bold text-primary">
                    Inventory
                  </span>
                  <span className="text-2xl font-bold text-white">Pro</span>
                </motion.div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Only show marketing links when not logged in */}
              {!isLoggedIn &&
                navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      {link.icon && <span>{link.icon}</span>}
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

              {isLoggedIn && (
                <DropdownMenu>
                  {/* Removed asChild from DropdownMenuTrigger */}
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      <motion.span
                        className="flex items-center gap-1"
                        whileHover={{ y: -1 }}
                      >
                        {t("sidebar.dashboard")} <ChevronDown size={16} />
                      </motion.span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-slate-800 border-slate-700"
                  >
                    {dashboardLinks.map((link) => (
                      /* Removed asChild from DropdownMenuItem */
                      <DropdownMenuItem
                        key={link.path}
                        className="text-slate-300 hover:text-white focus:bg-slate-700"
                        onClick={() => navigate(link.path)} // Use onClick for navigation
                      >
                        {/* <Link to={link.path} className="w-full"> */}
                        {link.name}
                        {/* </Link> */}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* User Authentication & Language Switcher */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {/* Add Language Switcher here */}
              <LanguageSwitcher />

              {isLoggedIn ? (
                <DropdownMenu>
                  {/* Removed asChild from DropdownMenuTrigger */}
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-slate-400 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">{userName}</span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-slate-800 border-slate-700"
                  >
                    {/* Removed asChild from DropdownMenuItem */}
                    <DropdownMenuItem
                      className="text-slate-300 hover:text-white focus:bg-slate-700"
                      onClick={() => navigate("/profile")} // Use onClick for navigation
                    >
                      <User size={16} />
                      <span>{t("Profile")}</span>
                    </DropdownMenuItem>
                    {/* Removed asChild from DropdownMenuItem */}
                    <DropdownMenuItem
                      className="text-slate-300 hover:text-white focus:bg-slate-700"
                      onClick={() => setSettingsOpen(true)} // Open settings modal
                    >
                      <Settings size={16} />
                      <span>{t("sidebar.settings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="text-slate-300 hover:text-white focus:bg-slate-700 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <LogOut size={16} />
                        <span>{t("Logout")}</span> {/* Assuming 'Logout' key */}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    // asChild removed previously
                    className="text-slate-400 hover:text-white"
                  >
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn size={16} />
                      <span>{t("Login")}</span> {/* Assuming 'Login' key */}
                    </Link>
                  </Button>
                  <Button>
                    {" "}
                    {/* asChild removed previously */}
                    <Link to="/register">{t("Register")}</Link>{" "}
                    {/* Assuming 'Register' key */}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                className="text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-slate-900 border-b border-slate-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {/* Only show marketing links when not logged in */}
                {!isLoggedIn &&
                  navLinks.map((link) => (
                    <motion.div
                      key={link.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to={link.path}
                        className="block px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}

                {isLoggedIn && (
                  <>
                    <div className="pt-2 pb-1">
                      <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {t("sidebar.dashboard")}
                      </p>
                    </div>
                    {dashboardLinks.map((link, index) => (
                      <motion.div
                        key={link.path}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          className="block px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}

                <div className="pt-4 pb-3 border-t border-slate-800">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center px-3">
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userAvatar} alt={userName} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-white">
                            {userName}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <Link
                          to="/profile"
                          className="block px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t("Profile")}
                        </Link>
                        <button
                          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSettingsOpen(true);
                          }}
                        >
                          {t("sidebar.settings")}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          {t("Logout")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1 px-2">
                      <Link
                        to="/login"
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t("Login")}
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t("Register")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
