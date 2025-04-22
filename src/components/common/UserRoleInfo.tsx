import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoles } from '@/types/supabase-tables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldCheck, ShieldAlert, User, Users, Package, FileText } from 'lucide-react';

interface UserRoleInfoProps {
  className?: string;
}

const UserRoleInfo: React.FC<UserRoleInfoProps> = ({ className = '' }) => {
  const { userProfile, userRole, permissions } = useAuth();

  // Funcție pentru a obține iconul și culoarea în funcție de rol
  const getRoleInfo = () => {
    switch (userRole) {
      case UserRoles.ADMIN:
        return {
          icon: <ShieldAlert className="h-6 w-6 text-red-500" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          description: 'Acces complet la toate funcționalitățile sistemului.'
        };
      case UserRoles.MANAGER:
        return {
          icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          description: 'Acces la gestionarea proiectelor, echipelor și bugetelor.'
        };
      case UserRoles.TEAM_LEAD:
        return {
          icon: <Users className="h-6 w-6 text-green-500" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          description: 'Acces la gestionarea echipei și a proiectelor asociate.'
        };
      case UserRoles.INVENTORY_MANAGER:
        return {
          icon: <Package className="h-6 w-6 text-amber-500" />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          description: 'Acces la gestionarea inventarului și a materialelor.'
        };
      case UserRoles.WORKER:
        return {
          icon: <User className="h-6 w-6 text-purple-500" />,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
          description: 'Acces la proiectele și sarcinile atribuite.'
        };
      default:
        return {
          icon: <Shield className="h-6 w-6 text-slate-500" />,
          color: 'text-slate-500',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20',
          description: 'Acces limitat la vizualizarea informațiilor.'
        };
    }
  };

  const roleInfo = getRoleInfo();

  // Funcție pentru a formata numele rolului
  const formatRoleName = (role: UserRoles | null): string => {
    if (!role) return 'Necunoscut';
    
    // Convertim din snake_case în text formatat
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Funcție pentru a obține lista de permisiuni
  const getPermissionsList = () => {
    if (!permissions) return [];
    
    const permissionsList = [];
    
    if (permissions.canCreateProjects) permissionsList.push('Creare proiecte');
    if (permissions.canEditProjects) permissionsList.push('Editare proiecte');
    if (permissions.canDeleteProjects) permissionsList.push('Ștergere proiecte');
    if (permissions.canViewAllProjects) permissionsList.push('Vizualizare toate proiectele');
    if (permissions.canManageUsers) permissionsList.push('Gestionare utilizatori');
    if (permissions.canManageInventory) permissionsList.push('Gestionare inventar');
    if (permissions.canViewReports) permissionsList.push('Vizualizare rapoarte');
    if (permissions.canCreateReports) permissionsList.push('Creare rapoarte');
    if (permissions.canViewBudget) permissionsList.push('Vizualizare buget');
    if (permissions.canManageBudget) permissionsList.push('Gestionare buget');
    if (permissions.canViewTeams) permissionsList.push('Vizualizare echipe');
    if (permissions.canManageTeams) permissionsList.push('Gestionare echipe');
    
    return permissionsList;
  };

  return (
    <Card className={`${className} ${roleInfo.bgColor} border ${roleInfo.borderColor}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {roleInfo.icon}
          <span className={roleInfo.color}>
            {userProfile?.displayName || 'Utilizator'} - {formatRoleName(userRole)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-400 mb-3">{roleInfo.description}</p>
        
        <div className="text-xs">
          <h4 className="font-semibold mb-1">Permisiuni:</h4>
          <ul className="space-y-1">
            {getPermissionsList().map((permission, index) => (
              <li key={index} className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-400" />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleInfo;
