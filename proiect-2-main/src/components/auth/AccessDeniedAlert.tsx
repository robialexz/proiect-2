import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessDeniedAlertProps {
  title?: string;
  description?: string;
  showNavigateButton?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline";
}

/**
 * Componentă pentru afișarea unei alerte de acces interzis
 * @param title Titlul alertei
 * @param description Descrierea alertei
 * @param showNavigateButton Dacă se afișează butonul de navigare către pagina de acces interzis
 * @param className Clase CSS suplimentare
 * @param variant Varianta alertei
 */
const AccessDeniedAlert: React.FC<AccessDeniedAlertProps> = ({
  title,
  description,
  showNavigateButton = true,
  className,
  variant = "destructive",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Alert variant={variant} className={cn("border-red-200", className)}>
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>
        {title || t("accessDenied.alertTitle", "Acces interzis")}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          {description ||
            t(
              "accessDenied.alertDescription",
              "Nu aveți permisiunea necesară pentru a accesa această funcționalitate."
            )}
        </p>
        {showNavigateButton && (
          <Button
            variant="outline"
            size="sm"
            className="w-fit mt-2"
            onClick={() => navigate("/access-denied")}
          >
            <Lock className="h-3 w-3 mr-2" />
            {t("accessDenied.moreInfo", "Mai multe informații")}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default AccessDeniedAlert;
