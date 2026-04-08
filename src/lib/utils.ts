import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StandChecklist, ChecklistItem } from "@/types/stand";
import { StandStatus } from "@/types/map";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateCategoryProgress(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  const checked = items.filter((item) => item.checked).length;
  return Math.round((checked / items.length) * 100);
}

export function calculateOverallProgress(checklist: StandChecklist): number {
  const allItems = [
    ...checklist.eletrica,
    ...checklist.marcenaria,
    ...checklist.tapecaria,
    ...checklist.comunicacaoVisual,
  ];
  return calculateCategoryProgress(allItems);
}

export function getStandStatus(progress: number): StandStatus {
  if (progress === 0) return "none";
  if (progress < 33) return "red";
  if (progress < 67) return "yellow";
  return "green";
}

export function getStatusColor(status: StandStatus): string {
  switch (status) {
    case "red": return "rgba(239, 68, 68, 0.4)";
    case "yellow": return "rgba(234, 179, 8, 0.4)";
    case "green": return "rgba(34, 197, 94, 0.4)";
    default: return "rgba(43, 168, 157, 0.15)";
  }
}

export function getStatusHoverColor(status: StandStatus): string {
  switch (status) {
    case "red": return "rgba(239, 68, 68, 0.6)";
    case "yellow": return "rgba(234, 179, 8, 0.6)";
    case "green": return "rgba(34, 197, 94, 0.6)";
    default: return "rgba(43, 168, 157, 0.25)";
  }
}

export function coordsToPoints(coords: number[]): string {
  const points: string[] = [];
  for (let i = 0; i < coords.length; i += 2) {
    points.push(`${coords[i]},${coords[i + 1]}`);
  }
  return points.join(" ");
}

export function getPolygonCenter(coords: number[]): { x: number; y: number } {
  let xSum = 0;
  let ySum = 0;
  const count = coords.length / 2;
  for (let i = 0; i < coords.length; i += 2) {
    xSum += coords[i];
    ySum += coords[i + 1];
  }
  return { x: xSum / count, y: ySum / count };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
