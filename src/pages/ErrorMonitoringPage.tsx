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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  errorMonitoring,
  ErrorData,
  ErrorSeverity,
  ErrorSource,
  captureError,
} from "@/lib/error-monitoring";

const ErrorMonitoringPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    severity: string;
    source: string;
    search: string;
  }>({
    severity: "all",
    source: "all",
    search: "",
  });
  const [activeTab, setActiveTab] = useState("errors");

  // Load errors on component mount
  useEffect(() => {
    loadErrors();
  }, []);

  // Load errors from the error monitoring service
  const loadErrors = async () => {
    setLoading(true);
    try {
      const errorData = await errorMonitoring.getErrors(100);
      setErrors(errorData);
    } catch (error) {
      // Removed console statement
      toast({
        title: "Error",
        description: "Failed to load error logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear all errors
  const clearErrors = async () => {
    try {
      await errorMonitoring.clearErrors();
      setErrors([]);
      toast({
        title: "Success",
        description: "All error logs have been cleared",
      });
    } catch (error) {
      // Removed console statement
      toast({
        title: "Error",
        description: "Failed to clear error logs",
        variant: "destructive",
      });
    }
  };

  // Generate and download error report
  const generateReport = async () => {
    try {
      const reportBlob = await errorMonitoring.generateErrorReport();
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `error-report-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Error report has been downloaded",
      });
    } catch (error) {
      // Removed console statement
      toast({
        title: "Error",
        description: "Failed to generate error report",
        variant: "destructive",
      });
    }
  };

  // Test error capturing
  const testErrorCapture = () => {
    captureError(
      "Test error from Error Monitoring page",
      ErrorSource.CLIENT,
      ErrorSeverity.INFO,
      { test: true, timestamp: new Date().toISOString() }
    );

    toast({
      title: "Test Error Captured",
      description: "A test error has been captured. Refresh to see it in the list.",
    });

    // Reload errors after a short delay
    setTimeout(loadErrors, 500);
  };

  // Filter errors based on current filter settings
  const filteredErrors = errors.filter((error) => {
    // Filter by severity
    if (filter.severity !== "all" && error.severity !== filter.severity) {
      return false;
    }

    // Filter by source
    if (filter.source !== "all" && error.source !== filter.source) {
      return false;
    }

    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        error.message.toLowerCase().includes(searchLower) ||
        (error.stack && error.stack.toLowerCase().includes(searchLower)) ||
        (error.context &&
          JSON.stringify(error.context).toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Get error counts by severity
  const errorCounts = {
    total: errors.length,
    critical: errors.filter((e) => e.severity === ErrorSeverity.CRITICAL).length,
    error: errors.filter((e) => e.severity === ErrorSeverity.ERROR).length,
    warning: errors.filter((e) => e.severity === ErrorSeverity.WARNING).length,
    info: errors.filter((e) => e.severity === ErrorSeverity.INFO).length,
  };

  // Get error counts by source
  const sourceCounts = {
    client: errors.filter((e) => e.source === ErrorSource.CLIENT).length,
    server: errors.filter((e) => e.source === ErrorSource.SERVER).length,
    database: errors.filter((e) => e.source === ErrorSource.DATABASE).length,
    network: errors.filter((e) => e.source === ErrorSource.NETWORK).length,
    auth: errors.filter((e) => e.source === ErrorSource.AUTH).length,
    unknown: errors.filter((e) => e.source === ErrorSource.UNKNOWN).length,
  };

  // Get severity badge variant
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "destructive";
      case ErrorSeverity.ERROR:
        return "destructive";
      case ErrorSeverity.WARNING:
        return "warning";
      case ErrorSeverity.INFO:
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <Helmet>
        <title>{t("errorMonitoring.pageTitle", "Error Monitoring")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("errorMonitoring.title", "Error Monitoring")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "errorMonitoring.subtitle",
                "Monitor and analyze application errors"
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadErrors} variant="outline">
              {t("errorMonitoring.refresh", "Refresh")}
            </Button>
            <Button onClick={generateReport} variant="outline">
              {t("errorMonitoring.generateReport", "Generate Report")}
            </Button>
            <Button onClick={testErrorCapture} variant="outline">
              {t("errorMonitoring.testError", "Test Error")}
            </Button>
            <Button onClick={clearErrors} variant="destructive">
              {t("errorMonitoring.clearErrors", "Clear All")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {t("errorMonitoring.totalErrors", "Total Errors")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{errorCounts.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {t("errorMonitoring.criticalErrors", "Critical & Errors")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {errorCounts.critical + errorCounts.error}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {t("errorMonitoring.warnings", "Warnings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {errorCounts.warning}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("errorMonitoring.info", "Info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {errorCounts.info}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="errors" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="errors">
              {t("errorMonitoring.errorList", "Error List")}
            </TabsTrigger>
            <TabsTrigger value="stats">
              {t("errorMonitoring.statistics", "Statistics")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("errorMonitoring.errorList", "Error List")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "errorMonitoring.errorListDescription",
                    "View and filter application errors"
                  )}
                </CardDescription>
                <div className="flex flex-col md:flex-row gap-4 mt-2">
                  <div className="flex-1">
                    <Input
                      placeholder={t("errorMonitoring.search", "Search errors...")}
                      value={filter.search}
                      onChange={(e) =>
                        setFilter({ ...filter, search: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={filter.severity}
                      onValueChange={(value) =>
                        setFilter({ ...filter, severity: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={t("errorMonitoring.severity", "Severity")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("errorMonitoring.allSeverities", "All Severities")}
                        </SelectItem>
                        <SelectItem value={ErrorSeverity.CRITICAL}>
                          {t("errorMonitoring.critical", "Critical")}
                        </SelectItem>
                        <SelectItem value={ErrorSeverity.ERROR}>
                          {t("errorMonitoring.error", "Error")}
                        </SelectItem>
                        <SelectItem value={ErrorSeverity.WARNING}>
                          {t("errorMonitoring.warning", "Warning")}
                        </SelectItem>
                        <SelectItem value={ErrorSeverity.INFO}>
                          {t("errorMonitoring.info", "Info")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filter.source}
                      onValueChange={(value) =>
                        setFilter({ ...filter, source: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={t("errorMonitoring.source", "Source")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("errorMonitoring.allSources", "All Sources")}
                        </SelectItem>
                        <SelectItem value={ErrorSource.CLIENT}>
                          {t("errorMonitoring.client", "Client")}
                        </SelectItem>
                        <SelectItem value={ErrorSource.SERVER}>
                          {t("errorMonitoring.server", "Server")}
                        </SelectItem>
                        <SelectItem value={ErrorSource.DATABASE}>
                          {t("errorMonitoring.database", "Database")}
                        </SelectItem>
                        <SelectItem value={ErrorSource.NETWORK}>
                          {t("errorMonitoring.network", "Network")}
                        </SelectItem>
                        <SelectItem value={ErrorSource.AUTH}>
                          {t("errorMonitoring.auth", "Authentication")}
                        </SelectItem>
                        <SelectItem value={ErrorSource.UNKNOWN}>
                          {t("errorMonitoring.unknown", "Unknown")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    {t("errorMonitoring.loading", "Loading errors...")}
                  </div>
                ) : filteredErrors.length === 0 ? (
                  <div className="text-center py-4">
                    {t("errorMonitoring.noErrors", "No errors found")}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t("errorMonitoring.timestamp", "Timestamp")}
                          </TableHead>
                          <TableHead>
                            {t("errorMonitoring.message", "Message")}
                          </TableHead>
                          <TableHead>
                            {t("errorMonitoring.severity", "Severity")}
                          </TableHead>
                          <TableHead>
                            {t("errorMonitoring.source", "Source")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredErrors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {formatDate(error.timestamp)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{error.message}</div>
                              {error.stack && (
                                <details className="mt-1">
                                  <summary className="text-xs text-muted-foreground cursor-pointer">
                                    {t("errorMonitoring.stackTrace", "Stack Trace")}
                                  </summary>
                                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-40">
                                    {error.stack}
                                  </pre>
                                </details>
                              )}
                              {error.context && (
                                <details className="mt-1">
                                  <summary className="text-xs text-muted-foreground cursor-pointer">
                                    {t("errorMonitoring.context", "Context")}
                                  </summary>
                                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-40">
                                    {JSON.stringify(error.context, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getSeverityBadge(error.severity)}>
                                {error.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>{error.source}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {t("errorMonitoring.showing", "Showing")} {filteredErrors.length}{" "}
                  {t("errorMonitoring.of", "of")} {errors.length}{" "}
                  {t("errorMonitoring.errors", "errors")}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("errorMonitoring.severityDistribution", "Severity Distribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {t("errorMonitoring.critical", "Critical")}
                          </Badge>
                        </div>
                        <span>{errorCounts.critical}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (errorCounts.critical / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {t("errorMonitoring.error", "Error")}
                          </Badge>
                        </div>
                        <span>{errorCounts.error}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (errorCounts.error / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="warning">
                            {t("errorMonitoring.warning", "Warning")}
                          </Badge>
                        </div>
                        <span>{errorCounts.warning}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (errorCounts.warning / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {t("errorMonitoring.info", "Info")}
                          </Badge>
                        </div>
                        <span>{errorCounts.info}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (errorCounts.info / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("errorMonitoring.sourceDistribution", "Source Distribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{t("errorMonitoring.client", "Client")}</span>
                        </div>
                        <span>{sourceCounts.client}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (sourceCounts.client / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{t("errorMonitoring.server", "Server")}</span>
                        </div>
                        <span>{sourceCounts.server}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (sourceCounts.server / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{t("errorMonitoring.database", "Database")}</span>
                        </div>
                        <span>{sourceCounts.database}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (sourceCounts.database / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{t("errorMonitoring.network", "Network")}</span>
                        </div>
                        <span>{sourceCounts.network}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (sourceCounts.network / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{t("errorMonitoring.auth", "Authentication")}</span>
                        </div>
                        <span>{sourceCounts.auth}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (sourceCounts.auth / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{t("errorMonitoring.unknown", "Unknown")}</span>
                        </div>
                        <span>{sourceCounts.unknown}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-600"
                          style={{
                            width: `${
                              errorCounts.total
                                ? (sourceCounts.unknown / errorCounts.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ErrorMonitoringPage;
