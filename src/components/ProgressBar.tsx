import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: string; // Tailwind class
  icon?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, target, color, icon }) => {
  const percent = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-base font-medium">
          {icon && <span className="text-lg">{icon}</span>}
          <span>{label}</span>
        </div>
        <span className="text-sm text-gray-600 font-semibold">
          R$ {current.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {target.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({percent}%)
        </span>
      </div>
      <Progress
        value={percent}
        className="h-4 bg-gray-200 transition-all duration-700"
        indicatorClassName={cn("h-4 rounded-full transition-all duration-700", color)}
      />
    </div>
  );
}; 