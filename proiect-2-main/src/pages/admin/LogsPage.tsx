import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { UserRoles } from "@/types/supabase-tables";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  User,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

// Tipul pentru jurnalul de activitate
interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  severity: "info" | "warning" | "error" | "success";
}

const LogsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [userFilter, setUserFilter] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  // Verificăm dacă utilizatorul are rol de admin
  if (userRole !== UserRoles.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Funcție pentru încărcarea jurnalelor de activitate
  const fetchLogs = async () => {
    try {
      setLoading(true);

      // În implementarea reală, aici ar trebui să încărcăm jurnalele din baza de date
      // Pentru moment, folosim date de exemplu
      const mockLogs: ActivityLog[] = [
        {
          id: "1",
          user_id: "user1",
          user_email: "admin@example.com",
          action: "login",
          resource: "auth",
          resource_id: null,
          details: "Successful login",
          ip_address: "192.168.1.1",
          user_agent: "Mozilla/5.0",
          created_at: new Date().toISOString(),
          severity: "info",
        },
        {
          id: "2",
          user_id: "user2",
          user_email: "manager@example.com",
          action: "create",
          resource: "project",
          resource_id: "proj123",
          details: "Created new project: Project X",
          ip_address: "192.168.1.2",
          user_agent: "Chrome/90.0",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          severity: "success",
        },
        {
          id: "3",
          user_id: "user3",
          user_email: "user@example.com",
          action: "update",
          resource: "material",
          resource_id: "mat456",
          details: "Updated material quantity",
          ip_address: "192.168.1.3",
          user_agent: "Firefox/88.0",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          severity: "info",
        },
        {
          id: "4",
          user_id: "user2",
          user_email: "manager@example.com",
          action: "delete",
          resource: "supplier",
          resource_id: "sup789",
          details: "Deleted supplier: ABC Corp",
          ip_address: "192.168.1.2",
          user_agent: "Chrome/90.0",
          created_at: new Date(Date.now() - 10800000).toISOString(),
          severity: "warning",
        },
        {
          id: "5",
          user_id: "user1",
          user_email: "admin@example.com",
          action: "error",
          resource: "report",
          resource_id: "rep101",
          details: "Failed to generate report: Database error",
          ip_address: "192.168.1.1",
          user_agent: "Mozilla/5.0",
          created_at: new Date(Date.now() - 14400000).toISOString(),
          severity: "error",
        },
      ];

      setLogs(mockLogs);

      // Extragem lista de utilizatori unici
      const uniqueUsers = Array.from(
        new Set(mockLogs.map((log) => log.user_id))
      ).map((userId) => {
        const log = mockLogs.find((l) => l.user_id === userId);
        return {
          id: userId,
          email: log?.user_email || "",
        };
      });

      setUsers(uniqueUsers);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: t("admin.logs.fetchError", "Error fetching logs"),
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm jurnalele la montarea componentei
  useEffect(() => {
    fetchLogs();
  }, []);

  // Funcție pentru exportarea jurnalelor
  const exportLogs = () => {
    try {
      // Convertim jurnalele filtrate în format CSV
      const headers = [
        "ID",
        "User",
        "Action",
        "Resource",
        "Resource ID",
        "Details",
        "IP Address",
        "User Agent",
        "Timestamp",
        "Severity",
      ];

      const csvContent = [
        headers.join(","),
        ...filteredLogs.map((log) => [
          log.id,
          log.user_email,
          log.action,
          log.resource,
          log.resource_id || "",
          log.details ? `"${log.details.replace(/"/g, '""')}"` : "",
          log.ip_address || "",
          log.user_agent ? `"${log.user_agent.replace(/"/g, '""')}"` : "",
          log.created_at,
          log.severity,
        ].join(",")),
      ].join("\n");

      // Creăm un blob și un link pentru descărcare
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `activity_logs_${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: t("admin.logs.exportSuccess", "Logs exported"),
        description: t(
          "admin.logs.exportSuccessDesc",
          "Logs have been exported successfully"
        ),
      });
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast({
        title: t("admin.logs.exportError", "Error exporting logs"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("");
    setSeverityFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setUserFilter("");
  };

  // Funcție pentru obținerea iconului pentru acțiune
  const getActionIcon = (action: string, severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "info":
      default:
        switch (action) {
          case "login":
            return <User className="h-4 w-4 text-blue-400" />;
          case "create":
            return <CheckCircle className="h-4 w-4 text-green-400" />;
          case "update":
            return <Activity className="h-4 w-4 text-blue-400" />;
          case "delete":
            return <XCircle className="h-4 w-4 text-red-400" />;
          default:
            return <Info className="h-4 w-4 text-slate-400" />;
        }
    }
  };

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filtrăm jurnalele în funcție de filtrele aplicate
  const filteredLogs = logs.filter((log) => {
    // Filtrare după termen de căutare
    if (
      searchTerm &&
      !log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.resource.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    // Filtrare după acțiune
    if (actionFilter && log.action !== actionFilter) {
      return false;
    }

    // Filtrare după severitate
    if (severityFilter && log.severity !== severityFilter) {
      return false;
    }

    // Filtrare după utilizator
    if (userFilter && log.user_id !== userFilter) {
      return false;
    }

    // Filtrare după dată
    const logDate = new Date(log.created_at);
    if (dateFrom && logDate < dateFrom) {
      return false;
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (logDate > endOfDay) {
        return false;
      }
    }

    return true;
  });

  // Obținem lista de acțiuni unice
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t("admin.logs.title", "Activity Logs")}
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={fetchLogs}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("admin.logs.refresh", "Refresh")}
            </Button>
            <Button
              variant="outline"
              onClick={exportLogs}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("admin.logs.export", "Export")}
            </Button>
          </div>
        </div>

        {/* Filtre */}
        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
          <CardHeader className="relative z-10 border-b border-slate-700/50 pb-4">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-slate-400" />
              <span className="text-slate-300">
                {t("admin.logs.filters", "Filters")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-slate-400">
                  {t("admin.logs.search", "Search")}
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="search"
                    type="search"
                    placeholder={t("admin.logs.searchPlaceholder", "Search logs...")}
                    className="pl-8 bg-slate-900 border-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action" className="text-slate-400">
                  {t("admin.logs.action", "Action")}
                </Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger
                    id="action"
                    className="bg-slate-900 border-slate-700 text-white"
                  >
                    <SelectValue
                      placeholder={t("admin.logs.allActions", "All Actions")}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="">
                      {t("admin.logs.allActions", "All Actions")}
                    </SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity" className="text-slate-400">
                  {t("admin.logs.severity", "Severity")}
                </Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger
                    id="severity"
                    className="bg-slate-900 border-slate-700 text-white"
                  >
                    <SelectValue
                      placeholder={t("admin.logs.allSeverities", "All Severities")}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="">
                      {t("admin.logs.allSeverities", "All Severities")}
                    </SelectItem>
                    <SelectItem value="info">
                      {t("admin.logs.severityInfo", "Info")}
                    </SelectItem>
                    <SelectItem value="success">
                      {t("admin.logs.severitySuccess", "Success")}
                    </SelectItem>
                    <SelectItem value="warning">
                      {t("admin.logs.severityWarning", "Warning")}
                    </SelectItem>
                    <SelectItem value="error">
                      {t("admin.logs.severityError", "Error")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user" className="text-slate-400">
                  {t("admin.logs.user", "User")}
                </Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger
                    id="user"
                    className="bg-slate-900 border-slate-700 text-white"
                  >
                    <SelectValue
                      placeholder={t("admin.logs.allUsers", "All Users")}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="">
                      {t("admin.logs.allUsers", "All Users")}
                    </SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400">
                  {t("admin.logs.dateFrom", "Date From")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-white"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? (
                        format(dateFrom, "PPP")
                      ) : (
                        <span className="text-slate-500">
                          {t("admin.logs.pickDate", "Pick a date")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400">
                  {t("admin.logs.dateTo", "Date To")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-white"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? (
                        format(dateTo, "PPP")
                      ) : (
                        <span className="text-slate-500">
                          {t("admin.logs.pickDate", "Pick a date")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  {t("admin.logs.resetFilters", "Reset Filters")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel jurnale */}
        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
          <CardContent className="p-0 relative z-10">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-400">
                    {t("admin.logs.loading", "Loading logs...")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-700/50 bg-slate-800">
                      <TableHead className="w-[180px]">
                        {t("admin.logs.timestamp", "Timestamp")}
                      </TableHead>
                      <TableHead className="w-[150px]">
                        {t("admin.logs.user", "User")}
                      </TableHead>
                      <TableHead className="w-[120px]">
                        {t("admin.logs.action", "Action")}
                      </TableHead>
                      <TableHead className="w-[120px]">
                        {t("admin.logs.resource", "Resource")}
                      </TableHead>
                      <TableHead>
                        {t("admin.logs.details", "Details")}
                      </TableHead>
                      <TableHead className="w-[120px]">
                        {t("admin.logs.ipAddress", "IP Address")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-slate-400"
                        >
                          {t("admin.logs.noLogs", "No logs found matching your criteria.")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="hover:bg-slate-700/50 border-b border-slate-700/50"
                        >
                          <TableCell className="text-slate-400">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell className="font-medium text-slate-300">
                            {log.user_email}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getActionIcon(log.action, log.severity)}
                              <span
                                className={`ml-2 ${
                                  log.severity === "error"
                                    ? "text-red-400"
                                    : log.severity === "warning"
                                    ? "text-amber-400"
                                    : log.severity === "success"
                                    ? "text-green-400"
                                    : "text-slate-300"
                                }`}
                              >
                                {log.action}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {log.resource}
                            {log.resource_id && (
                              <span className="text-slate-500 text-xs ml-1">
                                ({log.resource_id})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {log.details || "-"}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {log.ip_address || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogsPage;
