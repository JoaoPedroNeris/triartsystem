"use client";

import { standCoordinates, MAP_WIDTH, MAP_HEIGHT } from "@/data/standCoordinates";
import { StandPolygon } from "./StandPolygon";
import { StandSummary } from "@/types/stand";
import { getStandStatus } from "@/lib/utils";

interface MapSvgOverlayProps {
  stands: StandSummary[];
  selectedStandId: number | null;
  onStandClick: (id: number) => void;
}

export function MapSvgOverlay({ stands, selectedStandId, onStandClick }: MapSvgOverlayProps) {
  const standsMap = new Map(stands.map((s) => [s.id, s]));

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      {standCoordinates.map((sc) => {
        const standData = standsMap.get(sc.id);
        const progress = standData?.progress?.overall ?? 0;
        const status = getStandStatus(progress);
        const label = standData?.label || sc.label || `Stand ${sc.id}`;

        return (
          <StandPolygon
            key={sc.id}
            id={sc.id}
            coords={sc.coords}
            label={label}
            status={status}
            isSelected={selectedStandId === sc.id}
            onClick={onStandClick}
          />
        );
      })}
    </svg>
  );
}
