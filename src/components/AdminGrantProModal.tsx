import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminService, UserSearchResult } from "@/services/adminService";

interface AdminGrantProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminGrantProModal = ({ isOpen, onClose }: AdminGrantProModalProps) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users = await adminService.searchUsers(search);
      setResults(users);
    } catch (e) {
      toast.error("Erro ao buscar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantOrRevoke = async (user: UserSearchResult, grant: boolean) => {
    setActionLoading(true);
    try {
      await adminService.setUserProStatus(user.id, grant);
      toast.success(grant ? "Acesso PRO concedido!" : "Acesso PRO revogado!");
      // Atualiza status local
      setResults(results => results.map(u => u.id === user.id ? { ...u, current_plan: grant ? "pro" : null, subscription_status: grant ? "active" : "expired" } : u));
    } catch (e) {
      toast.error("Erro ao atualizar status PRO");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar PRO</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nome ou email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <Button onClick={handleSearch} disabled={loading || !search}>
              Buscar
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.length === 0 && <div className="text-sm text-muted-foreground">Nenhum usuário encontrado.</div>}
            {results.map(user => (
              <div key={user.id} className="flex items-center justify-between border rounded px-3 py-2">
                <div>
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="text-xs mt-1">
                    Status PRO: {user.current_plan === 'pro' && user.subscription_status === 'active' ? <span className="text-green-600 font-semibold">Ativo</span> : <span className="text-red-600 font-semibold">Inativo</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.current_plan === 'pro' && user.subscription_status === 'active' ? (
                    <Button variant="destructive" size="sm" disabled={actionLoading} onClick={() => handleGrantOrRevoke(user, false)}>
                      Revogar PRO
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" disabled={actionLoading} onClick={() => handleGrantOrRevoke(user, true)}>
                      Conceder PRO
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminGrantProModal; 