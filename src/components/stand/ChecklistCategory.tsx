"use client";

import { ChecklistItem } from "@/types/stand";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ChecklistCategoryProps {
  items: ChecklistItem[];
  readOnly: boolean;
  onToggle: (itemId: string) => void;
}

export function ChecklistCategory({ items, readOnly, onToggle }: ChecklistCategoryProps) {
  const checked = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-triart-gray">
          {checked} de {items.length} concluidos
        </span>
        <div className="w-20 h-1.5 bg-triart-gray-light rounded-full overflow-hidden">
          <div
            className="h-full bg-triart-green rounded-full transition-all duration-300"
            style={{ width: `${items.length > 0 ? (checked / items.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !readOnly && onToggle(String(item.id))}
            disabled={readOnly}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-apple",
              readOnly ? "cursor-default" : "cursor-pointer hover:bg-triart-gray-light",
              item.checked && "opacity-70"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0",
                item.checked
                  ? "bg-triart-green border-triart-green"
                  : "border-gray-300"
              )}
            >
              {item.checked && <Check className="w-3 h-3 text-white" />}
            </div>
            <span
              className={cn(
                "text-sm",
                item.checked ? "line-through text-triart-gray" : "text-triart-black"
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
