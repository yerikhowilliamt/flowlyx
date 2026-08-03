export interface ProjectSummary {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  status: string;
  description?: string | null;
}

export interface ProjectResponse extends ProjectSummary {
  description?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
