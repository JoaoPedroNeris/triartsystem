"use client";

import { useState, useCallback } from "react";
import { useStand } from "@/hooks/useStand";
import { useAuth } from "@/hooks/useAuth";
import { StandChecklist as ChecklistType } from "@/types/stand";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@/components/ui/input";
import { StandNotes } from "./StandNotes";
import { StandPhotos } from "./StandPhotos";
import { StandChecklist } from "./StandChecklist";
import { StandMaterials } from "./StandMaterials";
import { StandTeam } from "./StandTeam";
import { StandOccurrences } from "./StandOccurrences";
import { StandFiles } from "./StandFiles";
import { StandProgress } from "./StandProgress";
import { calculateOverallProgress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  StickyNote,
  Camera,
  CheckSquare,
  Package,
  Users,
  AlertTriangle,
  FolderOpen,
  BarChart3,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

interface StandModalProps {
  standId: number | null;
  onClose: () => void;
}

const tabs = [
  { value: "notas", label: "Notas", icon: StickyNote },
  { value: "progresso", label: "Progresso", icon: BarChart3 },
  { value: "checklist", label: "Checklist", icon: CheckSquare },
  { value: "materiais", label: "Materiais", icon: Package },
  { value: "equipe", label: "Equipe", icon: Users },
  { value: "fotos", label: "Fotos", icon: Camera },
  { value: "ocorrencias", label: "Ocorrências", icon: AlertTriangle },
  { value: "arquivos", label: "Arquivos", icon: FolderOpen },
] as const;

type TabValue = (typeof tabs)[number]["value"];

export function StandModal({ standId, onClose }: StandModalProps) {
  const { stand, photos, occurrences, files, loading, updateField, refresh } =
    useStand(standId);
  const { user } = useAuth();
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("notas");

  const readOnly = user?.role !== "admin";
  const progress = stand ? calculateOverallProgress(stand.checklist) : 0;
  const openOccurrences = occurrences.filter((o) => o.status === "aberta").length;

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      await updateField("notes", notes);
    },
    [updateField]
  );

  async function handleToggleChecklist(category: keyof ChecklistType, itemId: string) {
    if (!stand || !standId) return;
    const items = stand.checklist[category];
    const item = items.find((i) => String(i.id) === itemId);
    if (!item) return;

    await fetch(`/api/stands/${standId}/checklist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ itemId: item.id, checked: !item.checked }),
    });
    await refresh();
  }

  async function handleLabelSave() {
    if (labelValue.trim()) {
      await updateField("label", labelValue.trim());
      await refresh();
    }
    setEditingLabel(false);
  }

  function startEditLabel() {
    if (readOnly || !stand) return;
    setLabelValue(stand.label);
    setEditingLabel(true);
  }

  async function handleClearStand() {
    if (!standId) return;
    if (!confirm("Tem certeza que deseja limpar todos os dados deste stand? Esta acao nao pode ser desfeita.")) return;

    await fetch(`/api/stands/${standId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await refresh();
  }

  function getProgressColor() {
    if (progress === 100) return "text-emerald-400";
    if (progress >= 60) return "text-triart-green";
    if (progress > 0) return "text-amber-400";
    return "text-neutral-500";
  }

  function getProgressStroke() {
    if (progress === 100) return "stroke-emerald-400";
    if (progress >= 60) return "stroke-triart-green";
    if (progress > 0) return "stroke-amber-400";
    return "stroke-neutral-700";
  }

  return (
    <Dialog.Root open={standId !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 sm:inset-4 z-50 mx-auto my-auto flex max-w-[1100px] max-h-[100dvh] sm:max-h-[92vh] flex-col overflow-hidden rounded-none sm:rounded-2xl bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]">

          {/* ── Header ── */}
          <div className="relative shrink-0 border-b border-neutral-100 bg-neutral-50/80 px-4 py-3 sm:px-7 sm:py-5">
            {/* Close */}
            <Dialog.Close className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-apple">
              <X className="w-4 h-4" />
            </Dialog.Close>

            <div className="flex items-center gap-3 sm:gap-5 pr-10">
              {/* Progress ring */}
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 shrink-0">
                <svg className="w-10 h-10 sm:w-14 sm:h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e5e5" strokeWidth="3" />
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 1.508} 150.8`}
                    className={cn("transition-all duration-700 ease-out", getProgressStroke())}
                  />
                </svg>
                <span className={cn("absolute inset-0 flex items-center justify-center text-[11px] sm:text-sm font-bold tracking-tight", getProgressColor())}>
                  {progress}<span className="text-[9px] font-medium">%</span>
                </span>
              </div>

              {/* Title area */}
              <div className="flex-1 min-w-0">
                <Dialog.Title className="text-sm font-medium text-neutral-400 tracking-wide uppercase">
                  Detalhes do Stand
                </Dialog.Title>
                {editingLabel ? (
                  <Input
                    value={labelValue}
                    onChange={(e) => setLabelValue(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
                    autoFocus
                    className="mt-0.5 h-9 text-base sm:text-xl font-bold bg-white border border-triart-green/40 rounded-lg w-full max-w-xs focus-visible:ring-2 focus-visible:ring-triart-green/30"
                  />
                ) : (
                  <h2 className="flex items-center gap-2 mt-0.5">
                    <span className="text-base sm:text-xl font-bold text-neutral-900 tracking-tight truncate">
                      {loading ? "Carregando..." : stand?.label || `Stand ${standId}`}
                    </span>
                    {!readOnly && !loading && (
                      <button onClick={startEditLabel} className="text-neutral-300 hover:text-triart-green transition-apple">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </h2>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-1.5 sm:mt-2">
                  {openOccurrences > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-red-600 ring-1 ring-red-100">
                      <AlertTriangle className="w-3 h-3" />
                      {openOccurrences} alerta{openOccurrences > 1 ? "s" : ""}
                    </span>
                  )}
                  {stand?.updatedBy && (
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:inline">
                      Atualizado por <span className="text-neutral-500 font-medium">{stand.updatedBy}</span>
                    </span>
                  )}
                  {!readOnly && !loading && (
                    <button
                      onClick={handleClearStand}
                      className="ml-auto rounded-lg p-2 sm:p-1.5 text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-apple"
                      title="Limpar todos os dados do stand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          {loading || !stand ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-9 h-9 border-[2.5px] border-triart-green border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-neutral-400 font-medium">Carregando dados...</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 min-h-0">
              {/* ── Sidebar ── */}
              <nav className="hidden md:flex w-52 shrink-0 flex-col border-r border-neutral-100 bg-neutral-50/50 p-3">
                <div className="flex flex-col gap-0.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    const hasAlert = tab.value === "ocorrencias" && openOccurrences > 0;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-left transition-all duration-200",
                          isActive
                            ? "bg-triart-green text-white shadow-md shadow-triart-green/25"
                            : "text-neutral-500 hover:text-neutral-800 hover:bg-white"
                        )}
                      >
                        <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-600")} />
                        <span className="flex-1">{tab.label}</span>
                        {hasAlert && (
                          <span className={cn(
                            "min-w-[20px] h-5 px-1 text-[10px] rounded-full flex items-center justify-center font-bold",
                            isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                          )}>
                            {openOccurrences}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* ── Mobile tabs ── */}
              <div className="flex md:hidden shrink-0 overflow-x-auto border-b border-neutral-100 bg-neutral-50/50 px-2 py-2 gap-1"
                style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" } as React.CSSProperties}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-apple",
                        isActive
                          ? "bg-triart-green text-white"
                          : "text-neutral-500 hover:text-neutral-700 hover:bg-white"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ── Content ── */}
              <div className="flex-1 min-w-0 overflow-y-auto">
                <div className="p-4 sm:p-7">
                  {activeTab === "notas" && (
                    <StandNotes notes={stand.notes} readOnly={readOnly} onSave={handleSaveNotes} />
                  )}
                  {activeTab === "progresso" && (
                    <StandProgress checklist={stand.checklist} />
                  )}
                  {activeTab === "checklist" && (
                    <StandChecklist
                      checklist={stand.checklist}
                      readOnly={readOnly}
                      onToggle={handleToggleChecklist}
                    />
                  )}
                  {activeTab === "materiais" && (
                    <StandMaterials
                      standId={stand.id}
                      materials={stand.materials}
                      readOnly={readOnly}
                      onRefresh={refresh}
                    />
                  )}
                  {activeTab === "equipe" && (
                    <StandTeam
                      standId={stand.id}
                      team={stand.team}
                      readOnly={readOnly}
                      onRefresh={refresh}
                    />
                  )}
                  {activeTab === "fotos" && (
                    <StandPhotos standId={stand.id} photos={photos} readOnly={readOnly} onRefresh={refresh} />
                  )}
                  {activeTab === "ocorrencias" && (
                    <StandOccurrences standId={stand.id} occurrences={occurrences} readOnly={readOnly} onRefresh={refresh} />
                  )}
                  {activeTab === "arquivos" && (
                    <StandFiles
                      standId={stand.id}
                      files={files}
                      driveLinks={stand.driveLinks}
                      readOnly={readOnly}
                      onRefresh={refresh}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
