"use client";

import { StandChecklist } from "@/types/stand";
import { calculateCategoryProgress, calculateOverallProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Zap, Hammer, Sofa, Palette } from "lucide-react";

interface StandProgressProps {
  checklist: StandChecklist;
}

const categories: {
  key: keyof StandChecklist;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "eletrica", label: "Eletrica", icon: Zap },
  { key: "marcenaria", label: "Marcenaria", icon: Hammer },
  { key: "tapecaria", label: "Tapecaria", icon: Sofa },
  { key: "comunicacaoVisual", label: "Com. Visual", icon: Palette },
];

function DonutChart({ progress }: { progress: number }) {
  const data = [
    { value: progress },
    { value: 100 - progress },
  ];

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={40}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#2BA89D" />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-triart-black">{progress}%</span>
      </div>
    </div>
  );
}

export function StandProgress({ checklist }: StandProgressProps) {
  const overall = calculateOverallProgress(checklist);

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="p-4 bg-triart-green/5 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-triart-black">Progresso Geral</span>
          <span className="text-2xl font-bold text-triart-green">{overall}%</span>
        </div>
        <Progress value={overall} className="h-2.5" />
      </div>

      {/* Per-category donuts */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {categories.map(({ key, label, icon: Icon }) => {
          const progress = calculateCategoryProgress(checklist[key]);
          return (
            <div key={key} className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-xl border border-black/5">
              <DonutChart progress={progress} />
              <div className="flex items-center gap-1.5 mt-2">
                <Icon className="w-3.5 h-3.5 text-triart-green" />
                <span className="text-xs font-medium text-triart-black">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
