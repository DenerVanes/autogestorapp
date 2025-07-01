import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { UserProvider, useUser } from "@/contexts/UserContext";
import AuthGuard from "@/components/AuthGuard";
import AdminGuard from "@/components/AdminGuard";
import Dashboard from "@/components/Dashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import LandingPage from "@/components/LandingPage";
import SignUpPage from "@/components/SignUpPage";
import LoginScreen from "@/components/LoginScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from 'react';
import HistoryPage from "@/components/HistoryPage";

const queryClient = new QueryClient();

// Componente interno para conter a lógica dos hooks
const AppContent = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route 
        path="/dashboard" 
        element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AuthGuard>
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          </AuthGuard>
        } 
      />
      <Route 
        path="/historico" 
        element={
          <AuthGuard>
            <HistoryPage onBack={() => window.history.back()} />
          </AuthGuard>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <AppContent />
            <Toaster />
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
