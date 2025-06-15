import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserProvider } from "@/contexts/UserContext";
import AuthGuard from "@/components/AuthGuard";
import LandingPage from "@/components/LandingPage";
import SignUpPage from "@/components/SignUpPage";
import LoginScreen from "@/components/LoginScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "@/components/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
