"use client";

import { useState } from "react";
import { Material } from "@/types/stand";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandMaterialsProps {
  standId: number;
  materials: Material[];
  readOnly: boolean;
  onRefresh: () => Promise<void>;
}

export function StandMaterials({ standId, materials, readOnly, onRefresh }: StandMaterialsProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const confirmed = materials.filter((m) => m.confirmed).length;

  async function handleAdd() {
    if (!name.trim()) return;
    await fetch(`/api/stands/${standId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: name.trim(), quantity: parseInt(quantity) || 1 }),
    });
    setName("");
    setQuantity("");
    await onRefresh();
  }

  async function handleToggle(mat: Material) {
    await fetch(`/api/stands/${standId}/materials`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ materialId: mat.id, confirmed: !mat.confirmed }),
    });
    await onRefresh();
  }

  async function handleRemove(id: number) {
    await fetch(`/api/stands/${standId}/materials`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ materialId: id }),
    });
    await onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-triart-green" />
          <h3 className="text-sm font-medium text-triart-black">Materiais</h3>
        </div>
        <span className="text-xs text-triart-gray">
          {confirmed} de {materials.length} confirmados
        </span>
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do material"
            className="flex-1 h-10 bg-triart-gray-light/50 border-0 rounded-xl text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qtd"
            type="number"
            min={1}
            className="w-20 h-10 bg-triart-gray-light/50 border-0 rounded-xl text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={!name.trim()}
            size="icon"
            className="h-10 w-10 bg-triart-green hover:bg-triart-green-dark rounded-xl shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {materials.length === 0 ? (
        <p className="text-sm text-triart-gray text-center py-8">Nenhum material adicionado.</p>
      ) : (
        <div className="space-y-1">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-apple",
                mat.confirmed && "opacity-70"
              )}
            >
              <button
                onClick={() => !readOnly && handleToggle(mat)}
                disabled={readOnly}
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                  mat.confirmed ? "bg-triart-green border-triart-green" : "border-gray-300",
                  !readOnly && "cursor-pointer"
                )}
              >
                {mat.confirmed && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm", mat.confirmed && "line-through text-triart-gray")}>
                  {mat.name}
                </span>
              </div>
              <span className="text-xs text-triart-gray bg-triart-gray-light px-2 py-0.5 rounded-full">
                x{mat.quantity}
              </span>
              {!readOnly && (
                <button
                  onClick={() => handleRemove(mat.id)}
                  className="text-triart-gray hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
