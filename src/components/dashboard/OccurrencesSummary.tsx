"use client";

import { Occurrence } from "@/types/stand";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface OccurrencesSummaryProps {
  occurrences: Occurrence[];
}

export function OccurrencesSummary({ occurrences }: OccurrencesSummaryProps) {
  const open = occurrences.filter((o) => o.status === "aberta");
  const extremas = open.filter((o) => o.priority === "extrema");
  const medias = open.filter((o) => o.priority === "media");
  const leves = open.filter((o) => o.priority === "leve");

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-3 sm:space-y-4">
      <h3 className="text-sm font-medium text-triart-gray">Ocorrencias em Aberto</h3>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className={cn("p-3 sm:p-4 rounded-xl text-center", extremas.length > 0 ? "bg-red-50" : "bg-gray-50")}>
          <AlertTriangle className={cn("w-5 h-5 mx-auto mb-1", extremas.length > 0 ? "text-red-500" : "text-gray-400")} />
          <p className={cn("text-2xl font-bold", extremas.length > 0 ? "text-red-600" : "text-gray-400")}>
            {extremas.length}
          </p>
          <p className="text-xs text-triart-gray">Extremas</p>
        </div>
        <div className={cn("p-3 sm:p-4 rounded-xl text-center", medias.length > 0 ? "bg-yellow-50" : "bg-gray-50")}>
          <AlertCircle className={cn("w-5 h-5 mx-auto mb-1", medias.length > 0 ? "text-yellow-500" : "text-gray-400")} />
          <p className={cn("text-2xl font-bold", medias.length > 0 ? "text-yellow-600" : "text-gray-400")}>
            {medias.length}
          </p>
          <p className="text-xs text-triart-gray">Medias</p>
        </div>
        <div className={cn("p-3 sm:p-4 rounded-xl text-center", leves.length > 0 ? "bg-blue-50" : "bg-gray-50")}>
          <Info className={cn("w-5 h-5 mx-auto mb-1", leves.length > 0 ? "text-blue-500" : "text-gray-400")} />
          <p className={cn("text-2xl font-bold", leves.length > 0 ? "text-blue-600" : "text-gray-400")}>
            {leves.length}
          </p>
          <p className="text-xs text-triart-gray">Leves</p>
        </div>
      </div>

      {extremas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-red-600 uppercase tracking-wider">Alertas Criticos</h4>
          {extremas.slice(0, 5).map((occ) => (
            <div key={occ.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-triart-black truncate">{occ.title}</p>
                <p className="text-xs text-triart-gray">Stand {occ.standId}</p>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                Extrema
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
