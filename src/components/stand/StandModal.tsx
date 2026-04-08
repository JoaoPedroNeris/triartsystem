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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function StandModal({ standId, onClose }: StandModalProps) {
  const { stand, photos, occurrences, files, loading, updateField, refresh } =
    useStand(standId);
  const { user } = useAuth();
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState("");

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

  return (
    <Dialog open={standId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {editingLabel ? (
                <Input
                  value={labelValue}
                  onChange={(e) => setLabelValue(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
                  autoFocus
                  className="h-9 text-lg font-semibold bg-triart-gray-light/50 border-0 rounded-xl w-64"
                />
              ) : (
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-triart-black">
                    {loading ? "Carregando..." : stand?.label || `Stand ${standId}`}
                  </span>
                  {!readOnly && !loading && (
                    <button onClick={startEditLabel} className="text-triart-gray hover:text-triart-green transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </DialogTitle>
              )}
              <Badge
                variant="outline"
                className={
                  progress === 100
                    ? "bg-green-100 text-green-700 border-green-200"
                    : progress > 0
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }
              >
                {progress}%
              </Badge>
              {openOccurrences > 0 && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  {openOccurrences} alerta{openOccurrences > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading || !stand ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-triart-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="notas" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="mx-6 mt-4 bg-triart-gray-light rounded-xl p-1 h-auto flex flex-wrap gap-0">
              <TabsTrigger value="notas" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <StickyNote className="w-3.5 h-3.5" />
                Notas
              </TabsTrigger>
              <TabsTrigger value="fotos" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                Fotos
              </TabsTrigger>
              <TabsTrigger value="checklist" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CheckSquare className="w-3.5 h-3.5" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="materiais" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Package className="w-3.5 h-3.5" />
                Materiais
              </TabsTrigger>
              <TabsTrigger value="equipe" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="w-3.5 h-3.5" />
                Equipe
              </TabsTrigger>
              <TabsTrigger value="ocorrencias" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
                <AlertTriangle className="w-3.5 h-3.5" />
                Ocorrencias
                {openOccurrences > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
                    {openOccurrences}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="arquivos" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FolderOpen className="w-3.5 h-3.5" />
                Arquivos
              </TabsTrigger>
              <TabsTrigger value="progresso" className="rounded-lg text-xs gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="w-3.5 h-3.5" />
                Progresso
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 pb-6 pt-4" style={{ maxHeight: "calc(90vh - 180px)" }}>
              <TabsContent value="notas" className="mt-0">
                <StandNotes notes={stand.notes} readOnly={readOnly} onSave={handleSaveNotes} />
              </TabsContent>
              <TabsContent value="fotos" className="mt-0">
                <StandPhotos standId={stand.id} photos={photos} readOnly={readOnly} onRefresh={refresh} />
              </TabsContent>
              <TabsContent value="checklist" className="mt-0">
                <StandChecklist
                  checklist={stand.checklist}
                  readOnly={readOnly}
                  onToggle={handleToggleChecklist}
                />
              </TabsContent>
              <TabsContent value="materiais" className="mt-0">
                <StandMaterials
                  standId={stand.id}
                  materials={stand.materials}
                  readOnly={readOnly}
                  onRefresh={refresh}
                />
              </TabsContent>
              <TabsContent value="equipe" className="mt-0">
                <StandTeam
                  standId={stand.id}
                  team={stand.team}
                  readOnly={readOnly}
                  onRefresh={refresh}
                />
              </TabsContent>
              <TabsContent value="ocorrencias" className="mt-0">
                <StandOccurrences standId={stand.id} occurrences={occurrences} readOnly={readOnly} onRefresh={refresh} />
              </TabsContent>
              <TabsContent value="arquivos" className="mt-0">
                <StandFiles
                  standId={stand.id}
                  files={files}
                  driveLinks={stand.driveLinks}
                  readOnly={readOnly}
                  onRefresh={refresh}
                />
              </TabsContent>
              <TabsContent value="progresso" className="mt-0">
                <StandProgress checklist={stand.checklist} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
