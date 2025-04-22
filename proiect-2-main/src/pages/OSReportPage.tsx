import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { generateOSReport, downloadOSReport, formatOSReport, OSReport } from "@/lib/os-report";

const OSReportPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [report, setReport] = useState<OSReport | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  // Generate report on component mount
  useEffect(() => {
    generateReport();
  }, []);

  // Generate a new OS report
  const generateReport = () => {
    try {
      const newReport = generateOSReport();
      setReport(newReport);
    } catch (error) {
      // Removed console statement
      toast({
        title: "Error",
        description: "Failed to generate OS report",
        variant: "destructive",
      });
    }
  };

  // Download the OS report
  const handleDownload = () => {
    try {
      downloadOSReport();
      toast({
        title: "Success",
        description: "OS report has been downloaded",
      });
    } catch (error) {
      // Removed console statement
      toast({
        title: "Error",
        description: "Failed to download OS report",
        variant: "destructive",
      });
    }
  };

  // Copy report to clipboard
  const copyToClipboard = () => {
    if (!report) return;
    
    try {
      const formattedReport = formatOSReport(report);
      navigator.clipboard.writeText(formattedReport);
      toast({
        title: "Copied",
        description: "OS report has been copied to clipboard",
      });
    } catch (error) {
      // Removed console statement
      toast({
        title: "Error",
        description: "Failed to copy OS report to clipboard",
        variant: "destructive",
      });
    }
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format milliseconds to human-readable format
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  if (!report) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            {t("osReport.loading", "Loading OS Report...")}
          </h1>
          <Button onClick={generateReport}>
            {t("osReport.retry", "Retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("osReport.pageTitle", "OS Report")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("osReport.title", "OS Report")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "osReport.subtitle",
                "System information and environment details"
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateReport} variant="outline">
              {t("osReport.refresh", "Refresh")}
            </Button>
            <Button onClick={copyToClipboard} variant="outline">
              {t("osReport.copy", "Copy to Clipboard")}
            </Button>
            <Button onClick={handleDownload}>
              {t("osReport.download", "Download Report")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("osReport.summary", "Summary")}</CardTitle>
            <CardDescription>
              {t("osReport.generatedAt", "Generated at")}: {new Date(report.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium">{t("osReport.browser", "Browser")}</h3>
                <p className="text-sm text-muted-foreground">{report.browser.appName} {report.browser.appVersion}</p>
                <p className="text-sm">{report.browser.platform}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">{t("osReport.screen", "Screen")}</h3>
                <p className="text-sm text-muted-foreground">{report.screen.width}x{report.screen.height} ({report.screen.pixelDepth} bit)</p>
                <p className="text-sm">{report.screen.orientation.type}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">{t("osReport.network", "Network")}</h3>
                <p className="text-sm text-muted-foreground">{report.network.effectiveType}</p>
                <p className="text-sm">{report.network.downlink} Mbps, {report.network.rtt} ms RTT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="summary">
              {t("osReport.summary", "Summary")}
            </TabsTrigger>
            <TabsTrigger value="browser">
              {t("osReport.browser", "Browser")}
            </TabsTrigger>
            <TabsTrigger value="performance">
              {t("osReport.performance", "Performance")}
            </TabsTrigger>
            <TabsTrigger value="features">
              {t("osReport.features", "Features")}
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>{t("osReport.systemOverview", "System Overview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("osReport.browserInfo", "Browser Information")}</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.userAgent", "User Agent")}:</span>
                        <span className="font-mono text-xs max-w-[300px] truncate" title={report.browser.userAgent}>
                          {report.browser.userAgent}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.platform", "Platform")}:</span>
                        <span>{report.browser.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.language", "Language")}:</span>
                        <span>{report.browser.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.cookiesEnabled", "Cookies")}:</span>
                        <span>{report.browser.cookiesEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("osReport.screenInfo", "Screen Information")}</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.resolution", "Resolution")}:</span>
                        <span>{report.screen.width}x{report.screen.height}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.availableArea", "Available Area")}:</span>
                        <span>{report.screen.availWidth}x{report.screen.availHeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.colorDepth", "Color Depth")}:</span>
                        <span>{report.screen.colorDepth} bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.orientation", "Orientation")}:</span>
                        <span>{report.screen.orientation.type} ({report.screen.orientation.angle}°)</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("osReport.networkInfo", "Network Information")}</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.connectionType", "Connection Type")}:</span>
                        <span>{report.network.effectiveType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.downlink", "Downlink")}:</span>
                        <span>{report.network.downlink} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.rtt", "Round Trip Time")}:</span>
                        <span>{report.network.rtt} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.saveData", "Data Saver")}:</span>
                        <span>{report.network.saveData ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browser Tab */}
          <TabsContent value="browser">
            <Card>
              <CardHeader>
                <CardTitle>{t("osReport.detailedBrowserInfo", "Detailed Browser Information")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("osReport.browserDetails", "Browser Details")}</h3>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.appName", "App Name")}:</span>
                        <span>{report.browser.appName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.appVersion", "App Version")}:</span>
                        <span>{report.browser.appVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.vendor", "Vendor")}:</span>
                        <span>{report.browser.vendor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.doNotTrack", "Do Not Track")}:</span>
                        <span>{report.browser.doNotTrack || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.online", "Online Status")}:</span>
                        <span>{report.browser.online ? "Online" : "Offline"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.hardwareConcurrency", "CPU Cores")}:</span>
                        <span>{report.browser.hardwareConcurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.maxTouchPoints", "Touch Points")}:</span>
                        <span>{report.browser.maxTouchPoints}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("osReport.windowDetails", "Window Details")}</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.innerSize", "Inner Size")}:</span>
                        <span>{report.window.innerWidth}x{report.window.innerHeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.outerSize", "Outer Size")}:</span>
                        <span>{report.window.outerWidth}x{report.window.outerHeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("osReport.devicePixelRatio", "Device Pixel Ratio")}:</span>
                        <span>{report.window.devicePixelRatio}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("osReport.userAgent", "User Agent")}</h3>
                    <div className="bg-muted p-3 rounded-md overflow-auto">
                      <code className="text-xs whitespace-pre-wrap">{report.browser.userAgent}</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>{t("osReport.performanceMetrics", "Performance Metrics")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {report.performance.memory && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">{t("osReport.memoryUsage", "Memory Usage")}</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{t("osReport.usedJSHeapSize", "Used JS Heap")}</span>
                            <span>{formatBytes(report.performance.memory.usedJSHeapSize)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${(report.performance.memory.usedJSHeapSize / report.performance.memory.jsHeapSizeLimit) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("osReport.totalJSHeapSize", "Total JS Heap")}:</span>
                            <span>{formatBytes(report.performance.memory.totalJSHeapSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("osReport.jsHeapSizeLimit", "JS Heap Limit")}:</span>
                            <span>{formatBytes(report.performance.memory.jsHeapSizeLimit)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {report.performance.timing && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">{t("osReport.timingMetrics", "Timing Metrics")}</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>{t("osReport.pageLoadTime", "Page Load Time")}</span>
                              <span>{formatTime(report.performance.timing.loadEventEnd - report.performance.timing.navigationStart)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: "100%",
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("osReport.domInteractive", "DOM Interactive")}:</span>
                              <span>{formatTime(report.performance.timing.domInteractive - report.performance.timing.navigationStart)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("osReport.domComplete", "DOM Complete")}:</span>
                              <span>{formatTime(report.performance.timing.domComplete - report.performance.timing.navigationStart)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("osReport.responseTime", "Response Time")}:</span>
                              <span>{formatTime(report.performance.timing.responseEnd - report.performance.timing.fetchStart)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {report.performance.navigation && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">{t("osReport.navigationInfo", "Navigation Information")}</h3>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("osReport.navigationType", "Navigation Type")}:</span>
                            <span>
                              {report.performance.navigation.type === 0 ? "Navigate" :
                               report.performance.navigation.type === 1 ? "Reload" :
                               report.performance.navigation.type === 2 ? "Back/Forward" : "Other"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("osReport.redirectCount", "Redirect Count")}:</span>
                            <span>{report.performance.navigation.redirectCount}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!report.performance.memory && !report.performance.timing && !report.performance.navigation && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t("osReport.noPerformanceData", "No performance data available for this browser")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>{t("osReport.browserFeatures", "Browser Features")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.localStorage", "Local Storage")}</span>
                    <Badge variant={report.features.localStorage ? "default" : "outline"}>
                      {report.features.localStorage ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.sessionStorage", "Session Storage")}</span>
                    <Badge variant={report.features.sessionStorage ? "default" : "outline"}>
                      {report.features.sessionStorage ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.webWorkers", "Web Workers")}</span>
                    <Badge variant={report.features.webWorkers ? "default" : "outline"}>
                      {report.features.webWorkers ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.serviceWorkers", "Service Workers")}</span>
                    <Badge variant={report.features.serviceWorkers ? "default" : "outline"}>
                      {report.features.serviceWorkers ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.webSockets", "WebSockets")}</span>
                    <Badge variant={report.features.webSockets ? "default" : "outline"}>
                      {report.features.webSockets ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.webGL", "WebGL")}</span>
                    <Badge variant={report.features.webGL ? "default" : "outline"}>
                      {report.features.webGL ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.webRTC", "WebRTC")}</span>
                    <Badge variant={report.features.webRTC ? "default" : "outline"}>
                      {report.features.webRTC ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.geolocation", "Geolocation")}</span>
                    <Badge variant={report.features.geolocation ? "default" : "outline"}>
                      {report.features.geolocation ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.notifications", "Notifications")}</span>
                    <Badge variant={report.features.notifications ? "default" : "outline"}>
                      {report.features.notifications ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.bluetooth", "Bluetooth")}</span>
                    <Badge variant={report.features.bluetooth ? "default" : "outline"}>
                      {report.features.bluetooth ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.usb", "USB")}</span>
                    <Badge variant={report.features.usb ? "default" : "outline"}>
                      {report.features.usb ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.battery", "Battery API")}</span>
                    <Badge variant={report.features.battery ? "default" : "outline"}>
                      {report.features.battery ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{t("osReport.touchscreen", "Touchscreen")}</span>
                    <Badge variant={report.features.touchscreen ? "default" : "outline"}>
                      {report.features.touchscreen ? t("osReport.supported", "Supported") : t("osReport.unsupported", "Unsupported")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {t("osReport.featureNote", "Feature support may vary depending on browser version and device capabilities.")}
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OSReportPage;
