import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw, Database, Trash2, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

/**
 * Componentă pentru gestionarea bazei de date
 * Permite resetarea, popularea și verificarea bazei de date
 */
const DatabaseManager: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { status: 'ok' | 'error'; message?: string }>>({});

  // Verifică starea bazei de date
  const checkDatabase = async () => {
    setLoading('check');
    const newResults: typeof results = {};

    try {
      // Verificăm tabela profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      newResults.profiles = profilesError 
        ? { status: 'error', message: profilesError.message } 
        : { status: 'ok' };
      
      // Verificăm tabela projects
      try {
      const { data: projectsData, error: projectsError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
        .from('projects')
        .select('*')
        .limit(1);
      
      newResults.projects = projectsError 
        ? { status: 'error', message: projectsError.message } 
        : { status: 'ok' };
      
      // Verificăm tabela materials
      try {
      const { data: materialsData, error: materialsError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
        .from('materials')
        .select('*')
        .limit(1);
      
      newResults.materials = materialsError 
        ? { status: 'error', message: materialsError.message } 
        : { status: 'ok' };

      toast({
        title: t('debug.databaseChecked', 'Baza de date verificată'),
        description: t('debug.databaseStatus', 'Starea bazei de date a fost actualizată'),
      });
    } catch (error) {
      // Removed console statement
      toast({
        variant: 'destructive',
        title: t('debug.checkFailed', 'Verificare eșuată'),
        description: error instanceof Error ? error.message : t('debug.unknownError', 'Eroare necunoscută'),
      });
    } finally {
      setResults(newResults);
      setLoading(null);
    }
  };

  // Resetează baza de date
  const resetDatabase = async () => {
    if (!confirm(t('debug.confirmReset', 'Sigur doriți să resetați baza de date? Toate datele vor fi șterse.'))) {
      return;
    }

    setLoading('reset');
    try {
      // Apelăm funcția RPC pentru a reseta baza de date
      const { error } = await supabase.rpc('reset_database');
      
      if (error) {
        throw error;
      }

      toast({
        title: t('debug.databaseReset', 'Baza de date resetată'),
        description: t('debug.resetSuccess', 'Baza de date a fost resetată cu succes'),
      });

      // Verificăm starea bazei de date după resetare
      try {
      await checkDatabase();
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      // Removed console statement
      toast({
        variant: 'destructive',
        title: t('debug.resetFailed', 'Resetare eșuată'),
        description: error instanceof Error ? error.message : t('debug.unknownError', 'Eroare necunoscută'),
      });
    } finally {
      setLoading(null);
    }
  };

  // Populează baza de date cu date de test
  const seedDatabase = async () => {
    setLoading('seed');
    try {
      // Apelăm funcția RPC pentru a popula baza de date
      const { error } = await supabase.rpc('seed_database');
      
      if (error) {
        throw error;
      }

      toast({
        title: t('debug.databaseSeeded', 'Baza de date populată'),
        description: t('debug.seedSuccess', 'Baza de date a fost populată cu date de test'),
      });

      // Verificăm starea bazei de date după populare
      try {
      await checkDatabase();
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      // Removed console statement
      toast({
        variant: 'destructive',
        title: t('debug.seedFailed', 'Populare eșuată'),
        description: error instanceof Error ? error.message : t('debug.unknownError', 'Eroare necunoscută'),
      });
    } finally {
      setLoading(null);
    }
  };

  // Resetează și populează baza de date
  const freshDatabase = async () => {
    if (!confirm(t('debug.confirmFresh', 'Sigur doriți să resetați și să populați baza de date? Toate datele existente vor fi șterse.'))) {
      return;
    }

    setLoading('fresh');
    try {
      // Resetăm baza de date
      const { error: resetError } = await supabase.rpc('reset_database');
      
      if (resetError) {
        throw resetError;
      }

      // Populăm baza de date
      try {
      const { error: seedError } = await supabase.rpc('seed_database');
      } catch (error) {
        // Handle error appropriately
      }
      
      if (seedError) {
        throw seedError;
      }

      toast({
        title: t('debug.databaseFresh', 'Baza de date resetată și populată'),
        description: t('debug.freshSuccess', 'Baza de date a fost resetată și populată cu date de test'),
      });

      // Verificăm starea bazei de date după operațiuni
      try {
      await checkDatabase();
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      // Removed console statement
      toast({
        variant: 'destructive',
        title: t('debug.freshFailed', 'Operațiune eșuată'),
        description: error instanceof Error ? error.message : t('debug.unknownError', 'Eroare necunoscută'),
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{t('debug.databaseManager', 'Manager Bază de Date')}</CardTitle>
        <CardDescription>
          {t('debug.databaseDescription', 'Gestionați baza de date Supabase pentru dezvoltare și testare')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">{t('debug.status', 'Stare')}</TabsTrigger>
            <TabsTrigger value="operations">{t('debug.operations', 'Operațiuni')}</TabsTrigger>
            <TabsTrigger value="help">{t('debug.help', 'Ajutor')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('debug.databaseStatus', 'Starea Bazei de Date')}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkDatabase}
                disabled={loading === 'check'}
              >
                {loading === 'check' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t('debug.refresh', 'Reîmprospătare')}
              </Button>
            </div>
            
            <Separator />
            
            {Object.keys(results).length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('debug.noData', 'Nu există date')}</AlertTitle>
                <AlertDescription>
                  {t('debug.clickRefresh', 'Apăsați pe butonul Reîmprospătare pentru a verifica starea bazei de date')}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {Object.entries(results).map(([table, result]) => (
                  <Alert key={table} variant={result?.status === 'ok' ? 'default' : 'destructive'}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <AlertTitle className="capitalize">{table}</AlertTitle>
                    </div>
                    {result?.message && (
                      <AlertDescription className="mt-2">{result.message}</AlertDescription>
                    )}
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="operations" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">{t('debug.databaseOperations', 'Operațiuni Bază de Date')}</h3>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('debug.resetDatabase', 'Resetare Bază de Date')}</CardTitle>
                  <CardDescription>
                    {t('debug.resetDescription', 'Șterge toate datele din baza de date')}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="destructive" 
                    onClick={resetDatabase}
                    disabled={loading !== null}
                    className="w-full"
                  >
                    {loading === 'reset' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('debug.reset', 'Resetare')}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('debug.seedDatabase', 'Populare Bază de Date')}</CardTitle>
                  <CardDescription>
                    {t('debug.seedDescription', 'Adaugă date de test în baza de date')}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={seedDatabase}
                    disabled={loading !== null}
                    className="w-full"
                  >
                    {loading === 'seed' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Plus className="h-4 w-4 mr-2" />
                    {t('debug.seed', 'Populare')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('debug.freshDatabase', 'Resetare și Populare')}</CardTitle>
                <CardDescription>
                  {t('debug.freshDescription', 'Șterge toate datele și adaugă date de test')}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="default" 
                  onClick={freshDatabase}
                  disabled={loading !== null}
                  className="w-full"
                >
                  {loading === 'fresh' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('debug.fresh', 'Resetare și Populare')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">{t('debug.helpTitle', 'Ajutor și Informații')}</h3>
            <Separator />
            
            <div className="prose prose-sm max-w-none">
              <h4>{t('debug.whatIsThis', 'Ce este acest instrument?')}</h4>
              <p>
                {t('debug.managerDescription', 'Managerul de Bază de Date este un instrument pentru dezvoltatori care permite gestionarea bazei de date Supabase pentru dezvoltare și testare. Puteți verifica starea bazei de date, reseta datele și popula baza de date cu date de test.')}
              </p>
              
              <h4>{t('debug.operations', 'Operațiuni')}</h4>
              <ul>
                <li>
                  <strong>{t('debug.checkDatabase', 'Verificare Bază de Date')}</strong>: {t('debug.checkDescription', 'Verifică dacă tabelele necesare există și sunt accesibile.')}
                </li>
                <li>
                  <strong>{t('debug.resetDatabase', 'Resetare Bază de Date')}</strong>: {t('debug.resetDetailedDescription', 'Șterge toate datele din tabelele existente. Această operațiune nu poate fi anulată.')}
                </li>
                <li>
                  <strong>{t('debug.seedDatabase', 'Populare Bază de Date')}</strong>: {t('debug.seedDetailedDescription', 'Adaugă date de test în baza de date pentru a facilita dezvoltarea și testarea.')}
                </li>
                <li>
                  <strong>{t('debug.freshDatabase', 'Resetare și Populare')}</strong>: {t('debug.freshDetailedDescription', 'Combină operațiunile de resetare și populare într-un singur pas.')}
                </li>
              </ul>
              
              <h4>{t('debug.warning', 'Atenție')}</h4>
              <p>
                {t('debug.warningDescription', 'Acest instrument este destinat doar pentru mediul de dezvoltare. Nu utilizați aceste operațiuni în producție, deoarece vor șterge date reale.')}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DatabaseManager;
