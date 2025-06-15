import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminGuard from '@/components/AdminGuard';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';
import { SubscriptionProvider } from '@/hooks/useSubscription';

function App() {
  return (
    <Router>
      <QueryClient>
        <AuthProvider>
          <SubscriptionProvider>
            <UserProvider>
              <Toaster />
              <Routes>
                <Route path="/login" element={<Login />} />
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
      </QueryClient>
    </Router>
  );
}

export default App;
