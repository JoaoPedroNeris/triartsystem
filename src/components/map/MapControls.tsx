"use client";

import { useControls } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

export function MapControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-20 flex flex-col gap-1.5 sm:gap-2">
      <button
        onClick={() => zoomIn()}
        className="w-10 h-10 glass rounded-xl shadow-lg border border-black/5 flex items-center justify-center hover:bg-white transition-apple"
        title="Zoom in"
      >
        <ZoomIn className="w-5 h-5 text-triart-black" />
      </button>
      <button
        onClick={() => zoomOut()}
        className="w-10 h-10 glass rounded-xl shadow-lg border border-black/5 flex items-center justify-center hover:bg-white transition-apple"
        title="Zoom out"
      >
        <ZoomOut className="w-5 h-5 text-triart-black" />
      </button>
      <button
        onClick={() => resetTransform()}
        className="w-10 h-10 glass rounded-xl shadow-lg border border-black/5 flex items-center justify-center hover:bg-white transition-apple"
        title="Resetar zoom"
      >
        <Maximize className="w-5 h-5 text-triart-black" />
      </button>
    </div>
  );
}
