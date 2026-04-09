"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStands } from "@/hooks/useStands";
import { useAuth } from "@/hooks/useAuth";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { StandSearch } from "@/components/map/StandSearch";
import { StandModal } from "@/components/stand/StandModal";
import { ViewToggle } from "@/components/layout/ViewToggle";
import { OverallProgress } from "@/components/dashboard/OverallProgress";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { OccurrencesSummary } from "@/components/dashboard/OccurrencesSummary";
import { StandSummaryTable } from "@/components/dashboard/StandSummaryTable";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Occurrence } from "@/types/stand";
import { Zap, Hammer, Sofa, Palette } from "lucide-react";

function EventoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { stands, loading } = useStands();
  const { user } = useAuth();
  const role = user?.role;

  const [view, setView] = useState<"mapa" | "dashboard">(
    (searchParams.get("view") as "mapa" | "dashboard") || "mapa"
  );
  const [selectedStandId, setSelectedStandId] = useState<number | null>(null);
  const [allOccurrences, setAllOccurrences] = useState<Occurrence[]>([]);

  const handleViewChange = useCallback((v: "mapa" | "dashboard") => {
    setView(v);
    router.replace(`/evento?view=${v}`, { scroll: false });
  }, [router]);

  const handleStandClick = useCallback((id: number) => {
    if (role === "visitante") return;
    setSelectedStandId(id);
  }, [role]);

  useEffect(() => {
    async function fetchOccurrences() {
      try {
        const res = await fetch("/api/stands/0/occurrences?all=true", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAllOccurrences(data.occurrences ?? []);
        }
      } catch {
        // ignore
      }
    }
    fetchOccurrences();
  }, [stands]);

  const avgProgress = stands.length > 0
    ? Math.round(stands.reduce((acc, s) => acc + (s.progress?.overall ?? 0), 0) / stands.length)
    : 0;

  const completedStands = stands.filter((s) => (s.progress?.overall ?? 0) === 100).length;

  const avgEletrica = stands.length > 0
    ? Math.round(stands.reduce((a, s) => a + (s.progress?.eletrica ?? 0), 0) / stands.length)
    : 0;
  const avgMarcenaria = stands.length > 0
    ? Math.round(stands.reduce((a, s) => a + (s.progress?.marcenaria ?? 0), 0) / stands.length)
    : 0;
  const avgTapecaria = stands.length > 0
    ? Math.round(stands.reduce((a, s) => a + (s.progress?.tapecaria ?? 0), 0) / stands.length)
    : 0;
  const avgComVisual = stands.length > 0
    ? Math.round(stands.reduce((a, s) => a + (s.progress?.comunicacaoVisual ?? 0), 0) / stands.length)
    : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-triart-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-16 z-40 glass border-b border-black/5">
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 max-w-[1920px] mx-auto">
          <StandSearch stands={stands} onSelect={handleStandClick} />
          <ViewToggle view={view} onChange={handleViewChange} />
          {role !== "visitante" && view === "dashboard" && (
            <ExportButton stands={stands} occurrences={allOccurrences} />
          )}
        </div>
      </div>

      {view === "mapa" ? (
        <div className="flex-1 p-4 md:p-6">
          <div className="h-[calc(100dvh-140px)] sm:h-[calc(100vh-180px)] max-w-[1920px] mx-auto">
            <InteractiveMap
              stands={stands}
              selectedStandId={selectedStandId}
              onStandClick={handleStandClick}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 p-3 sm:p-4 md:p-6 max-w-[1920px] mx-auto w-full space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
            <OverallProgress
              progress={avgProgress}
              totalStands={stands.length}
              completedStands={completedStands}
            />
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <CategoryChart label="Eletrica" icon={Zap} progress={avgEletrica} />
              <CategoryChart label="Marcenaria" icon={Hammer} progress={avgMarcenaria} />
              <CategoryChart label="Tapecaria" icon={Sofa} progress={avgTapecaria} />
              <CategoryChart label="Com. Visual" icon={Palette} progress={avgComVisual} />
            </div>
          </div>

          <OccurrencesSummary occurrences={allOccurrences} />

          <div>
            <h3 className="text-sm font-medium text-triart-gray mb-3">Todos os Stands</h3>
            <StandSummaryTable stands={stands} onStandClick={handleStandClick} />
          </div>
        </div>
      )}

      <StandModal standId={selectedStandId} onClose={() => setSelectedStandId(null)} />
    </div>
  );
}

export default function EventoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-triart-green border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EventoContent />
    </Suspense>
  );
}
