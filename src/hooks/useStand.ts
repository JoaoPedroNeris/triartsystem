"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StandDocument,
  PhotoDocument,
  Occurrence,
  StandFile,
} from "@/types/stand";

interface UseStandReturn {
  stand: StandDocument | null;
  photos: PhotoDocument[];
  occurrences: Occurrence[];
  files: StandFile[];
  loading: boolean;
  updateField: (field: string, value: unknown) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useStand(standId: number | null): UseStandReturn {
  const [stand, setStand] = useState<StandDocument | null>(null);
  const [photos, setPhotos] = useState<PhotoDocument[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [files, setFiles] = useState<StandFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!standId) {
      setStand(null);
      setPhotos([]);
      setOccurrences([]);
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/stands/${standId}`, { credentials: "include" });

      if (!res.ok) {
        console.error("Failed to fetch stand:", res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const s = data.stand;

      if (s) {
        setStand({
          id: s.id,
          label: s.label || "",
          notes: s.notes || "",
          updatedAt: s.updatedAt,
          updatedBy: s.updatedBy,
          checklist: s.checklist ?? {
            eletrica: [],
            marcenaria: [],
            tapecaria: [],
            comunicacaoVisual: [],
          },
          materials: s.materials ?? [],
          team: s.team ?? { marcenaria: [], producao: [] },
          driveLinks: s.driveLinks ?? [],
          progress: s.progress ?? {
            eletrica: 0,
            marcenaria: 0,
            tapecaria: 0,
            comunicacaoVisual: 0,
            overall: 0,
          },
        });
        setOccurrences(s.occurrences ?? []);
        setPhotos(s.photos ?? []);
        setFiles(s.files ?? []);
      }
    } catch (err) {
      console.error("Error fetching stand:", err);
    } finally {
      setLoading(false);
    }
  }, [standId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateField = useCallback(
    async (field: string, value: unknown) => {
      if (!standId) return;
      await fetch(`/api/stands/${standId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });
    },
    [standId]
  );

  return { stand, photos, occurrences, files, loading, updateField, refresh: fetchAll };
}
