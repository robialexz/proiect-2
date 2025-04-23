import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/lib/company-service';
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
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  UserPlus, 
  Trash, 
  Shield,
  User,
  Building,
  Settings
} from 'lucide-react';

interface SiteAdmin {
  id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

const SiteAdminPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [admins, setAdmins] = useState<SiteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  
  // State pentru dialogul de adăugare admin
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Verificăm dacă utilizatorul este admin de site
  useEffect(() => {
    const checkSiteAdmin = async () => {
      if (user) {
        try {
          setLoading(true);
          const isAdmin = await companyService.isSiteAdmin(user.id);
          setIsSiteAdmin(isAdmin);
          
          if (!isAdmin) {
            toast({
              title: 'Acces restricționat',
              description: 'Nu aveți permisiunea de a accesa această pagină.',
              variant: 'destructive'
            });
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Eroare la verificarea rolului de admin:', error);
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
    
    checkSiteAdmin();
  }, [user, navigate, toast]);
  
  // Încărcăm administratorii de site
  useEffect(() => {
    const loadAdmins = async () => {
      if (isSiteAdmin) {
        try {
          setLoading(true);
          
          // Aici ar trebui să avem o funcție pentru a obține toți administratorii de site
          // Deocamdată, vom folosi o implementare simplificată
          const { data, error } = await supabase
            .from('site_admins')
            .select('*, user:profiles(id, email, display_name)');
          
          if (error) throw error;
          
          setAdmins(data || []);
        } catch (error) {
          console.error('Eroare la încărcarea administratorilor:', error);
          toast({
            title: 'Eroare',
            description: 'A apărut o eroare la încărcarea administratorilor.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadAdmins();
  }, [isSiteAdmin, toast]);
  
  // Filtrăm administratorii după termen de căutare
  const filteredAdmins = admins.filter(admin => {
    const userEmail = admin.user?.email || '';
    const userName = admin.user?.display_name || '';
    
    return userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Funcție pentru a deschide dialogul de adăugare admin
  const handleAddAdmin = () => {
    setEmail('');
    setIsDialogOpen(true);
  };
  
  // Funcție pentru a adăuga un admin de site
  const handleAddSiteAdmin = async () => {
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
      
      // Obținem utilizatorul după email
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        toast({
          title: 'Eroare',
          description: 'Utilizatorul nu a fost găsit.',
          variant: 'destructive'
        });
        return;
      }
      
      const userId = users.id;
      
      // Adăugăm utilizatorul ca admin de site
      await companyService.addSiteAdmin(userId);
      
      toast({
        title: 'Succes',
        description: 'Administratorul a fost adăugat cu succes.',
      });
      
      setIsDialogOpen(false);
      
      // Reîncărcăm lista de administratori
      const { data, error } = await supabase
        .from('site_admins')
        .select('*, user:profiles(id, email, display_name)');
      
      if (error) throw error;
      
      setAdmins(data || []);
    } catch (error) {
      console.error('Eroare la adăugarea administratorului:', error);
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la adăugarea administratorului.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Funcție pentru a șterge un admin de site
  const handleDeleteAdmin = async (userId: string) => {
    // Verificăm dacă este ultimul admin
    if (admins.length <= 1) {
      toast({
        title: 'Eroare',
        description: 'Nu puteți șterge ultimul administrator de site.',
        variant: 'destructive'
      });
      return;
    }
    
    // Verificăm dacă utilizatorul încearcă să se șteargă pe sine
    if (userId === user?.id) {
      toast({
        title: 'Eroare',
        description: 'Nu vă puteți șterge propriul cont de administrator.',
        variant: 'destructive'
      });
      return;
    }
    
    if (window.confirm('Sigur doriți să eliminați acest administrator? Această acțiune nu poate fi anulată.')) {
      try {
        await companyService.removeSiteAdmin(userId);
        
        toast({
          title: 'Succes',
          description: 'Administratorul a fost eliminat cu succes.',
        });
        
        // Actualizăm lista de administratori
        setAdmins(admins.filter(admin => admin.user_id !== userId));
      } catch (error) {
        console.error('Eroare la eliminarea administratorului:', error);
        toast({
          title: 'Eroare',
          description: 'A apărut o eroare la eliminarea administratorului.',
          variant: 'destructive'
        });
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isSiteAdmin) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Administrare Site</h1>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/companies')}>
            <Building className="h-4 w-4 mr-2" />
            Gestionare Companii
          </Button>
          
          <Button variant="outline" onClick={() => navigate('/site-settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Setări Site
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Companii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{/* Numărul de companii */}</div>
            <p className="text-sm text-gray-500">Companii înregistrate în sistem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Utilizatori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{/* Numărul de utilizatori */}</div>
            <p className="text-sm text-gray-500">Utilizatori înregistrați în sistem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Administratori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{admins.length}</div>
            <p className="text-sm text-gray-500">Administratori de site</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Caută administratori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleAddAdmin}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adaugă Administrator
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Administratori de Site</CardTitle>
          <CardDescription>
            Gestionați administratorii de site care au acces complet la toate funcționalitățile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nu s-au găsit administratori</h2>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Nu s-au găsit administratori care să corespundă criteriilor de căutare.'
                  : 'Nu există administratori în sistem. Adăugați administratori folosind butonul de mai sus.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizator</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data adăugării</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-primary mr-2" />
                        {admin.user?.display_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{admin.user?.email || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAdmin(admin.user_id)}
                        disabled={admin.user_id === user?.id || admins.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Șterge</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pentru adăugare admin */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Administrator de Site</DialogTitle>
            <DialogDescription>
              Adăugați un utilizator existent ca administrator de site. Administratorii de site au acces complet la toate funcționalitățile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Utilizator</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilizator@example.com"
              />
              <p className="text-sm text-gray-500">
                Utilizatorul trebuie să existe deja în sistem.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anulează
            </Button>
            <Button 
              onClick={handleAddSiteAdmin}
              disabled={submitting}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Adaugă Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteAdminPage;
