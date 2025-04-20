/**
 * Definirea rutelor aplicației cu lazy loading și code splitting
 * Acest fișier utilizează gruparea rutelor pentru a optimiza încărcarea
 */

import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { lazyPage } from "../lib/lazy-pages";
import { RouteGroup, getRouteGroup } from "./route-groups";

// Import layout component - preload pentru performanță mai bună
import AppLayout from "../components/layout/AppLayout";

// Import pages that need to be available immediately for better performance
import HomePage from "../pages/HomePage";

// Componente de loading pentru diferite grupuri de rute
import { 
  AuthLoadingFallback,
  DashboardLoadingFallback,
  InventoryLoadingFallback,
  ProjectsLoadingFallback,
  ReportsLoadingFallback,
  SettingsLoadingFallback,
  DefaultLoadingFallback
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
const createLazyPage = (importFn: () => Promise<any>, path: string, options = {}) => {
  const group = getRouteGroup(path);
  const fallback = getFallbackForGroup(group);
  
  return lazyPage(importFn, {
    fallback,
    ...options,
  });
};

// ===== GRUPUL AUTH =====
const AuthPage = createLazyPage(() => import("../pages/AuthPage"), "/login", { preload: true });
const ForgotPasswordPage = createLazyPage(() => import("../pages/ForgotPasswordPage"), "/forgot-password", { preload: true });
const AuthCallbackPage = createLazyPage(() => import("../pages/AuthCallbackPage"), "/auth/callback", { preload: true });
const ResetPasswordPage = createLazyPage(() => import("../pages/ResetPasswordPage"), "/reset-password", { preload: true });

// ===== GRUPUL PUBLIC =====
const AboutPage = createLazyPage(() => import("../pages/AboutPage"), "/about");
const TermsPage = createLazyPage(() => import("../pages/TermsPage"), "/terms");
const PricingPage = createLazyPage(() => import("../pages/PricingPage"), "/pricing");
const ContactPage = createLazyPage(() => import("../pages/ContactPage"), "/contact");

// ===== GRUPUL DASHBOARD =====
const DashboardPage = createLazyPage(() => import("../pages/DashboardPage"), "/dashboard", { preload: true });
const OverviewPage = createLazyPage(() => import("../pages/OverviewPage"), "/overview", { preload: true });
const AnalyticsPage = createLazyPage(() => import("../pages/AnalyticsPage"), "/analytics", { preload: true });
const CalendarPage = createLazyPage(() => import("../pages/CalendarPage"), "/calendar", { preload: true });

// ===== GRUPUL INVENTORY =====
const InventoryManagementPage = createLazyPage(() => import("../pages/InventoryManagementPage"), "/inventory-management", { preload: true });
const InventoryOverviewPage = createLazyPage(() => import("../pages/InventoryOverviewPage"), "/inventory-overview", { preload: true });
const CompanyInventoryPage = createLazyPage(() => import("../pages/CompanyInventoryPage"), "/company-inventory", { preload: true });
const AddMaterialPage = createLazyPage(() => import("../pages/AddMaterialPage"), "/add-material");
const UploadExcelPage = createLazyPage(() => import("../pages/UploadExcelPage"), "/upload-excel");
const InventoryListPage = createLazyPage(() => import("../pages/InventoryListPage"), "/inventory-list");
const ItemDetailPage = createLazyPage(() => import("../pages/ItemDetailPage"), "/item/:id");
const CreateItemPage = createLazyPage(() => import("../pages/CreateItemPage"), "/create-item");
const CategoryManagementPage = createLazyPage(() => import("../pages/CategoryManagementPage"), "/categories");
const ImportExportPage = createLazyPage(() => import("../pages/ImportExportPage"), "/import-export");
const AIInventoryAssistantPage = createLazyPage(() => import("../pages/AIInventoryAssistantPage"), "/ai-assistant");
const ScanPage = createLazyPage(() => import("../pages/ScanPage"), "/scan");

// ===== GRUPUL PROJECTS =====
const ProjectsPage = createLazyPage(() => import("../pages/ProjectsPage"), "/projects", { preload: true });
const SuppliersPage = createLazyPage(() => import("../pages/SuppliersPage"), "/suppliers");
const TeamsPage = createLazyPage(() => import("../pages/TeamsPage"), "/teams");
const BudgetPage = createLazyPage(() => import("../pages/BudgetPage"), "/budget");
const SchedulePage = createLazyPage(() => import("../pages/SchedulePage"), "/schedule");
const TasksPage = createLazyPage(() => import("../pages/TasksPage"), "/tasks");
const ForecastPage = createLazyPage(() => import("../pages/ForecastPage"), "/forecast");

// ===== GRUPUL REPORTS =====
const ReportsPage = createLazyPage(() => import("../pages/ReportsPage"), "/reports");
const ResourcesPage = createLazyPage(() => import("../pages/ResourcesPage"), "/resources");
const DocumentsPage = createLazyPage(() => import("../pages/DocumentsPage"), "/documents");
const OSReportPage = createLazyPage(() => import("../pages/OSReportPage"), "/os-report");

// ===== GRUPUL SETTINGS =====
const SettingsPage = createLazyPage(() => import("../pages/SettingsPage"), "/settings");
const ProfilePage = createLazyPage(() => import("../pages/ProfilePage"), "/profile");
const EditProfilePage = createLazyPage(() => import("../pages/EditProfilePage"), "/edit-profile");
const PreferencesPage = createLazyPage(() => import("../pages/PreferencesPage"), "/preferences");

// ===== GRUPUL USERS =====
const UsersManagementPage = createLazyPage(() => import("../pages/UsersManagementPage"), "/users");
const RoleManagementPage = createLazyPage(() => import("../pages/RoleManagementPage"), "/role-management");
const AuditLogsPage = createLazyPage(() => import("../pages/AuditLogsPage"), "/audit-logs");

// ===== GRUPUL MISC =====
const TutorialPage = createLazyPage(() => import("../pages/TutorialPage"), "/tutorial");
const NotificationsPage = createLazyPage(() => import("../pages/NotificationsPage"), "/notifications");
const ErrorMonitoringPage = createLazyPage(() => import("../pages/ErrorMonitoringPage"), "/error-monitoring");
const TesterPage = createLazyPage(() => import("../pages/TesterPage"), "/tester");

// ===== GRUPUL DESKTOP =====
const DesktopInfoPage = createLazyPage(() => import("../pages/DesktopInfoPage"), "/desktop-info", { preload: true });

/**
 * Componenta pentru rutele aplicației
 * Utilizează încărcarea leneșă pentru a îmbunătăți performanța
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />

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
        <Route path="calendar" element={<CalendarPage />} />
        
        {/* Inventory Group */}
        <Route path="inventory-management" element={<InventoryManagementPage />} />
        <Route path="inventory-overview" element={<InventoryOverviewPage />} />
        <Route path="company-inventory" element={<CompanyInventoryPage />} />
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
        <Route path="suppliers" element={<SuppliersPage />} />
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
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="edit-profile" element={<EditProfilePage />} />
        <Route path="preferences" element={<PreferencesPage />} />
        
        {/* Users Group */}
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="role-management" element={<RoleManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        
        {/* Misc Group */}
        <Route path="tutorial" element={<TutorialPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="error-monitoring" element={<ErrorMonitoringPage />} />
        <Route path="tester" element={<TesterPage />} />
        
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
