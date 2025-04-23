import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { lazyPage } from "./lib/lazy-pages";

// Import layout component - preload pentru performanță mai bună
import AppLayout from "./components/layout/AppLayout";

// Import pages that need to be available immediately for better performance
import HomePage from "./pages/HomePage";

// Import pagini de autentificare
const AuthPage = lazyPage(() => import("./pages/AuthPage"), {
  preload: true,
});

const ForgotPasswordPage = lazyPage(
  () => import("./pages/ForgotPasswordPage"),
  {
    preload: true,
  }
);

const AuthCallbackPage = lazyPage(() => import("./pages/AuthCallbackPage"), {
  preload: true,
});

const ResetPasswordPage = lazyPage(() => import("./pages/ResetPasswordPage"), {
  preload: true,
});

// Lazy load pages with custom loading states
const OverviewPage = lazyPage(() => import("./pages/OverviewPage"), {
  preload: true,
  minDisplayTime: 300,
});

const InventoryManagementPage = lazyPage(
  () => import("./pages/InventoryManagementPage"),
  {
    preload: true,
    minDisplayTime: 300,
  }
);

const InventoryOverviewPage = lazyPage(
  () => import("./pages/InventoryOverviewPage"),
  {
    preload: true,
    minDisplayTime: 300,
  }
);

const CompanyInventoryPage = lazyPage(
  () => import("./pages/CompanyInventoryPage"),
  {
    preload: true,
    minDisplayTime: 300,
  }
);

// Lazy load less frequently used pages
const AboutPage = lazyPage(() => import("./pages/AboutPage"));
const TermsPage = lazyPage(() => import("./pages/TermsPage"));
const PricingPage = lazyPage(() => import("./pages/PricingPage"));
const ContactPage = lazyPage(() => import("./pages/ContactPage"));
const DashboardPage = lazyPage(() => import("./pages/DashboardPage"), {
  preload: true,
});

// Admin pages
const AdminPage = lazyPage(() => import("./pages/AdminPage"), {
  preload: true,
});

// Company management pages
const CompanyManagementPage = lazyPage(
  () => import("./pages/CompanyManagementPage"),
  {
    preload: true,
  }
);

const AddCompanyPage = lazyPage(() => import("./pages/AddCompanyPage"), {
  preload: true,
});

const CompanyUsersPage = lazyPage(() => import("./pages/CompanyUsersPage"), {
  preload: true,
});

const SiteAdminPage = lazyPage(() => import("./pages/SiteAdminPage"), {
  preload: true,
});

// Noile pagini adăugate
const AnalyticsPage = lazyPage(() => import("./pages/AnalyticsPage"), {
  preload: true,
});
const CalendarPage = lazyPage(() => import("./pages/CalendarPage"), {
  preload: true,
});

// Pagini pentru inventar și licitații
const ProjectInventoryPage = lazyPage(
  () => import("./pages/ProjectInventoryPage"),
  {
    preload: true,
  }
);
const TendersPage = lazyPage(() => import("./pages/TendersPage"), {
  preload: true,
});
const UserActivityPage = lazyPage(() => import("./pages/UserActivityPage"), {
  preload: true,
});

// Lazy load additional project management pages
const ProjectsPage = lazyPage(() => import("./pages/ProjectsPage"), {
  preload: true,
});
const SuppliersPage = lazyPage(() => import("./pages/SuppliersPageNew"));
const SupplierDetailsPage = lazyPage(
  () => import("./pages/SupplierDetailsPage")
);
const TeamsPage = lazyPage(() => import("./pages/TeamsPage"));
const BudgetPage = lazyPage(() => import("./pages/BudgetPage"));
const ReportsPage = lazyPage(() => import("./pages/ReportsPageNew"));
const ResourcesPage = lazyPage(() => import("./pages/ResourcesPage"));
const ProfilePage = lazyPage(() => import("./pages/ProfilePage"));
const SettingsPage = lazyPage(() => import("./pages/SettingsPage"));
const AddMaterialPage = lazyPage(() => import("./pages/AddMaterialPage"));
const UploadExcelPage = lazyPage(() => import("./pages/UploadExcelPage"));
const SchedulePage = lazyPage(() => import("./pages/SchedulePage"));
const DocumentsPage = lazyPage(() => import("./pages/DocumentsPage"));
const RoleManagementPage = lazyPage(() => import("./pages/RoleManagementPage"));
const TutorialPage = lazyPage(() => import("./pages/TutorialPage"));
const TasksPage = lazyPage(() => import("./pages/TasksPage"));
const EditProfilePage = lazyPage(() => import("./pages/EditProfilePage"));
// Pagină de debug pentru dezvoltatori
// Paginile de autentificare au fost eliminate pentru noua implementare
const PreferencesPage = lazyPage(() => import("./pages/PreferencesPage"));
const InventoryListPage = lazyPage(() => import("./pages/InventoryListPage"));
const ItemDetailPage = lazyPage(() => import("./pages/ItemDetailPage"));
const CreateItemPage = lazyPage(() => import("./pages/CreateItemPage"));
const CategoryManagementPage = lazyPage(
  () => import("./pages/CategoryManagementPage")
);
const ImportExportPage = lazyPage(() => import("./pages/ImportExportPage"));
const NotificationsPage = lazyPage(() => import("./pages/NotificationsPage"));
const UsersManagementPage = lazyPage(
  () => import("./pages/UsersManagementPage")
);
const AuditLogsPage = lazyPage(() => import("./pages/AuditLogsPage"));
const AIInventoryAssistantPage = lazyPage(
  () => import("./pages/AIInventoryAssistantPage")
);
const ForecastPage = lazyPage(() => import("./pages/ForecastPage"));
const ScanPage = lazyPage(() => import("./pages/ScanPage"));
// New dedicated tester page for running application tests
const TesterPage = lazyPage(() => import("./pages/TesterPage"));

// Error monitoring page
const ErrorMonitoringPage = lazyPage(
  () => import("./pages/ErrorMonitoringPage")
);

// OS Report page
const OSReportPage = lazyPage(() => import("./pages/OSReportPage"));

// Desktop Info page
const DesktopInfoPage = lazyPage(() => import("./pages/DesktopInfoPage"), {
  preload: true,
});

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
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route
          path="inventory-management"
          element={<InventoryManagementPage />}
        />
        <Route path="inventory-overview" element={<InventoryOverviewPage />} />
        <Route path="company-inventory" element={<CompanyInventoryPage />} />
        <Route path="project-inventory" element={<ProjectInventoryPage />} />
        <Route path="tenders" element={<TendersPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/:supplierId" element={<SupplierDetailsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="add-material" element={<AddMaterialPage />} />
        <Route path="upload-excel" element={<UploadExcelPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="role-management" element={<RoleManagementPage />} />
        <Route path="tutorial" element={<TutorialPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="edit-profile" element={<EditProfilePage />} />
        {/* Rutele de autentificare au fost eliminate pentru noua implementare */}
        <Route path="preferences" element={<PreferencesPage />} />
        <Route path="inventory-list" element={<InventoryListPage />} />
        <Route path="item/:id" element={<ItemDetailPage />} />
        <Route path="create-item" element={<CreateItemPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="import-export" element={<ImportExportPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="companies" element={<CompanyManagementPage />} />
        <Route path="companies/add" element={<AddCompanyPage />} />
        <Route
          path="companies/:companyId/users"
          element={<CompanyUsersPage />}
        />
        <Route path="site-admin" element={<SiteAdminPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="user-activity" element={<UserActivityPage />} />
        <Route path="ai-assistant" element={<AIInventoryAssistantPage />} />
        <Route path="forecast" element={<ForecastPage />} />
        <Route path="scan" element={<ScanPage />} />
        <Route path="tester" element={<TesterPage />} />
        <Route path="error-monitoring" element={<ErrorMonitoringPage />} />
        <Route path="os-report" element={<OSReportPage />} />
        <Route path="desktop-info" element={<DesktopInfoPage />} />
      </Route>
      {/* Add tempobook route to prevent catchall from capturing it */}
      {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
    </Routes>
  );
}

export default AppRoutes;
