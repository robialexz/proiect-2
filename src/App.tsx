import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";

// Import layout component
const AppLayout = lazy(() => import("./components/layout/AppLayout"));

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const OverviewPage = lazy(() => import("./pages/OverviewPage"));
// Import pages that need to be available immediately
import InventoryManagementPage from "./pages/InventoryManagementPage";

// Lazy load additional project management pages
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const TeamsPage = lazy(() => import("./pages/TeamsPage"));
const BudgetPage = lazy(() => import("./pages/BudgetPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AddMaterialPage = lazy(() => import("./pages/AddMaterialPage"));
const UploadExcelPage = lazy(() => import("./pages/UploadExcelPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
              Loading...
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
              <Route path="add-material" element={<AddMaterialPage />} />
              <Route path="upload-excel" element={<UploadExcelPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="documents" element={<DocumentsPage />} />
            </Route>
            {/* Add tempobook route to prevent catchall from capturing it */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </Suspense>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
