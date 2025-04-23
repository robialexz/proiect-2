import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/lib/company-service';
import { Company, CompanyUser, CompanyUserRole } from '@/models/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Edit, 
  Trash, 
  Mail,
  Shield,
  User
} from 'lucide-react';

const CompanyUsersPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [canManageUsers, setCanManageUsers] = useState(false);
  
  // State pentru dialogul de adăugare/editare utilizator
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyUserRole>(CompanyUserRole.VIEWER);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Verificăm dacă utilizatorul are permisiunea de a gestiona utilizatorii companiei
  useEffect(() => {
    const checkPermissions = async () => {
      if (user && companyId) {
        try {
          setLoading(true);
          
          // Verificăm dacă utilizatorul este admin de site
          const isSiteAdmin = await companyService.isSiteAdmin(user.id);
          
          // Verificăm dacă utilizatorul este admin în compania respectivă
          const isCompanyAdmin = await companyService.isCompanyAdmin(user.id, companyId);
          
          setCanManageUsers(isSiteAdmin || isCompanyAdmin);
          
          if (!isSiteAdmin && !isCompanyAdmin) {
            toast({
              title: 'Acces restricționat',
              description: 'Nu aveți permisiunea de a accesa această pagină.',
              variant: 'destructive'
            });
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Eroare la verificarea permisiunilor:', error);
          toast({
            title: 'Eroare',
            description: 'A apărut o eroare la verificarea permisiunilor.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkPermissions();
  }, [user, companyId, navigate, toast]);
  
  // Încărcăm datele companiei și utilizatorii
  useEffect(() => {
    const loadData = async () => {
      if (companyId && canManageUsers) {
        try {
          setLoading(true);
          
          // Încărcăm datele companiei
          const companyData = await companyService.getCompanyById(companyId);
          setCompany(companyData);
          
          // Încărcăm utilizatorii companiei
          const response = await companyService.getCompanyUsers(companyId);
          setUsers(response.data);
        } catch (error) {
          console.error('Eroare la încărcarea datelor:', error);
          toast({
            title: 'Eroare',
            description: 'A apărut o eroare la încărcarea datelor.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [companyId, canManageUsers, toast]);
  
  // Filtrăm utilizatorii după termen de căutare
  const filteredUsers = users.filter(user => {
    const userEmail = user.user?.email || '';
    const userName = user.user?.display_name || '';
    
    return userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Funcție pentru a deschide dialogul de adăugare utilizator
  const handleAddUser = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setEmail('');
    setRole(CompanyUserRole.VIEWER);
    setIsAdmin(false);
    setIsDialogOpen(true);
  };
  
  // Funcție pentru a deschide dialogul de editare utilizator
  const handleEditUser = (user: CompanyUser) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setEmail(user.user?.email || '');
    setRole(user.role as CompanyUserRole);
    setIsAdmin(user.is_admin);
    setIsDialogOpen(true);
  };
  
  // Funcție pentru a invita un utilizator în companie
  const handleInviteUser = async () => {
    if (!email) {
      toast({
        title: 'Eroare',
        description: 'Adresa de email este obligatorie.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (companyId) {
        await companyService.inviteUserToCompany({
          company_id: companyId,
          email,
          role,
          is_admin: isAdmin
        });
        
        toast({
          title: 'Succes',
          description: 'Invitația a fost trimisă cu succes.',
        });
        
        setIsDialogOpen(false);
        
        // Reîncărcăm lista de utilizatori
        const response = await companyService.getCompanyUsers(companyId);
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Eroare la invitarea utilizatorului:', error);
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la invitarea utilizatorului.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Funcție pentru a actualiza un utilizator
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      
      if (companyId) {
        await companyService.updateCompanyUser(
          companyId,
          selectedUser.user_id,
          role,
          isAdmin
        );
        
        toast({
          title: 'Succes',
          description: 'Utilizatorul a fost actualizat cu succes.',
        });
        
        setIsDialogOpen(false);
        
        // Actualizăm lista de utilizatori
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, role, is_admin: isAdmin } 
            : u
        ));
      }
    } catch (error) {
      console.error('Eroare la actualizarea utilizatorului:', error);
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la actualizarea utilizatorului.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Funcție pentru a șterge un utilizator
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Sigur doriți să eliminați acest utilizator din companie? Această acțiune nu poate fi anulată.')) {
      try {
        if (companyId) {
          await companyService.removeUserFromCompany(companyId, userId);
          
          toast({
            title: 'Succes',
            description: 'Utilizatorul a fost eliminat cu succes din companie.',
          });
          
          // Actualizăm lista de utilizatori
          setUsers(users.filter(u => u.user_id !== userId));
        }
      } catch (error) {
        console.error('Eroare la eliminarea utilizatorului:', error);
        toast({
          title: 'Eroare',
          description: 'A apărut o eroare la eliminarea utilizatorului.',
          variant: 'destructive'
        });
      }
    }
  };
  
  // Funcție pentru a afișa numele rolului
  const getRoleName = (role: string) => {
    switch (role) {
      case CompanyUserRole.ADMIN:
        return 'Administrator';
      case CompanyUserRole.MANAGER:
        return 'Manager';
      case CompanyUserRole.TEAM_LEAD:
        return 'Team Lead';
      case CompanyUserRole.INVENTORY_MANAGER:
        return 'Manager Inventar';
      case CompanyUserRole.WORKER:
        return 'Angajat';
      case CompanyUserRole.VIEWER:
        return 'Vizualizator';
      default:
        return role;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!canManageUsers || !company) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/companies')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-gray-500">Gestionare Utilizatori</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Caută utilizatori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invită Utilizator
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Utilizatori</CardTitle>
          <CardDescription>
            Gestionați utilizatorii și permisiunile lor în cadrul companiei.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nu s-au găsit utilizatori</h2>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Nu s-au găsit utilizatori care să corespundă criteriilor de căutare.'
                  : 'Nu există utilizatori în această companie. Invitați utilizatori folosind butonul de mai sus.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizator</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.user?.display_name || 'N/A'}
                    </TableCell>
                    <TableCell>{user.user?.email || 'N/A'}</TableCell>
                    <TableCell>{getRoleName(user.role)}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editează</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Șterge</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pentru adăugare/editare utilizator */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editează Utilizator' : 'Invită Utilizator'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Modificați rolul și permisiunile utilizatorului în cadrul companiei.' 
                : 'Invitați un utilizator nou în companie prin email.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEditMode}
                placeholder="utilizator@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={role} onValueChange={(value) => setRole(value as CompanyUserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CompanyUserRole.ADMIN}>Administrator</SelectItem>
                  <SelectItem value={CompanyUserRole.MANAGER}>Manager</SelectItem>
                  <SelectItem value={CompanyUserRole.TEAM_LEAD}>Team Lead</SelectItem>
                  <SelectItem value={CompanyUserRole.INVENTORY_MANAGER}>Manager Inventar</SelectItem>
                  <SelectItem value={CompanyUserRole.WORKER}>Angajat</SelectItem>
                  <SelectItem value={CompanyUserRole.VIEWER}>Vizualizator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-admin"
                checked={isAdmin}
                onCheckedChange={setIsAdmin}
              />
              <Label htmlFor="is-admin">Administrator de Companie</Label>
            </div>
            
            <p className="text-sm text-gray-500">
              Administratorii de companie pot gestiona toți utilizatorii și setările companiei.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anulează
            </Button>
            <Button 
              onClick={isEditMode ? handleUpdateUser : handleInviteUser}
              disabled={submitting}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : isEditMode ? (
                <Edit className="h-4 w-4 mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? 'Salvează Modificările' : 'Trimite Invitație'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyUsersPage;
