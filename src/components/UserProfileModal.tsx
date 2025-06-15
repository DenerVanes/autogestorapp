
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { user, updateUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
    vehicleModel: "",
    fuelConsumption: ""
  });

  // Load user data when modal opens or user data changes
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        vehicleType: user.vehicleType || "",
        vehicleModel: user.vehicleModel || "",
        fuelConsumption: user.fuelConsumption?.toString() || ""
      });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.vehicleType) {
      toast.error("Tipo de veículo é obrigatório");
      return;
    }
    if (!formData.vehicleModel.trim()) {
      toast.error("Modelo do veículo é obrigatório");
      return;
    }
    
    const consumption = parseFloat(formData.fuelConsumption);
    if (isNaN(consumption) || consumption <= 0) {
      toast.error("Consumo médio é obrigatório e deve ser um número maior que zero");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        name: formData.name,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        fuelConsumption: consumption
      });
      toast.success("Perfil atualizado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações do Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do usuário *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleType">Tipo de veículo *</Label>
            <Select value={formData.vehicleType} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Carro">Carro</SelectItem>
                <SelectItem value="Moto">Moto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Modelo do veículo *</Label>
            <Input
              id="vehicleModel"
              value={formData.vehicleModel}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
              placeholder="Ex: Honda Civic, Honda CB 600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelConsumption">Consumo médio (km/litro) *</Label>
            <Input
              id="fuelConsumption"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.fuelConsumption}
              onChange={(e) => setFormData(prev => ({ ...prev, fuelConsumption: e.target.value }))}
              placeholder="Ex: 10.5"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
