"use client";

import { useState } from "react";
import { StandTeam as TeamType } from "@/types/stand";
import { Input } from "@/components/ui/input";
import { Plus, X, Hammer, Clapperboard } from "lucide-react";

interface StandTeamProps {
  standId: number;
  team: TeamType;
  readOnly: boolean;
  onRefresh: () => Promise<void>;
}

function TeamSection({
  label,
  icon: Icon,
  members,
  readOnly,
  onAdd,
  onRemove,
}: {
  label: string;
  icon: React.ElementType;
  members: string[];
  readOnly: boolean;
  onAdd: (name: string) => void;
  onRemove: (index: number) => void;
}) {
  const [name, setName] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-triart-green/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-triart-green" />
        </div>
        <h4 className="text-sm font-medium text-triart-black">{label}</h4>
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do membro"
            className="flex-1 h-11 bg-triart-gray-light/50 border-0 rounded-xl text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="h-11 w-11 sm:h-11 sm:w-11 bg-triart-green hover:bg-triart-green-dark text-white rounded-xl flex items-center justify-center shrink-0 transition-apple disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {members.length === 0 ? (
          <p className="text-xs text-triart-gray">Nenhum membro adicionado.</p>
        ) : (
          members.map((member, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 bg-triart-green/10 rounded-full"
            >
              <span className="text-sm text-triart-green-dark font-medium">{member}</span>
              {!readOnly && (
                <button
                  onClick={() => onRemove(i)}
                  className="p-1 text-triart-green/60 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function StandTeam({ standId, team, readOnly, onRefresh }: StandTeamProps) {
  async function addMember(group: "marcenaria" | "producao", name: string) {
    await fetch(`/api/stands/${standId}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ team: group, name }),
    });
    await onRefresh();
  }

  async function removeMember(group: "marcenaria" | "producao", index: number) {
    const name = group === "marcenaria" ? team.marcenaria[index] : team.producao[index];
    await fetch(`/api/stands/${standId}/team`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ team: group, name }),
    });
    await onRefresh();
  }

  return (
    <div className="space-y-6">
      <TeamSection
        label="Equipe de Marcenaria"
        icon={Hammer}
        members={team.marcenaria}
        readOnly={readOnly}
        onAdd={(name) => addMember("marcenaria", name)}
        onRemove={(i) => removeMember("marcenaria", i)}
      />
      <TeamSection
        label="Equipe de Producao"
        icon={Clapperboard}
        members={team.producao}
        readOnly={readOnly}
        onAdd={(name) => addMember("producao", name)}
        onRemove={(i) => removeMember("producao", i)}
      />
    </div>
  );
}
