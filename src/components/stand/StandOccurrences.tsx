"use client";

import { useState } from "react";
import { Occurrence } from "@/types/stand";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StandOccurrencesProps {
  standId: number;
  occurrences: Occurrence[];
  readOnly: boolean;
  onRefresh: () => Promise<void>;
}

const priorityConfig = {
  leve: { label: "Leve", color: "bg-blue-100 text-blue-700 border-blue-200" },
  media: { label: "Media", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  extrema: { label: "Extrema", color: "bg-red-100 text-red-700 border-red-200" },
};

export function StandOccurrences({ standId, occurrences, readOnly, onRefresh }: StandOccurrencesProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"leve" | "media" | "extrema">("media");

  const sorted = [...occurrences].sort((a, b) => {
    const order = { extrema: 0, media: 1, leve: 2 };
    if (a.status !== b.status) return a.status === "aberta" ? -1 : 1;
    return order[a.priority] - order[b.priority];
  });

  async function handleSubmit() {
    if (!title.trim()) return;
    await fetch(`/api/stands/${standId}/occurrences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        priority,
      }),
    });
    setTitle("");
    setDescription("");
    setPriority("media");
    setShowForm(false);
    await onRefresh();
  }

  async function handleResolve(occurrenceId: number) {
    await fetch(`/api/stands/${standId}/occurrences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ occurrenceId, resolved: true }),
    });
    await onRefresh();
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div>
          {showForm ? (
            <div className="space-y-3 p-3 sm:p-4 bg-triart-gray-light/50 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Nova Ocorrencia</h4>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4 text-triart-gray" />
                </button>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titulo da ocorrencia"
                className="h-10 bg-white border-0 rounded-xl text-sm"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descricao..."
                className="bg-white border-0 rounded-xl text-sm min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                {(["leve", "media", "extrema"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 sm:flex-none px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium border transition-apple",
                      priority === p
                        ? priorityConfig[p].color
                        : "bg-white text-triart-gray border-gray-200"
                    )}
                  >
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full h-10 bg-triart-green hover:bg-triart-green-dark rounded-xl"
              >
                Registrar Ocorrencia
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="w-full h-10 rounded-xl border-dashed border-2 border-triart-green/30 text-triart-green hover:bg-triart-green/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Ocorrencia
            </Button>
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-triart-gray text-center py-8">Nenhuma ocorrencia registrada.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((occ) => (
            <div
              key={occ.id}
              className={cn(
                "p-4 rounded-xl border transition-apple",
                occ.status === "resolvida"
                  ? "border-green-200 bg-green-50/50 opacity-70"
                  : "border-black/5 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-semibold border", priorityConfig[occ.priority].color)}
                    >
                      {priorityConfig[occ.priority].label}
                    </Badge>
                    {occ.status === "resolvida" && (
                      <Badge variant="outline" className="text-[10px] font-semibold bg-green-100 text-green-700 border-green-200">
                        Resolvida
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-triart-black">{occ.title}</h4>
                  {occ.description && (
                    <p className="text-xs text-triart-gray mt-1">{occ.description}</p>
                  )}
                  <p className="text-[10px] text-triart-gray mt-2">
                    {occ.createdAt
                      ? format(new Date(occ.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })
                      : ""}
                  </p>
                </div>
                {!readOnly && occ.status === "aberta" && (
                  <button
                    onClick={() => handleResolve(occ.id)}
                    className="shrink-0 w-10 h-10 sm:w-8 sm:h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-apple"
                    title="Marcar como resolvida"
                  >
                    <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {occurrences.filter((o) => o.status === "aberta").length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
          <span className="text-xs text-yellow-700">
            {occurrences.filter((o) => o.status === "aberta").length} ocorrencia(s) em aberto
          </span>
        </div>
      )}
    </div>
  );
}
