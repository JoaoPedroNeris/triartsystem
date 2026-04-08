"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { StandSummary, Occurrence } from "@/types/stand";
import { generateExcel } from "@/lib/export";

interface ExportButtonProps {
  stands: StandSummary[];
  occurrences: Occurrence[];
}

export function ExportButton({ stands, occurrences }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const buffer = await generateExcel(stands, occurrences);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `triart_relatorio_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      className="bg-triart-green hover:bg-triart-green-dark text-white rounded-xl h-10 px-4"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      Exportar Excel
    </Button>
  );
}
