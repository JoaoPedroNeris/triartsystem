import ExcelJS from "exceljs";
import { StandSummary, Occurrence } from "@/types/stand";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF2BA89D" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF228F85" } },
    };
  });
  row.height = 28;
}

export async function generateExcel(
  stands: StandSummary[],
  occurrences: Occurrence[]
): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Triart Estandes e Eventos";

  // ---- Sheet 1: Resumo ----
  const resumo = wb.addWorksheet("Resumo Geral");
  const avg = stands.length > 0
    ? Math.round(stands.reduce((a, s) => a + (s.progress?.overall ?? 0), 0) / stands.length)
    : 0;

  resumo.columns = [
    { header: "Metrica", key: "metrica", width: 30 },
    { header: "Valor", key: "valor", width: 20 },
  ];
  styleHeader(resumo.getRow(1));

  resumo.addRow({ metrica: "Total de Stands", valor: stands.length });
  resumo.addRow({ metrica: "Progresso Medio", valor: `${avg}%` });
  resumo.addRow({
    metrica: "Stands Concluidos (100%)",
    valor: stands.filter((s) => (s.progress?.overall ?? 0) === 100).length,
  });
  resumo.addRow({
    metrica: "Ocorrencias Abertas",
    valor: occurrences.filter((o) => o.status === "aberta").length,
  });
  resumo.addRow({
    metrica: "Ocorrencias Extremas Abertas",
    valor: occurrences.filter((o) => o.status === "aberta" && o.priority === "extrema").length,
  });

  // ---- Sheet 2: Stands ----
  const standsSheet = wb.addWorksheet("Stands");
  standsSheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Stand", key: "label", width: 25 },
    { header: "Eletrica %", key: "eletrica", width: 14 },
    { header: "Marcenaria %", key: "marcenaria", width: 14 },
    { header: "Tapecaria %", key: "tapecaria", width: 14 },
    { header: "Com. Visual %", key: "comVisual", width: 14 },
    { header: "Total %", key: "total", width: 12 },
    { header: "Ocorrencias Abertas", key: "occs", width: 20 },
  ];
  styleHeader(standsSheet.getRow(1));

  const sorted = [...stands].sort((a, b) => a.id - b.id);
  for (const s of sorted) {
    const standOccs = occurrences.filter(
      (o) => o.standId === s.id && o.status === "aberta"
    );
    standsSheet.addRow({
      id: s.id,
      label: s.label || `Stand ${s.id}`,
      eletrica: s.progress?.eletrica ?? 0,
      marcenaria: s.progress?.marcenaria ?? 0,
      tapecaria: s.progress?.tapecaria ?? 0,
      comVisual: s.progress?.comunicacaoVisual ?? 0,
      total: s.progress?.overall ?? 0,
      occs: standOccs.length,
    });
  }

  // ---- Sheet 3: Ocorrencias ----
  const occsSheet = wb.addWorksheet("Ocorrencias");
  occsSheet.columns = [
    { header: "Stand", key: "stand", width: 10 },
    { header: "Titulo", key: "title", width: 30 },
    { header: "Descricao", key: "desc", width: 40 },
    { header: "Prioridade", key: "priority", width: 14 },
    { header: "Status", key: "status", width: 14 },
    { header: "Data", key: "date", width: 20 },
  ];
  styleHeader(occsSheet.getRow(1));

  for (const o of occurrences) {
    occsSheet.addRow({
      stand: o.standId,
      title: o.title,
      desc: o.description,
      priority: o.priority.charAt(0).toUpperCase() + o.priority.slice(1),
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      date: o.createdAt ?? "",
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}
