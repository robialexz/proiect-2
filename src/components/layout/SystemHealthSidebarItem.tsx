import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import RoleBasedSidebarItem from "./RoleBasedSidebarItem";

interface SystemHealthSidebarItemProps {
  collapsed?: boolean;
}

/**
 * Componentă pentru elementul din sidebar pentru monitorizarea stării sistemului
 * @param collapsed Dacă sidebar-ul este collapsat
 */
const SystemHealthSidebarItem: React.FC<SystemHealthSidebarItemProps> = ({
  collapsed = false,
}) => {
  return (
    <RoleBasedSidebarItem
      path="/system-health"
      icon={Activity}
      label="Stare Sistem"
      translationKey="sidebar.systemHealth"
      allowedRoles={["admin"]}
      requiredPermissions={["view_system_health"]}
      collapsed={collapsed}
    />
  );
};

export default SystemHealthSidebarItem;
