import React from "react";
import { useTranslation } from "react-i18next";
import { useTauri } from "@/hooks/useTauri";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Laptop, Globe, FileText, FolderOpen } from "lucide-react";

/**
 * Componentă pentru a afișa informații despre mediul de execuție
 * și a demonstra funcționalitățile Tauri
 */
export function DesktopInfo() {
  const {
    isDesktop,
    systemInfo,
    isLoading,
    openFileDialog,
    openDirectory,
    openInBrowser,
  } = useTauri();
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const [selectedDirectory, setSelectedDirectory] = React.useState<
    string | null
  >(null);

  const handleOpenFile = async () => {
    try {
      const file = await openFileDialog({
        filters: [
          { name: "Text", extensions: ["txt", "md"] },
          { name: "Images", extensions: ["png", "jpg", "jpeg"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (file) {
        setSelectedFile(Array.isArray(file) ? file[0] : file);
      }
    } catch (error) {
      // Removed console statement
    }
  };

  const handleOpenDirectory = async () => {
    try {
      const directory = await openDirectory();

      if (directory) {
        setSelectedDirectory(directory);
      }
    } catch (error) {
      // Removed console statement
    }
  };

  const handleOpenDocs = () => {
    openInBrowser("{process.env.TAURI_APP_DOCS_}");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDesktop ? (
            <>
              <Laptop className="h-5 w-5" />
              <span>{t("desktop.title")}</span>
            </>
          ) : (
            <>
              <Globe className="h-5 w-5" />
              <span>{t("desktop.webDescription")}</span>
            </>
          )}
          <Badge variant={isDesktop ? "default" : "outline"} className="ml-2">
            {isDesktop ? "Tauri" : "Browser"}
          </Badge>
        </CardTitle>
        <CardDescription>{t("desktop.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">{t("desktop.systemInfo")}</h3>
              <p className="text-sm">{systemInfo}</p>
            </div>

            {isDesktop && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">
                    {t("desktop.fileAccess")}
                  </h3>
                  {selectedFile ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{selectedFile}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("desktop.noFileSelected")}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">
                    {t("desktop.directoryAccess")}
                  </h3>
                  {selectedDirectory ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FolderOpen className="h-4 w-4" />
                      <span className="truncate">{selectedDirectory}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("desktop.noDirectorySelected")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {isDesktop && (
          <>
            <Button variant="outline" onClick={handleOpenFile}>
              <FileText className="h-4 w-4 mr-2" />
              {t("desktop.openFile")}
            </Button>
            <Button variant="outline" onClick={handleOpenDirectory}>
              <FolderOpen className="h-4 w-4 mr-2" />
              {t("desktop.openDirectory")}
            </Button>
          </>
        )}
        <Button variant="default" onClick={handleOpenDocs}>
          {t("desktop.tauriDocumentation")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default DesktopInfo;
