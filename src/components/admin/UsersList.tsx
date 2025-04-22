import React, { useState } from 'react';
import { UserWithRole } from '@/models/user';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal, Search, UserCog, Eye, Shield, Activity } from 'lucide-react';

interface UsersListProps {
  users: UserWithRole[];
  onViewUser: (user: UserWithRole) => void;
  onEditRole: (user: UserWithRole) => void;
  onViewActivity: (user: UserWithRole) => void;
  loading: boolean;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  onViewUser,
  onEditRole,
  onViewActivity,
  loading
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrăm utilizatorii în funcție de termenul de căutare
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funcție pentru a formata data
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('admin.users.never', 'Never');
    return format(new Date(dateString), 'PPp', { locale: ro });
  };

  // Funcție pentru a obține culoarea badge-ului în funcție de rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t('admin.users.title', 'Users')}
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t('admin.users.search', 'Search users...')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.name', 'Name')}</TableHead>
              <TableHead>{t('admin.users.email', 'Email')}</TableHead>
              <TableHead>{t('admin.users.role', 'Role')}</TableHead>
              <TableHead>{t('admin.users.lastLogin', 'Last Login')}</TableHead>
              <TableHead>{t('admin.users.createdAt', 'Created At')}</TableHead>
              <TableHead className="text-right">{t('admin.users.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('admin.users.loading', 'Loading users...')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? t('admin.users.noResults', 'No users found matching your search.')
                    : t('admin.users.noUsers', 'No users found.')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.user_metadata?.full_name || t('admin.users.unnamed', 'Unnamed')}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('admin.users.openMenu', 'Open menu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('admin.users.actions', 'Actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('admin.users.viewDetails', 'View Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditRole(user)}>
                          <Shield className="h-4 w-4 mr-2" />
                          {t('admin.users.editRole', 'Edit Role')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewActivity(user)}>
                          <Activity className="h-4 w-4 mr-2" />
                          {t('admin.users.viewActivity', 'View Activity')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default UsersList;
