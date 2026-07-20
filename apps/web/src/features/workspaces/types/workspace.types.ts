export interface WorkspaceSummary {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  status: string;
}

export interface WorkspaceResponse extends WorkspaceSummary {
  description?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
