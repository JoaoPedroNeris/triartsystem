"use client";

import { useState, useCallback } from "react";
import { useStand } from "@/hooks/useStand";
import { useAuth } from "@/hooks/useAuth";
import { StandChecklist as ChecklistType } from "@/types/stand";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  function getProgressColor() {
    if (progress === 100) return "text-emerald-500";
    if (progress >= 60) return "text-triart-green";
    if (progress > 0) return "text-amber-500";
    return "text-triart-gray";
  }

  function getProgressRingColor() {
    if (progress === 100) return "stroke-emerald-500";
    if (progress >= 60) return "stroke-triart-green";
    if (progress > 0) return "stroke-amber-500";
    return "stroke-triart-gray-light";
  }

  return (
    <Dialog open={standId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-black/[0.04] bg-gradient-to-b from-triart-gray-light/40 to-transparent">
          <div className="flex items-center gap-4">
            {/* Progress ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-triart-gray-light"
                />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 1.257} 125.7`}
                  className={cn("transition-all duration-500", getProgressRingColor())}
                />
              </svg>
              <span className={cn("absolute inset-0 flex items-center justify-center text-xs font-bold", getProgressColor())}>
                {progress}%
              </span>
            </div>

            {/* Title & badges */}
            <div className="flex-1 min-w-0">
              {editingLabel ? (
                <Input
                  value={labelValue}
                  onChange={(e) => setLabelValue(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
                  autoFocus
                  className="h-9 text-lg font-semibold bg-white border border-triart-green/30 rounded-xl w-72 focus-visible:ring-1 focus-visible:ring-triart-green"
                />
              ) : (
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl font-bold text-triart-black tracking-tight">
                    {loading ? "Carregando..." : stand?.label || `Stand ${standId}`}
                  </span>
                  {!readOnly && !loading && (
                    <button onClick={startEditLabel} className="text-triart-gray hover:text-triart-green transition-apple">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </DialogTitle>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {openOccurrences > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px] font-semibold px-2 py-0">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {openOccurrences} alerta{openOccurrences > 1 ? "s" : ""}
                  </Badge>
                )}
                {stand?.updatedBy && (
                  <span className="text-[10px] text-triart-gray">
                    Atualizado por {stand.updatedBy}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading || !stand ? (
          <div className="flex items-center justify-center h-80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-triart-green border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-triart-gray">Carregando dados...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden" style={{ height: "calc(90vh - 110px)" }}>
            {/* Sidebar navigation */}
            <nav className="md:w-48 shrink-0 md:border-r border-b md:border-b-0 border-black/[0.04] bg-triart-gray-light/20">
              {/* Mobile: horizontal scroll */}
              <div className="flex md:hidden overflow-x-auto gap-1 p-2 scrollbar-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  const hasAlert = tab.value === "ocorrencias" && openOccurrences > 0;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-apple",
                        isActive
                          ? "bg-triart-green text-white shadow-sm"
                          : "text-triart-gray hover:text-triart-black hover:bg-white/60"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {hasAlert && (
                        <span className="w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                          {openOccurrences}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden md:flex flex-col gap-0.5 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  const hasAlert = tab.value === "ocorrencias" && openOccurrences > 0;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-apple relative",
                        isActive
                          ? "bg-triart-green text-white shadow-sm shadow-triart-green/20"
                          : "text-triart-gray hover:text-triart-black hover:bg-white/80"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{tab.label}</span>
                      {hasAlert && (
                        <span className={cn(
                          "w-5 h-5 text-[10px] rounded-full flex items-center justify-center font-bold",
                          isActive ? "bg-white/25 text-white" : "bg-red-500 text-white"
                        )}>
                          {openOccurrences}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Content area */}
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="p-6">
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
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
