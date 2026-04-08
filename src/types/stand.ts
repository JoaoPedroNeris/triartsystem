export interface ChecklistItem {
  id: number;
  label: string;
  checked: boolean;
  checkedAt?: string;
  checkedBy?: string;
}

export interface StandChecklist {
  eletrica: ChecklistItem[];
  marcenaria: ChecklistItem[];
  tapecaria: ChecklistItem[];
  comunicacaoVisual: ChecklistItem[];
}

export interface StandProgress {
  eletrica: number;
  marcenaria: number;
  tapecaria: number;
  comunicacaoVisual: number;
  overall: number;
}

export interface Material {
  id: number;
  name: string;
  quantity: number;
  confirmed: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface DriveLink {
  id: number;
  title: string;
  url: string;
  addedAt: string;
  addedBy: string;
}

export interface StandTeam {
  marcenaria: string[];
  producao: string[];
}

export interface StandDocument {
  id: number;
  label: string;
  notes: string;
  updatedAt?: string;
  updatedBy?: string;
  checklist: StandChecklist;
  materials: Material[];
  team: StandTeam;
  driveLinks: DriveLink[];
  progress: StandProgress;
}

export interface StandSummary {
  id: number;
  label: string;
  notes: string;
  progress: StandProgress;
}

export interface PhotoDocument {
  id: number;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Occurrence {
  id: number;
  standId: number;
  title: string;
  description: string;
  priority: "leve" | "media" | "extrema";
  status: "aberta" | "resolvida";
  createdAt: string;
  createdBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface StandFile {
  id: number;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}
