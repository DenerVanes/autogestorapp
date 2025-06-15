
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HistoryHeaderProps {
  onBack: () => void;
}

const HistoryHeader = ({ onBack }: HistoryHeaderProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Histórico de Lançamentos</h1>
        </div>
      </div>
    </div>
  );
};

export default HistoryHeader;
