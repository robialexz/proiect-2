import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { AnimatedContainer, AnimatedText } from "@/components/ui/animated-container";
import { useAuth } from "@/contexts/AuthContext";

const AccessDeniedPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();

  // Obținem pagina de la care a fost redirecționat utilizatorul
  const from = location.state?.from?.pathname || "/";

  // Funcție pentru a naviga înapoi
  const goBack = () => {
    navigate(-1);
  };

  // Funcție pentru a naviga la pagina principală
  const goHome = () => {
    navigate("/");
  };

  return (
    <>
      <Helmet>
        <title>{t("accessDenied.pageTitle", "Acces interzis")}</title>
      </Helmet>

      <div className="container mx-auto py-12 flex items-center justify-center min-h-[80vh]">
        <AnimatedContainer animation="fadeIn" className="max-w-md w-full">
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                {t("accessDenied.title", "Acces interzis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <AnimatedText
                text={t(
                  "accessDenied.description",
                  "Nu aveți permisiunea necesară pentru a accesa această pagină."
                )}
                className="text-muted-foreground mb-4"
              />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium mb-1">
                      {t("accessDenied.info", "Informație")}
                    </p>
                    <p className="text-sm text-amber-700">
                      {t(
                        "accessDenied.roleInfo",
                        "Rolul dumneavoastră actual este: "
                      )}
                      <span className="font-medium">{userRole || "Necunoscut"}</span>
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {t(
                        "accessDenied.pageInfo",
                        "Ați încercat să accesați: "
                      )}
                      <span className="font-medium">{from}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t(
                    "accessDenied.contactInfo",
                    "Dacă credeți că ar trebui să aveți acces la această pagină, vă rugăm să contactați administratorul sistemului."
                  )}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("accessDenied.goBack", "Înapoi")}
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={goHome}
              >
                <Home className="h-4 w-4 mr-2" />
                {t("accessDenied.goHome", "Pagina principală")}
              </Button>
            </CardFooter>
          </Card>
        </AnimatedContainer>
      </div>
    </>
  );
};

export default AccessDeniedPage;
