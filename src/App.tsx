import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { AdvancedRoleProvider } from "./contexts/AdvancedRoleContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import { useToast } from "./components/ui/use-toast";

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
import CompanyInventoryPage from "./pages/CompanyInventoryPage";

// Lazy load less frequently used pages
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

const NotificationsDemo = lazy(() => import("./pages/NotificationsDemo"));
const TestDashboardPage = lazy(() => import("./pages/TestDashboardPage"));

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
const TasksPage = lazy(() => import("./pages/TasksPage"));

// Lazy load new pages
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));
const InventoryListPage = lazy(() => import("./pages/InventoryListPage"));
const ItemDetailPage = lazy(() => import("./pages/ItemDetailPage"));
const CreateItemPage = lazy(() => import("./pages/CreateItemPage"));
const CategoryManagementPage = lazy(
  () => import("./pages/CategoryManagementPage")
);
const ImportExportPage = lazy(() => import("./pages/ImportExportPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const UsersManagementPage = lazy(() => import("./pages/UsersManagementPage"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));
const AIInventoryAssistantPage = lazy(
  () => import("./pages/AIInventoryAssistantPage")
);
const ForecastPage = lazy(() => import("./pages/ForecastPage"));
const ScanPage = lazy(() => import("./pages/ScanPage"));

import ChatBotWidget from "./components/ai/ChatBotWidget";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handler pentru evenimentul session-expired
  useEffect(() => {
    const handleSessionExpired = (event: any) => {
      console.log("Session expired event received");

      // Afișăm un mesaj de notificare utilizatorului
      toast({
        title: "Sesiune expirată",
        description:
          event.detail?.message ||
          "Sesiunea a expirat. Vă rugăm să vă autentificați din nou.",
        variant: "destructive",
      });

      // Redirecționăm către pagina de login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [navigate, toast]);
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
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                  path="/notifications-demo"
                  element={<NotificationsDemo />}
                />

                {/* Protected routes inside AppLayout */}
                <Route path="/" element={<AppLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="overview" element={<OverviewPage />} />
                  <Route
                    path="inventory-management"
                    element={<InventoryManagementPage />}
                  />
                  <Route
                    path="company-inventory"
                    element={<CompanyInventoryPage />}
                  />
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
                  <Route
                    path="role-management"
                    element={<RoleManagementPage />}
                  />
                  <Route path="tutorial" element={<TutorialPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="edit-profile" element={<EditProfilePage />} />
                  <Route
                    path="change-password"
                    element={<ChangePasswordPage />}
                  />
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route path="preferences" element={<PreferencesPage />} />
                  <Route
                    path="inventory-list"
                    element={<InventoryListPage />}
                  />
                  <Route path="item/:id" element={<ItemDetailPage />} />
                  <Route path="create-item" element={<CreateItemPage />} />
                  <Route
                    path="categories"
                    element={<CategoryManagementPage />}
                  />
                  <Route path="import-export" element={<ImportExportPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="users" element={<UsersManagementPage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                  <Route
                    path="ai-assistant"
                    element={<AIInventoryAssistantPage />}
                  />
                  <Route path="forecast" element={<ForecastPage />} />
                  <Route path="scan" element={<ScanPage />} />
                  <Route
                    path="test-dashboard"
                    element={<TestDashboardPage />}
                  />
                </Route>
                {/* Add tempobook route to prevent catchall from capturing it */}
                {import.meta.env.VITE_TEMPO === "true" && (
                  <Route path="/tempobook/*" />
                )}
              </Routes>
              {/* Show chatbot only on protected routes */}
              {location.pathname.startsWith("/") &&
                ![
                  "/login",
                  "/register",
                  "/forgot-password",
                  "/reset-password",
                ].includes(location.pathname) && <ChatBotWidget />}
            </Suspense>
          </OfflineProvider>
        </AdvancedRoleProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
