import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function DatabaseChecker() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    profiles?: { status: 'ok' | 'error'; message?: string };
    projects?: { status: 'ok' | 'error'; message?: string };
    materials?: { status: 'ok' | 'error'; message?: string };
  }>({});

  const checkDatabase = async () => {
    setLoading(true);
    const newResults: typeof results = {};

    try {
      // Check if profiles table exists
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      newResults.profiles = profilesError 
        ? { status: 'error', message: profilesError.message } 
        : { status: 'ok' };
      
      // Check if projects table exists
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      newResults.projects = projectsError 
        ? { status: 'error', message: projectsError.message } 
        : { status: 'ok' };
      
      // Check if materials table exists
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .limit(1);
      
      newResults.materials = materialsError 
        ? { status: 'error', message: materialsError.message } 
        : { status: 'ok' };
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      setResults(newResults);
      setLoading(false);
    }
  };

  // Create tables if they don't exist
  const createTables = async () => {
    setLoading(true);
    
    try {
      // Create projects table if it doesn't exist
      if (results.projects?.status === 'error') {
        const { error: createProjectsError } = await supabase.rpc('create_projects_table');
        if (createProjectsError) console.error('Error creating projects table:', createProjectsError);
      }
      
      // Create materials table if it doesn't exist
      if (results.materials?.status === 'error') {
        const { error: createMaterialsError } = await supabase.rpc('create_materials_table');
        if (createMaterialsError) console.error('Error creating materials table:', createMaterialsError);
      }
      
      // Check database again after creating tables
      await checkDatabase();
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
        <CardDescription>Check if all required database tables exist</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(results).map(([table, result]) => (
          <Alert key={table} variant={result?.status === 'ok' ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {result?.status === 'ok' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle className="capitalize">{table}</AlertTitle>
            </div>
            {result?.message && (
              <AlertDescription className="mt-2">{result.message}</AlertDescription>
            )}
          </Alert>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={checkDatabase} disabled={loading} variant="outline">
          Refresh
        </Button>
        <Button onClick={createTables} disabled={loading}>
          Fix Database
        </Button>
      </CardFooter>
    </Card>
  );
}
