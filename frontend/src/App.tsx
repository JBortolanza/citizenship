import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { ForgotPasswordPage } from "./pages/ForgotPassword";
import { ResetPasswordPage } from "./pages/ResetPassword.tsx";
import { RecoverAccountRequestPage } from "./pages/RecoverAccountRequest.tsx";
import { RecoverAccountPage } from "./pages/RecoverAccount.tsx";
import { DashboardPage } from "./pages/Dashboard.tsx";
import { PageTransition } from "./components/ui/page-transition";
import { useAuthStore } from "./store/auth";
import { useEffect } from "react";

// A simple component to protect private routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show a blank screen or loading spinner while checking the cookie
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />

        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          }
        />
        <Route
          path="/forgotpassword"
          element={
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/recover-request"
          element={
            <PageTransition>
              <RecoverAccountRequestPage />
            </PageTransition>
          }
        />
        <Route
          path="/recover-account"
          element={
            <PageTransition>
              <RecoverAccountPage />
            </PageTransition>
          }
        />

        {/* PRIVATE ROUTES */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PageTransition>
                <DashboardPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        {/*Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/*Catch-all for 404s */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
