import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { AdvancedRoleProvider } from "./contexts/AdvancedRoleContext";
import { OfflineProvider } from "./contexts/OfflineContext";

// Import layout component - preload pentru performanță mai bună
import AppLayout from "./components/layout/AppLayout";

// Import pages that need to be available immediately for better performance
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OverviewPage from "./pages/OverviewPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";

// Lazy load less frequently used pages
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

// Lazy load additional project management pages
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const TeamsPage = lazy(() => import("./pages/TeamsPage"));
const BudgetPage = lazy(() => import("./pages/BudgetPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AddMaterialPage = lazy(() => import("./pages/AddMaterialPage"));
const UploadExcelPage = lazy(() => import("./pages/UploadExcelPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const RoleManagementPage = lazy(() => import("./pages/RoleManagementPage"));
const TutorialPage = lazy(() => import("./pages/TutorialPage"));

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AdvancedRoleProvider>
          <OfflineProvider>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes inside AppLayout */}
            <Route path="/" element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="inventory-management" element={<InventoryManagementPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
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
            </Route>
            {/* Add tempobook route to prevent catchall from capturing it */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          </Suspense>
          </OfflineProvider>
        </AdvancedRoleProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
