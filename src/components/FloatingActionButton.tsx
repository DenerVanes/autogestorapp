
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingDown, Car, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionType = 'receita' | 'despesa' | 'odometro' | 'horas';

interface FloatingActionButtonProps {
  onAction: (type: ActionType) => void;
}

const FloatingActionButton = ({ onAction }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      type: 'receita' as ActionType,
      label: 'Nova Receita',
      icon: DollarSign,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600'
    },
    {
      type: 'despesa' as ActionType,
      label: 'Nova Despesa',
      icon: TrendingDown,
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-600'
    },
    {
      type: 'odometro' as ActionType,
      label: 'Registrar Odômetro',
      icon: Car,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600'
    },
    {
      type: 'horas' as ActionType,
      label: 'Registrar Horas Trabalhadas',
      icon: Clock,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600'
    }
  ];

  const handleActionClick = (type: ActionType) => {
    onAction(type);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => (
            <div
              key={action.type}
              className={cn(
                "flex items-center space-x-3 transition-all duration-300 transform",
                isOpen 
                  ? "translate-y-0 opacity-100" 
                  : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <span className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
              <Button
                size="lg"
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg transition-all duration-300",
                  action.color
                )}
                onClick={() => handleActionClick(action.type)}
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-gray-500 hover:bg-gray-600 rotate-45" 
            : "bg-orange-500 hover:bg-orange-600"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
