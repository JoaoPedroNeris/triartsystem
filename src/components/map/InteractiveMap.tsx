"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MapSvgOverlay } from "./MapSvgOverlay";
import { MapControls } from "./MapControls";
import { StandSummary } from "@/types/stand";

interface InteractiveMapProps {
  stands: StandSummary[];
  selectedStandId: number | null;
  onStandClick: (id: number) => void;
}

export function InteractiveMap({ stands, selectedStandId, onStandClick }: InteractiveMapProps) {
  return (
    <div className="relative w-full h-full bg-triart-gray-light rounded-2xl overflow-hidden">
      <TransformWrapper
        initialScale={0.5}
        minScale={0.2}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.08 }}
        doubleClick={{ mode: "zoomIn" }}
      >
        <MapControls />
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "fit-content", height: "fit-content" }}
        >
          <div className="relative" style={{ pointerEvents: "auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/map.png"
              alt="Mapa da Feira"
              draggable={false}
              style={{ display: "block", maxWidth: "none" }}
            />
            <MapSvgOverlay
              stands={stands}
              selectedStandId={selectedStandId}
              onStandClick={onStandClick}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
