import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/services/api/supabase-client";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { PermissionGuard } from "@/components/auth";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Wifi,
  Clock,
  HardDrive,
  Activity,
  BarChart3,
  Shield,
} from "lucide-react";

// Tipuri pentru starea sistemului
interface SystemHealth {
  database: {
    status: "healthy" | "degraded" | "error";
    responseTime: number;
    message?: string;
  };
  api: {
    status: "healthy" | "degraded" | "error";
    responseTime: number;
    message?: string;
  };
  storage: {
    status: "healthy" | "degraded" | "error";
    usage: number;
    total: number;
    message?: string;
  };
  auth: {
    status: "healthy" | "degraded" | "error";
    message?: string;
  };
  lastChecked: Date;
}

// Componenta pentru monitorizarea stării sistemului
const SystemHealthMonitor: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { canAccess } = usePermissionCheck();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funcție pentru verificarea stării sistemului
  const checkSystemHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificăm starea bazei de date
      const dbStartTime = performance.now();
      const { data: dbData, error: dbError } = await supabase
        .from("health_check")
        .select("*")
        .limit(1);
      const dbResponseTime = performance.now() - dbStartTime;

      // Verificăm starea API-ului
      const apiStartTime = performance.now();
      const { data: apiData, error: apiError } = await supabase.rpc(
        "check_api_health"
      );
      const apiResponseTime = performance.now() - apiStartTime;

      // Verificăm starea storage-ului
      const { data: storageData, error: storageError } = await supabase.storage
        .getBucket("public");

      // Verificăm starea autentificării
      const { data: authData, error: authError } = await supabase.auth.getSession();

      // Construim obiectul cu starea sistemului
      const systemHealth: SystemHealth = {
        database: {
          status: dbError ? "error" : dbResponseTime > 1000 ? "degraded" : "healthy",
          responseTime: dbResponseTime,
          message: dbError ? dbError.message : undefined,
        },
        api: {
          status: apiError ? "error" : apiResponseTime > 1000 ? "degraded" : "healthy",
          responseTime: apiResponseTime,
          message: apiError ? apiError.message : undefined,
        },
        storage: {
          status: storageError ? "error" : "healthy",
          usage: 0,
          total: 100,
          message: storageError ? storageError.message : undefined,
        },
        auth: {
          status: authError ? "error" : "healthy",
          message: authError ? authError.message : undefined,
        },
        lastChecked: new Date(),
      };

      setHealth(systemHealth);

      // Afișăm un toast cu rezultatul verificării
      const overallStatus = getOverallStatus(systemHealth);
      toast({
        title: t("systemHealth.checkComplete", "Verificare completă"),
        description: t(
          `systemHealth.${overallStatus}Status`,
          `Sistemul este ${
            overallStatus === "healthy"
              ? "sănătos"
              : overallStatus === "degraded"
              ? "degradat"
              : "în stare de eroare"
          }`
        ),
        variant: overallStatus === "healthy" ? "default" : "destructive",
      });
    } catch (err: any) {
      console.error("Error checking system health:", err);
      setError(err.message || "An error occurred while checking system health");
      toast({
        title: t("systemHealth.checkError", "Eroare la verificare"),
        description: t(
          "systemHealth.checkErrorDescription",
          "A apărut o eroare la verificarea stării sistemului."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru a obține starea generală a sistemului
  const getOverallStatus = (health: SystemHealth): "healthy" | "degraded" | "error" => {
    if (
      health.database.status === "error" ||
      health.api.status === "error" ||
      health.storage.status === "error" ||
      health.auth.status === "error"
    ) {
      return "error";
    }

    if (
      health.database.status === "degraded" ||
      health.api.status === "degraded" ||
      health.storage.status === "degraded" ||
      health.auth.status === "degraded"
    ) {
      return "degraded";
    }

    return "healthy";
  };

  // Funcție pentru a obține culoarea pentru o stare
  const getStatusColor = (status: "healthy" | "degraded" | "error"): string => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "degraded":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Funcție pentru a obține iconul pentru o stare
  const getStatusIcon = (status: "healthy" | "degraded" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Verificăm starea sistemului la încărcarea componentei
  useEffect(() => {
    checkSystemHealth();
  }, []);

  // Dacă utilizatorul nu are acces, afișăm un mesaj
  if (!canAccess(["admin"], ["view_system_health"])) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            {t("systemHealth.title", "Monitorizare stare sistem")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {t("systemHealth.accessDenied", "Acces interzis")}
            </AlertTitle>
            <AlertDescription>
              {t(
                "systemHealth.accessDeniedDescription",
                "Nu aveți permisiunea necesară pentru a accesa această funcționalitate."
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              {t("systemHealth.title", "Monitorizare stare sistem")}
            </CardTitle>
            <CardDescription>
              {t(
                "systemHealth.description",
                "Verifică starea componentelor sistemului și identifică probleme potențiale"
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemHealth}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t("systemHealth.checking", "Se verifică...")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("systemHealth.check", "Verifică acum")}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>
              {t("systemHealth.error", "Eroare la verificare")}
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : health ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(getOverallStatus(health))}
                >
                  {getStatusIcon(getOverallStatus(health))}
                  <span className="ml-1">
                    {t(
                      `systemHealth.${getOverallStatus(health)}Status`,
                      getOverallStatus(health) === "healthy"
                        ? "Sistem sănătos"
                        : getOverallStatus(health) === "degraded"
                        ? "Sistem degradat"
                        : "Sistem în eroare"
                    )}
                  </span>
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("systemHealth.lastChecked", "Ultima verificare")}: {health.lastChecked.toLocaleString()}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Starea bazei de date */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Database className="h-4 w-4 mr-2 text-primary" />
                    {t("systemHealth.database", "Bază de date")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(health.database.status)}
                    >
                      {getStatusIcon(health.database.status)}
                      <span className="ml-1">
                        {t(
                          `systemHealth.${health.database.status}`,
                          health.database.status === "healthy"
                            ? "Sănătos"
                            : health.database.status === "degraded"
                            ? "Degradat"
                            : "Eroare"
                        )}
                      </span>
                    </Badge>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>
                        {health.database.responseTime.toFixed(0)} ms
                      </span>
                    </div>
                  </div>
                  {health.database.message && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {health.database.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Starea API-ului */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Server className="h-4 w-4 mr-2 text-primary" />
                    {t("systemHealth.api", "API")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(health.api.status)}
                    >
                      {getStatusIcon(health.api.status)}
                      <span className="ml-1">
                        {t(
                          `systemHealth.${health.api.status}`,
                          health.api.status === "healthy"
                            ? "Sănătos"
                            : health.api.status === "degraded"
                            ? "Degradat"
                            : "Eroare"
                        )}
                      </span>
                    </Badge>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>
                        {health.api.responseTime.toFixed(0)} ms
                      </span>
                    </div>
                  </div>
                  {health.api.message && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {health.api.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Starea storage-ului */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <HardDrive className="h-4 w-4 mr-2 text-primary" />
                    {t("systemHealth.storage", "Storage")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(health.storage.status)}
                    >
                      {getStatusIcon(health.storage.status)}
                      <span className="ml-1">
                        {t(
                          `systemHealth.${health.storage.status}`,
                          health.storage.status === "healthy"
                            ? "Sănătos"
                            : health.storage.status === "degraded"
                            ? "Degradat"
                            : "Eroare"
                        )}
                      </span>
                    </Badge>
                    <div className="flex items-center text-sm">
                      <BarChart3 className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>
                        {health.storage.usage} / {health.storage.total} MB
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(health.storage.usage / health.storage.total) * 100}
                    className="h-2 mt-2"
                  />
                  {health.storage.message && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {health.storage.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Starea autentificării */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    {t("systemHealth.auth", "Autentificare")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(health.auth.status)}
                    >
                      {getStatusIcon(health.auth.status)}
                      <span className="ml-1">
                        {t(
                          `systemHealth.${health.auth.status}`,
                          health.auth.status === "healthy"
                            ? "Sănătos"
                            : health.auth.status === "degraded"
                            ? "Degradat"
                            : "Eroare"
                        )}
                      </span>
                    </Badge>
                  </div>
                  {health.auth.message && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {health.auth.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">
                {t("systemHealth.loading", "Se verifică starea sistemului...")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <PermissionGuard
          allowedRoles={["admin"]}
          requiredPermissions={["manage_system"]}
        >
          <div className="flex justify-between items-center w-full">
            <p className="text-sm text-muted-foreground">
              {t(
                "systemHealth.adminNote",
                "Notă: Verificările de stare sunt înregistrate în jurnalul de audit."
              )}
            </p>
            <Button variant="outline" size="sm">
              <Wifi className="h-4 w-4 mr-2" />
              {t("systemHealth.advancedDiagnostics", "Diagnosticare avansată")}
            </Button>
          </div>
        </PermissionGuard>
      </CardFooter>
    </Card>
  );
};

export default SystemHealthMonitor;
