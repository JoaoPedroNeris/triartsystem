"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface OverallProgressProps {
  progress: number;
  totalStands: number;
  completedStands: number;
}

export function OverallProgress({ progress, totalStands, completedStands }: OverallProgressProps) {
  const data = [
    { value: progress },
    { value: 100 - progress },
  ];

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-2xl border border-black/5 shadow-sm">
      <h3 className="text-sm font-medium text-triart-gray mb-3 sm:mb-4">Progresso da Feira</h3>
      <div className="relative w-28 h-28 sm:w-40 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-triart-black">{progress}%</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="text-center">
          <p className="text-xl font-bold text-triart-black">{completedStands}</p>
          <p className="text-xs text-triart-gray">Concluidos</p>
        </div>
        <div className="w-px h-8 bg-black/10" />
        <div className="text-center">
          <p className="text-xl font-bold text-triart-black">{totalStands}</p>
          <p className="text-xs text-triart-gray">Total</p>
        </div>
      </div>
    </div>
  );
}
