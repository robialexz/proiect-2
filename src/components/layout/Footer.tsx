import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps = {}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "w-full bg-slate-900 text-white py-12 px-4 md:px-8 border-t border-slate-800",
        className
      )}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">IM</span>
              </div>
              <span className="font-bold text-xl text-white">
                InventoryMaster
              </span>
            </div>
            <p className="text-slate-300 mb-4">
              Modern solutions for efficient inventory management and project
              material tracking.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Facebook size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Twitter size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Instagram size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Linkedin size={20} />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/warehouse-inventory"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Warehouse Inventory
                </Link>
              </li>
              <li>
                <Link
                  to="/project-inventory"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Project Inventory
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/gdpr"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  123 Inventory Street, Business District, 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-slate-300" />
                <span className="text-slate-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-slate-300" />
                <span className="text-slate-300">
                  contact@inventorydashboard.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © {currentYear} Inventory Management Dashboard. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/help"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Help Center
            </Link>
            <Link
              to="/faq"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              FAQ
            </Link>
            <Link
              to="/support"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
