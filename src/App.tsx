
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminGuard from '@/components/AdminGuard';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';
import { SubscriptionProvider } from '@/hooks/useSubscription';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SubscriptionProvider>
            <UserProvider>
              <Toaster />
              <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />
              </Routes>
            </UserProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
