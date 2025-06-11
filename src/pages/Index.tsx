
import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import { UserProvider } from "@/contexts/UserContext";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <UserProvider>
      <div className="min-h-screen">
        {!isAuthenticated ? (
          <LoginScreen onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <Dashboard />
        )}
      </div>
    </UserProvider>
  );
};

export default Index;
