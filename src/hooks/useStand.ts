"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StandDocument,
  PhotoDocument,
  Occurrence,
  StandFile,
  StandChecklist,
  Material,
  StandTeam,
  DriveLink,
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
      const [standRes, checklistRes, materialsRes, teamRes, occRes, photosRes, filesRes] =
        await Promise.all([
          fetch(`/api/stands/${standId}`, { credentials: "include" }),
          fetch(`/api/stands/${standId}/checklist`, { credentials: "include" }),
          fetch(`/api/stands/${standId}/materials`, { credentials: "include" }),
          fetch(`/api/stands/${standId}/team`, { credentials: "include" }),
          fetch(`/api/stands/${standId}/occurrences`, { credentials: "include" }),
          fetch(`/api/stands/${standId}/photos`, { credentials: "include" }),
          fetch(`/api/stands/${standId}/files`, { credentials: "include" }),
        ]);

      const standData = standRes.ok ? await standRes.json() : null;
      const checklistData = checklistRes.ok ? await checklistRes.json() : null;
      const materialsData = materialsRes.ok ? await materialsRes.json() : null;
      const teamData = teamRes.ok ? await teamRes.json() : null;
      const occData = occRes.ok ? await occRes.json() : null;
      const photosData = photosRes.ok ? await photosRes.json() : null;
      const filesData = filesRes.ok ? await filesRes.json() : null;

      if (standData) {
        const checklist: StandChecklist = checklistData?.checklist ?? {
          eletrica: [],
          marcenaria: [],
          tapecaria: [],
          comunicacaoVisual: [],
        };
        const materials: Material[] = materialsData?.materials ?? [];
        const team: StandTeam = teamData?.team ?? { marcenaria: [], producao: [] };
        const driveLinks: DriveLink[] = filesData?.driveLinks ?? [];

        setStand({
          ...standData.stand,
          checklist,
          materials,
          team,
          driveLinks,
        });
      }

      setOccurrences(occData?.occurrences ?? []);
      setPhotos(photosData?.photos ?? []);
      setFiles(filesData?.files ?? []);
    } catch {
      // ignore fetch errors
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
