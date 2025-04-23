import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/lib/company-service';
import { Company, CompanyStatus } from '@/models/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Users, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const CompanyManagementPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | ''>('');
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  
  // Verificăm dacă utilizatorul este admin de site
  useEffect(() => {
    const checkSiteAdmin = async () => {
      if (user) {
        try {
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
        }
      }
    };
    
    checkSiteAdmin();
  }, [user, navigate, toast]);
  
  // Încărcăm companiile
  useEffect(() => {
    const loadCompanies = async () => {
      if (isSiteAdmin) {
        try {
          setLoading(true);
          const response = await companyService.getAllCompanies();
          setCompanies(response.data);
        } catch (error) {
          console.error('Eroare la încărcarea companiilor:', error);
          toast({
            title: 'Eroare',
            description: 'A apărut o eroare la încărcarea companiilor.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadCompanies();
  }, [isSiteAdmin, toast]);
  
  // Filtrăm companiile după termen de căutare și status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? company.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Funcție pentru a adăuga o companie nouă
  const handleAddCompany = () => {
    navigate('/companies/add');
  };
  
  // Funcție pentru a edita o companie
  const handleEditCompany = (id: string) => {
    navigate(`/companies/edit/${id}`);
  };
  
  // Funcție pentru a șterge o companie
  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Sigur doriți să ștergeți această companie? Această acțiune nu poate fi anulată.')) {
      try {
        await companyService.deleteCompany(id);
        setCompanies(companies.filter(company => company.id !== id));
        toast({
          title: 'Succes',
          description: 'Compania a fost ștearsă cu succes.',
        });
      } catch (error) {
        console.error('Eroare la ștergerea companiei:', error);
        toast({
          title: 'Eroare',
          description: 'A apărut o eroare la ștergerea companiei.',
          variant: 'destructive'
        });
      }
    }
  };
  
  // Funcție pentru a gestiona utilizatorii unei companii
  const handleManageUsers = (id: string) => {
    navigate(`/companies/${id}/users`);
  };
  
  // Funcție pentru a gestiona setările unei companii
  const handleManageSettings = (id: string) => {
    navigate(`/companies/${id}/settings`);
  };
  
  // Funcție pentru a afișa iconița de status
  const renderStatusIcon = (status: CompanyStatus) => {
    switch (status) {
      case CompanyStatus.ACTIVE:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case CompanyStatus.INACTIVE:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case CompanyStatus.PENDING:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case CompanyStatus.SUSPENDED:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case CompanyStatus.TRIAL:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  if (!isSiteAdmin) {
    return null; // Nu afișăm nimic dacă utilizatorul nu este admin de site
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administrare Companii</h1>
        <Button onClick={handleAddCompany}>
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Companie
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Caută companii..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CompanyStatus | '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrează după status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate</SelectItem>
              <SelectItem value={CompanyStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={CompanyStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={CompanyStatus.PENDING}>În așteptare</SelectItem>
              <SelectItem value={CompanyStatus.SUSPENDED}>Suspendate</SelectItem>
              <SelectItem value={CompanyStatus.TRIAL}>Trial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nu s-au găsit companii</h2>
          <p className="text-gray-500">
            {searchTerm || statusFilter
              ? 'Nu s-au găsit companii care să corespundă criteriilor de căutare.'
              : 'Nu există companii în sistem. Adăugați prima companie folosind butonul de mai sus.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-10 w-10 rounded-md mr-3 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md mr-3 bg-primary/10 flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        {renderStatusIcon(company.status as CompanyStatus)}
                        <span className="text-sm text-gray-500 ml-1 capitalize">
                          {company.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {company.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{company.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleManageUsers(company.id)}>
                    <Users className="h-4 w-4 mr-1" />
                    Utilizatori
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleManageSettings(company.id)}>
                    <Settings className="h-4 w-4 mr-1" />
                    Setări
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditCompany(company.id)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editează
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteCompany(company.id)}>
                    <Trash className="h-4 w-4 mr-1" />
                    Șterge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;
