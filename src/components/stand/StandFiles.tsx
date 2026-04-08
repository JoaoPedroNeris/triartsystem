"use client";

import { useState } from "react";
import { StandFile, DriveLink } from "@/types/stand";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Trash2,
  FileText,
  Download,
  ExternalLink,
  Link2,
  Plus,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StandFilesProps {
  standId: number;
  files: StandFile[];
  driveLinks: DriveLink[];
  readOnly: boolean;
  onRefresh: () => Promise<void>;
}

export function StandFiles({
  standId,
  files,
  driveLinks,
  readOnly,
  onRefresh,
}: StandFilesProps) {
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  async function handleDeleteFile(f: StandFile) {
    await fetch(`/api/stands/${standId}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fileId: f.id }),
    });
    await onRefresh();
  }

  async function handleAddLink() {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    await fetch(`/api/stands/${standId}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: linkTitle.trim(), url: linkUrl.trim() }),
    });
    setLinkTitle("");
    setLinkUrl("");
    await onRefresh();
  }

  async function handleRemoveLink(id: number) {
    await fetch(`/api/stands/${standId}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ driveLinkId: id }),
    });
    await onRefresh();
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-triart-black flex items-center gap-2">
          <FileText className="w-4 h-4 text-triart-green" />
          Arquivos
        </h3>
        {!readOnly && (
          <div>
            <Button
              disabled
              variant="outline"
              className="w-full h-10 rounded-xl border-dashed border-2 border-triart-green/30 text-triart-gray hover:bg-triart-green/5 cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload desabilitado (migracao em andamento)
            </Button>
          </div>
        )}

        {files.length === 0 ? (
          <p className="text-xs text-triart-gray text-center py-4">Nenhum arquivo enviado.</p>
        ) : (
          <div className="space-y-1">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-triart-gray-light/50 transition-apple">
                <FileText className="w-5 h-5 text-triart-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-triart-black truncate">{f.name}</p>
                  <p className="text-[10px] text-triart-gray">
                    {formatFileSize(f.size)} &middot;{" "}
                    {f.uploadedAt
                      ? format(new Date(f.uploadedAt), "dd MMM yyyy", { locale: ptBR })
                      : ""}
                  </p>
                </div>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 w-8 h-8 bg-triart-green/10 rounded-lg flex items-center justify-center hover:bg-triart-green/20 transition-apple"
                >
                  <Download className="w-4 h-4 text-triart-green" />
                </a>
                {!readOnly && (
                  <button
                    onClick={() => handleDeleteFile(f)}
                    className="shrink-0 text-triart-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drive Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-triart-black flex items-center gap-2">
          <Link2 className="w-4 h-4 text-triart-green" />
          Links do Drive
        </h3>
        {!readOnly && (
          <div className="flex gap-2">
            <Input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Titulo"
              className="flex-1 h-9 bg-triart-gray-light/50 border-0 rounded-xl text-sm"
            />
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL do Drive"
              className="flex-1 h-9 bg-triart-gray-light/50 border-0 rounded-xl text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            />
            <button
              onClick={handleAddLink}
              disabled={!linkTitle.trim() || !linkUrl.trim()}
              className="h-9 w-9 bg-triart-green hover:bg-triart-green-dark text-white rounded-xl flex items-center justify-center shrink-0 transition-apple disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {driveLinks.length === 0 ? (
          <p className="text-xs text-triart-gray text-center py-4">Nenhum link adicionado.</p>
        ) : (
          <div className="space-y-1">
            {driveLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-triart-gray-light/50 transition-apple">
                <ExternalLink className="w-4 h-4 text-triart-green shrink-0" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-triart-green hover:underline truncate"
                >
                  {link.title}
                </a>
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveLink(link.id)}
                    className="shrink-0 text-triart-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
