
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import { UserProvider } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <div className="min-h-screen">
        {!user ? (
          <LoginScreen />
        ) : (
          <Dashboard />
        )}
      </div>
    </UserProvider>
  );
};

export default Index;
