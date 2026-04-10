"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StandSummary } from "@/types/stand";
import { standCoordinates } from "@/data/standCoordinates";
import { cn } from "@/lib/utils";

interface StandSearchProps {
  stands: StandSummary[];
  onSelect: (standId: number) => void;
}

export function StandSearch({ stands, onSelect }: StandSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const standsMap = useMemo(() => new Map(stands.map((s) => [s.id, s])), [stands]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return standCoordinates
      .filter((sc) => {
        const stand = standsMap.get(sc.id);
        const label = stand?.label || `Stand ${sc.id}`;
        return (
          sc.id.toString().includes(q) ||
          label.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [query, standsMap]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-[160px] sm:max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-triart-gray" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar stand..."
          className="pl-9 pr-8 h-10 bg-triart-gray-light border-0 rounded-xl text-sm placeholder:text-triart-gray/60 focus-visible:ring-1 focus-visible:ring-triart-green"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-triart-gray" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden z-50">
          {results.map((sc) => {
            const stand = standsMap.get(sc.id);
            const label = stand?.label || `Stand ${sc.id}`;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  onSelect(sc.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-triart-gray-light transition-apple",
                  "border-b border-black/5 last:border-0"
                )}
              >
                <div className="w-8 h-8 bg-triart-green/10 rounded-lg flex items-center justify-center text-sm font-semibold text-triart-green">
                  {sc.id}
                </div>
                <span className="text-sm text-triart-black font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
