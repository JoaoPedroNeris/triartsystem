"use client";

import { useState } from "react";
import { StandSummary } from "@/types/stand";
import { cn } from "@/lib/utils";

interface StandSummaryTableProps {
  stands: StandSummary[];
  onStandClick: (id: number) => void;
}

type SortKey = "id" | "label" | "eletrica" | "marcenaria" | "tapecaria" | "comunicacaoVisual" | "total";

function getProgressColor(val: number) {
  if (val === 0) return "text-gray-400";
  if (val < 33) return "text-red-600 bg-red-50";
  if (val < 67) return "text-yellow-600 bg-yellow-50";
  return "text-green-600 bg-green-50";
}

export function StandSummaryTable({ stands, onStandClick }: StandSummaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const rows = stands.map((s) => ({
    id: s.id,
    label: s.label,
    eletrica: s.progress?.eletrica ?? 0,
    marcenaria: s.progress?.marcenaria ?? 0,
    tapecaria: s.progress?.tapecaria ?? 0,
    comunicacaoVisual: s.progress?.comunicacaoVisual ?? 0,
    total: s.progress?.overall ?? 0,
  }));

  rows.sort((a, b) => {
    let valA: string | number = a[sortKey as keyof typeof a] as string | number;
    let valB: string | number = b[sortKey as keyof typeof b] as string | number;
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: "id", label: "#", className: "w-12" },
    { key: "label", label: "Stand" },
    { key: "eletrica", label: "Eletrica", className: "w-20 text-center" },
    { key: "marcenaria", label: "Marcen.", className: "w-20 text-center" },
    { key: "tapecaria", label: "Tapec.", className: "w-20 text-center" },
    { key: "comunicacaoVisual", label: "Com.Vis.", className: "w-20 text-center" },
    { key: "total", label: "Total", className: "w-20 text-center" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-triart-gray uppercase tracking-wider cursor-pointer hover:text-triart-black transition-colors select-none",
                    col.className
                  )}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onStandClick(row.id)}
                className="border-b border-black/5 last:border-0 hover:bg-triart-gray-light/50 cursor-pointer transition-apple"
              >
                <td className="px-4 py-3 text-xs font-medium text-triart-gray">{row.id}</td>
                <td className="px-4 py-3 font-medium text-triart-black">{row.label}</td>
                {(["eletrica", "marcenaria", "tapecaria", "comunicacaoVisual", "total"] as const).map(
                  (key) => (
                    <td key={key} className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                          getProgressColor(row[key])
                        )}
                      >
                        {row[key]}%
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
