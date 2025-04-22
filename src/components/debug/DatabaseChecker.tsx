import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DatabaseChecker: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    profiles?: { status: "ok" | "error"; message?: string };
    projects?: { status: "ok" | "error"; message?: string };
    materials?: { status: "ok" | "error"; message?: string };
  }>({});

  const checkDatabase = async () => {
    setLoading(true);
    const newResults: typeof results = {};

    try {
      // Check if profiles table exists
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

      newResults.profiles = profilesError
        ? { status: "error", message: profilesError.message }
        : { status: "ok" };

      // Check if projects table exists
      try {
      const { data: projectsData, error: projectsError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
        .from("projects")
        .select("*")
        .limit(1);

      newResults.projects = projectsError
        ? { status: "error", message: projectsError.message }
        : { status: "ok" };

      // Check if materials table exists
      try {
      const { data: materialsData, error: materialsError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
        .from("materials")
        .select("*")
        .limit(1);

      newResults.materials = materialsError
        ? { status: "error", message: materialsError.message }
        : { status: "ok" };
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("debug.checkFailed", "Verificare eșuată"),
        description:
          error instanceof Error
            ? error.message
            : t("debug.unknownError", "Eroare necunoscută"),
      });
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
      if (results.projects?.status === "error") {
        const { error: createProjectsError } = await supabase.rpc(
          "create_projects_table"
        );
        if (createProjectsError)
          // Removed console statement
      }

      // Create materials table if it doesn't exist
      if (results.materials?.status === "error") {
        try {
        const { error: createMaterialsError } = await supabase.rpc(
        } catch (error) {
          // Handle error appropriately
        }
          "create_materials_table"
        );
        if (createMaterialsError)
          // Removed console statement
      }

      // Check database again after creating tables
      try {
      await checkDatabase();
      } catch (error) {
        // Handle error appropriately
      }

      toast({
        title: t("debug.fixSuccess", "Reparare reușită"),
        description: t(
          "debug.tablesCreated",
          "Tabelele lipsă au fost create cu succes"
        ),
      });
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("debug.fixFailed", "Reparare eșuată"),
        description:
          error instanceof Error
            ? error.message
            : t("debug.unknownError", "Eroare necunoscută"),
      });
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
        <CardTitle>{t("debug.databaseStatus", "Stare Bază de Date")}</CardTitle>
        <CardDescription>
          {t(
            "debug.checkTables",
            "Verifică dacă toate tabelele necesare există"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(results).map(([table, result]) => (
          <Alert
            key={table}
            variant={result?.status === "ok" ? "default" : "destructive"}
          >
            <div className="flex items-center gap-2">
              {result?.status === "ok" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle className="capitalize">{table}</AlertTitle>
            </div>
            {result?.message && (
              <AlertDescription className="mt-2">
                {result.message}
              </AlertDescription>
            )}
          </Alert>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={checkDatabase} disabled={loading} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("debug.refresh", "Reîmprospătare")}
        </Button>
        <Button onClick={createTables} disabled={loading}>
          <Database className="h-4 w-4 mr-2" />
          {t("debug.fixDatabase", "Reparare Bază de Date")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseChecker;
