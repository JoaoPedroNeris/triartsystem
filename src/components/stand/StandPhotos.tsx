"use client";

import { useState } from "react";
import { PhotoDocument } from "@/types/stand";
import { Camera, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StandPhotosProps {
  standId: number;
  photos: PhotoDocument[];
  readOnly: boolean;
  onRefresh: () => Promise<void>;
}

export function StandPhotos({ standId, photos, readOnly, onRefresh }: StandPhotosProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(photo: PhotoDocument) {
    setDeleting(photo.id);
    try {
      await fetch(`/api/stands/${standId}/photos?photoId=${photo.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await onRefresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div>
          <Button
            disabled
            variant="outline"
            className="rounded-xl border-dashed border-2 border-triart-green/30 text-triart-gray h-12 w-full cursor-not-allowed"
          >
            <Camera className="w-4 h-4 mr-2" />
            Upload desabilitado (migracao em andamento)
          </Button>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-triart-gray text-center py-8">Nenhuma foto adicionada.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-triart-gray-light">
              <button
                onClick={() => setPreview(photo.url)}
                className="w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Foto do stand"
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-[10px] text-white/80">
                  {photo.uploadedAt
                    ? format(new Date(photo.uploadedAt), "dd MMM yyyy, HH:mm", { locale: ptBR })
                    : ""}
                </p>
              </div>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(photo)}
                  disabled={deleting === photo.id}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
