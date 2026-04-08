"use client";

import { useEffect, useState, useCallback } from "react";
import { StandSummary } from "@/types/stand";

export function useStands() {
  const [stands, setStands] = useState<StandSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStands = useCallback(async () => {
    try {
      const res = await fetch("/api/stands", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStands(data.stands);
      }
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStands();
  }, [fetchStands]);

  return { stands, loading, refresh: fetchStands };
}
