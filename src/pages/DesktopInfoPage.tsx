import React from "react";
import { Helmet } from "react-helmet-async";
import DesktopInfo from "@/components/desktop/DesktopInfo";
import { useTauri } from "@/hooks/useTauri";
import { useTranslation } from "react-i18next";

/**
 * Pagină pentru a afișa informații despre aplicația desktop
 * și a demonstra funcționalitățile Tauri
 */
const DesktopInfoPage: React.FC = () => {
  const { isDesktop } = useTauri();
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("desktop.title")} | BuildX</title>
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t("desktop.title")}</h1>

          <div className="mb-8">
            <p className="text-lg mb-4">
              {isDesktop
                ? t("desktop.description")
                : t("desktop.webDescription")}
            </p>

            <p className="mb-4">{t("desktop.tauriDescription")}</p>

            {!isDesktop && (
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg mb-6">
                <h3 className="font-medium mb-2">
                  {t("desktop.downloadInfo")}
                </h3>
                <p>{t("desktop.downloadDescription")}</p>
              </div>
            )}
          </div>

          <DesktopInfo />

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              {t("desktop.features.title")}
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>{t("desktop.features.fileSystem")}</li>
              <li>{t("desktop.features.performance")}</li>
              <li>{t("desktop.features.offline")}</li>
              <li>{t("desktop.features.integration")}</li>
              <li>{t("desktop.features.updates")}</li>
              <li>{t("desktop.features.windowControls")}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopInfoPage;
