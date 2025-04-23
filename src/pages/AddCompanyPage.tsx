import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/lib/company-service';
import { CompanyStatus } from '@/models/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Building, Save } from 'lucide-react';

const AddCompanyPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // State pentru datele companiei
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [status, setStatus] = useState<CompanyStatus>(CompanyStatus.ACTIVE);
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  
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
  
  // Funcție pentru a adăuga o companie nouă
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: 'Eroare',
        description: 'Numele companiei este obligatoriu.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const newCompany = {
        name,
        description,
        logo_url: logoUrl,
        website,
        email,
        phone,
        address,
        city,
        country,
        postal_code: postalCode,
        tax_id: taxId,
        registration_number: registrationNumber,
        status,
        subscription_plan: subscriptionPlan
      };
      
      await companyService.createCompany(newCompany);
      
      toast({
        title: 'Succes',
        description: 'Compania a fost adăugată cu succes.',
      });
      
      navigate('/companies');
    } catch (error) {
      console.error('Eroare la adăugarea companiei:', error);
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la adăugarea companiei.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
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
    return null; // Nu afișăm nimic dacă utilizatorul nu este admin de site
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/companies')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi
        </Button>
        <h1 className="text-3xl font-bold">Adaugă Companie Nouă</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informații Companie</CardTitle>
          <CardDescription>
            Completați informațiile despre noua companie. Câmpurile marcate cu * sunt obligatorii.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informații de bază */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nume Companie *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="logoUrl">URL Logo</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+40 123 456 789"
                  />
                </div>
              </div>
              
              {/* Informații suplimentare */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresă</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Oraș</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postalCode">Cod Poștal</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country">Țară</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="România"
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxId">CUI / Cod Fiscal</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="registrationNumber">Număr Înregistrare</Label>
                  <Input
                    id="registrationNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as CompanyStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CompanyStatus.ACTIVE}>Activ</SelectItem>
                      <SelectItem value={CompanyStatus.INACTIVE}>Inactiv</SelectItem>
                      <SelectItem value={CompanyStatus.PENDING}>În așteptare</SelectItem>
                      <SelectItem value={CompanyStatus.SUSPENDED}>Suspendat</SelectItem>
                      <SelectItem value={CompanyStatus.TRIAL}>Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subscriptionPlan">Plan Abonament</Label>
                  <Input
                    id="subscriptionPlan"
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    placeholder="Basic, Premium, Enterprise"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvează Compania
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCompanyPage;
