/**
 * Definirea rutelor aplicației cu lazy loading și code splitting
 * Acest fișier utilizează gruparea rutelor pentru a optimiza încărcarea
 */

import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleBasedRoute from "@/components/auth/RoleBasedRoute";
import { lazyPage } from "../lib/lazy-pages";
import { RouteGroup, getRouteGroup } from "./route-groups";

// Import layout component - preload pentru performanță mai bună
import AppLayout from "../components/layout/AppLayout";

// Import pages that need to be available immediately for better performance
import HomePage from "../pages/HomePage";
import TestRoutePage from "../pages/TestRoutePage";
import InventarDepozitPage from "../pages/InventarDepozitPage";

// Componente de loading pentru diferite grupuri de rute
import {
  AuthLoadingFallback,
  DashboardLoadingFallback,
  InventoryLoadingFallback,
  ProjectsLoadingFallback,
  ReportsLoadingFallback,
  SettingsLoadingFallback,
  DefaultLoadingFallback,
} from "../components/loading";

// Funcție pentru a obține fallback-ul potrivit pentru un grup de rute
const getFallbackForGroup = (group: RouteGroup) => {
  switch (group) {
    case RouteGroup.AUTH:
      return <AuthLoadingFallback />;
    case RouteGroup.DASHBOARD:
      return <DashboardLoadingFallback />;
    case RouteGroup.INVENTORY:
      return <InventoryLoadingFallback />;
    case RouteGroup.PROJECTS:
      return <ProjectsLoadingFallback />;
    case RouteGroup.REPORTS:
      return <ReportsLoadingFallback />;
    case RouteGroup.SETTINGS:
      return <SettingsLoadingFallback />;
    default:
      return <DefaultLoadingFallback />;
  }
};

// Funcție pentru a crea o pagină lazy cu fallback-ul potrivit
const createLazyPage = (
  importFn: () => Promise<any>,
  path: string,
  options = {}
) => {
  const group = getRouteGroup(path);
  const fallback = getFallbackForGroup(group);

  return lazyPage(importFn, {
    fallback,
    ...options,
  });
};

// ===== GRUPUL AUTH =====
const AuthPage = createLazyPage(() => import("../pages/AuthPage"), "/login", {
  preload: true,
});
const ForgotPasswordPage = createLazyPage(
  () => import("../pages/ForgotPasswordPage"),
  "/forgot-password",
  { preload: true }
);
const AuthCallbackPage = createLazyPage(
  () => import("../pages/AuthCallbackPage"),
  "/auth/callback",
  { preload: true }
);
const ResetPasswordPage = createLazyPage(
  () => import("../pages/ResetPasswordPage"),
  "/reset-password",
  { preload: true }
);

// ===== GRUPUL PUBLIC =====
const AboutPage = createLazyPage(() => import("../pages/AboutPage"), "/about");
const TermsPage = createLazyPage(() => import("../pages/TermsPage"), "/terms");
const PricingPage = createLazyPage(
  () => import("../pages/PricingPage"),
  "/pricing"
);
const ContactPage = createLazyPage(
  () => import("../pages/ContactPage"),
  "/contact"
);
const PrivacyPolicyPage = createLazyPage(
  () => import("../pages/PrivacyPolicyPage"),
  "/privacy"
);
const CookiePolicyPage = createLazyPage(
  () => import("../pages/CookiePolicyPage"),
  "/cookies"
);
const GDPRCompliancePage = createLazyPage(
  () => import("../pages/GDPRCompliancePage"),
  "/gdpr"
);

// ===== GRUPUL DASHBOARD =====
const DashboardPage = createLazyPage(
  () => import("../pages/DashboardPage"),
  "/dashboard",
  { preload: true }
);
const OverviewPage = createLazyPage(
  () => import("../pages/OverviewPage"),
  "/overview",
  { preload: true }
);
const AnalyticsPage = createLazyPage(
  () => import("../pages/AnalyticsPage"),
  "/analytics",
  { preload: true }
);
const CalendarPage = createLazyPage(
  () => import("../pages/CalendarPage"),
  "/calendar",
  { preload: true }
);

// ===== GRUPUL INVENTORY =====
// Folosim InventarDepozitPage pentru inventarul depozitului
const ProjectInventoryPage = createLazyPage(
  () => import("../pages/ProjectInventoryPage"),
  "/project-inventory",
  { preload: true }
);
const InventoryOverviewPage = createLazyPage(
  () => import("../pages/InventoryOverviewPage"),
  "/inventory-overview",
  { preload: true }
);
// Legacy pages - to be removed after transition
const InventoryManagementPage = createLazyPage(
  () => import("../pages/InventoryManagementPage"),
  "/inventory-management"
);
// Folosim InventarDepozitPage în loc de CompanyInventoryPage
const AddMaterialPage = createLazyPage(
  () => import("../pages/AddMaterialPage"),
  "/add-material"
);
const UploadExcelPage = createLazyPage(
  () => import("../pages/UploadExcelPage"),
  "/upload-excel"
);
const InventoryListPage = createLazyPage(
  () => import("../pages/InventoryListPage"),
  "/inventory-list"
);
const ItemDetailPage = createLazyPage(
  () => import("../pages/ItemDetailPage"),
  "/item/:id"
);
const CreateItemPage = createLazyPage(
  () => import("../pages/CreateItemPage"),
  "/create-item"
);
const CategoryManagementPage = createLazyPage(
  () => import("../pages/CategoryManagementPage"),
  "/categories"
);
const ImportExportPage = createLazyPage(
  () => import("../pages/ImportExportPage"),
  "/import-export"
);
const AIInventoryAssistantPage = createLazyPage(
  () => import("../pages/AIInventoryAssistantPage"),
  "/ai-assistant"
);
const ScanPage = createLazyPage(() => import("../pages/ScanPage"), "/scan");

// ===== GRUPUL PROJECTS =====
const ProjectsPage = createLazyPage(
  () => import("../pages/ProjectsPage"),
  "/projects",
  { preload: true }
);
const SuppliersPageNew = createLazyPage(
  () => import("../pages/SuppliersPageNew"),
  "/suppliers"
);
const SupplierDetailsPage = createLazyPage(
  () => import("../pages/SupplierDetailsPage"),
  "/suppliers/:supplierId"
);
const TesterPage = createLazyPage(
  () => import("../pages/TesterPage"),
  "/tester"
);
const AIAssistantPage = createLazyPage(
  () => import("../pages/AIAssistantPage"),
  "/ai-assistant"
);
const InventoryOptimizerPage = createLazyPage(
  () => import("../pages/InventoryOptimizerPage"),
  "/inventory-optimizer"
);
const InventoryButtonFixerPage = createLazyPage(
  () => import("../pages/InventoryButtonFixerPage"),
  "/inventory-button-fixer"
);
const AccessDeniedPage = createLazyPage(
  () => import("../pages/AccessDeniedPage"),
  "/access-denied"
);
const TeamsPage = createLazyPage(() => import("../pages/TeamsPage"), "/teams");
const BudgetPage = createLazyPage(
  () => import("../pages/BudgetPage"),
  "/budget"
);
const SchedulePage = createLazyPage(
  () => import("../pages/SchedulePage"),
  "/schedule"
);
const TasksPage = createLazyPage(() => import("../pages/TasksPage"), "/tasks");
const ForecastPage = createLazyPage(
  () => import("../pages/ForecastPage"),
  "/forecast"
);

// ===== GRUPUL REPORTS =====
const ReportsPage = createLazyPage(
  () => import("../pages/ReportsPageNew"),
  "/reports"
);
const ResourcesPage = createLazyPage(
  () => import("../pages/ResourcesPage"),
  "/resources"
);
const DocumentsPage = createLazyPage(
  () => import("../pages/DocumentsPage"),
  "/documents"
);
const OSReportPage = createLazyPage(
  () => import("../pages/OSReportPage"),
  "/os-report"
);

// ===== GRUPUL SETTINGS =====
const SettingsPage = createLazyPage(
  () => import("../pages/SettingsPage"),
  "/settings"
);
const ProfilePage = createLazyPage(
  () => import("../pages/ProfilePage"),
  "/profile"
);
const EditProfilePage = createLazyPage(
  () => import("../pages/EditProfilePage"),
  "/edit-profile"
);
const PreferencesPage = createLazyPage(
  () => import("../pages/PreferencesPage"),
  "/preferences"
);

// ===== GRUPUL ADMIN =====
const AdminDashboardPage = createLazyPage(
  () => import("../pages/admin/AdminDashboardPage"),
  "/admin"
);
const AdminUsersManagementPage = createLazyPage(
  () => import("../pages/admin/UsersManagementPage"),
  "/admin/users"
);
const AdminRoleManagementPage = createLazyPage(
  () => import("../pages/admin/RoleManagementPage"),
  "/admin/roles"
);
const AdminLogsPage = createLazyPage(
  () => import("../pages/admin/LogsPage"),
  "/admin/logs"
);
const AdminSystemSettingsPage = createLazyPage(
  () => import("../pages/admin/SystemSettingsPage"),
  "/admin/settings"
);

// ===== GRUPUL USERS =====
const UsersManagementPage = createLazyPage(
  () => import("../pages/UsersManagementPage"),
  "/users"
);
const RoleManagementPage = createLazyPage(
  () => import("../pages/RoleManagementPage"),
  "/role-management"
);
const RolePermissionsPage = createLazyPage(
  () => import("../pages/RolePermissionsPage"),
  "/role-permissions"
);
const SystemHealthPage = createLazyPage(
  () => import("../pages/SystemHealthPage"),
  "/system-health"
);
const AuditLogsPage = createLazyPage(
  () => import("../pages/AuditLogsPage"),
  "/audit-logs"
);

// ===== GRUPUL MISC =====
const TutorialPage = createLazyPage(
  () => import("../pages/TutorialPage"),
  "/tutorial"
);
const NotificationsPage = createLazyPage(
  () => import("../pages/NotificationsPage"),
  "/notifications"
);
const ErrorMonitoringPage = createLazyPage(
  () => import("../pages/ErrorMonitoringPage"),
  "/error-monitoring"
);
const TesterPage = createLazyPage(
  () => import("../pages/TesterPage"),
  "/tester"
);

// ===== GRUPUL DESKTOP =====
const DesktopInfoPage = createLazyPage(
  () => import("../pages/DesktopInfoPage"),
  "/desktop-info",
  { preload: true }
);

/**
 * Componenta pentru rutele aplicației
 * Utilizează încărcarea leneșă pentru a îmbunătăți performanța
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/test-route" element={<TestRoutePage />} />
      <Route path="/warehouse-inventory" element={<InventarDepozitPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/cookies" element={<CookiePolicyPage />} />
      <Route path="/gdpr" element={<GDPRCompliancePage />} />

      {/* Rute pentru autentificare */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes inside AppLayout */}
      <Route path="/" element={<AppLayout />}>
        {/* Dashboard Group */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="calendar" element={<RoleBasedRoute allowedRoles={["admin", "manager", "team_lead", "inventory_manager", "worker", "viewer"]}>
          <CalendarPage />
        </RoleBasedRoute>} />

        {/* Inventory Group */}
        <Route path="warehouse-inventory" element={<InventarDepozitPage />} />
        <Route path="project-inventory" element={<ProjectInventoryPage />} />
        <Route
          path="project-inventory/:projectId"
          element={<ProjectInventoryPage />}
        />
        <Route path="inventory-overview" element={<InventoryOverviewPage />} />
        {/* Legacy routes - redirects */}
        <Route
          path="inventory-management"
          element={<Navigate to="/project-inventory" replace />}
        />
        <Route
          path="company-inventory"
          element={<Navigate to="/warehouse-inventory" replace />}
        />
        <Route path="add-material" element={<AddMaterialPage />} />
        <Route path="upload-excel" element={<UploadExcelPage />} />
        <Route path="inventory-list" element={<InventoryListPage />} />
        <Route path="item/:id" element={<ItemDetailPage />} />
        <Route path="create-item" element={<CreateItemPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="import-export" element={<ImportExportPage />} />
        <Route path="ai-assistant" element={<AIInventoryAssistantPage />} />
        <Route path="scan" element={<ScanPage />} />

        {/* Projects Group */}
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="suppliers" element={<SuppliersPageNew />} />
        <Route path="suppliers/:supplierId" element={<SupplierDetailsPage />} />
        <Route path="tester" element={<TesterPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route
          path="inventory-optimizer"
          element={
            <RoleBasedRoute allowedRoles={["admin", "manager", "user"]}>
              <InventoryOptimizerPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="inventory-button-fixer"
          element={
            <RoleBasedRoute allowedRoles={["admin", "manager"]}>
              <InventoryButtonFixerPage />
            </RoleBasedRoute>
          }
        />
        <Route path="access-denied" element={<AccessDeniedPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="forecast" element={<ForecastPage />} />

        {/* Reports Group */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="os-report" element={<OSReportPage />} />

        {/* Settings Group */}
        <Route
          path="settings"
          element={
            <RoleBasedRoute allowedRoles={["admin", "manager"]}>
              <SettingsPage />
            </RoleBasedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="edit-profile" element={<EditProfilePage />} />
        <Route path="preferences" element={<PreferencesPage />} />

        {/* Users Group */}
        <Route
          path="users"
          element={
            <RoleBasedRoute allowedRoles={["admin", "manager"]}>
              <UsersManagementPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="role-management"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <RoleManagementPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="role-permissions"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <RolePermissionsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AuditLogsPage />
            </RoleBasedRoute>
          }
        />

        {/* Misc Group */}
        <Route path="tutorial" element={<TutorialPage />} />
        <Route
          path="notifications"
          element={
            <RoleBasedRoute allowedRoles={["admin", "manager"]}>
              <NotificationsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="error-monitoring"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <ErrorMonitoringPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="system-health"
          element={
            <RoleBasedRoute
              allowedRoles={["admin"]}
              requiredPermissions={["view_system_health"]}
            >
              <SystemHealthPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="tester"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <TesterPage />
            </RoleBasedRoute>
          }
        />

        {/* Admin Group */}
        <Route
          path="admin"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminUsersManagementPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/roles"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminRoleManagementPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/logs"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminLogsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminSystemSettingsPage />
            </RoleBasedRoute>
          }
        />

        {/* Desktop Group */}
        <Route path="desktop-info" element={<DesktopInfoPage />} />
      </Route>

      {/* Add tempobook route to prevent catchall from capturing it */}
      {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}

      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
